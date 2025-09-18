import Link from 'next/link';
import './ssg_page.css';

interface SSGPage {
    id: number;
    title: string;
    date_created: string;
    date_updated?: string;
    ssg_sections: number[];
}

interface SSGSection {
    id: number;
    radio_button: string;
    page_id: number;
    date_created: string;
    date_updated?: string;
}

// Static Site Generation - runs at build time
export async function generateStaticParams() {
    const response = await fetch(`${process.env.DIRECTUS_URL}/items/ssg_page`, {
        headers: {
            'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}`,
        },
    });
    const data = await response.json();

    return data.data.map((page: SSGPage) => ({
        id: page.id.toString(),
    }));
}

async function getSSGPageData(id: string) {
    const [pageResponse, sectionsResponse] = await Promise.all([
        fetch(`${process.env.DIRECTUS_URL}/items/ssg_page/${id}`, {
            headers: { 'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}` },
        }),
        fetch(`${process.env.DIRECTUS_URL}/items/ssg_section?filter[page_id][_eq]=${id}`, {
            headers: { 'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}` },
        }),
    ]);

    const page = await pageResponse.json();
    const sections = await sectionsResponse.json();

    return {
        page: page.data,
        sections: sections.data,
    };
}

export default async function SSGPageDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { page, sections } = await getSSGPageData(id);

    if (!page) {
        return <div className="ssg-error">SSG Page not found</div>;
    }

    return (
        <div className="ssg-container">
            <nav className="ssg-breadcrumb">
                <Link href="/">← Back to All Pages</Link>
            </nav>

            <article className="ssg-page-content">
                <header>
                    <h1>{page.title} (SSG)</h1>
                    <div className="ssg-page-meta">
                        <span className="ssg-status">Type: Static Site Generation</span>
                        <span className="ssg-date">
              Created: {new Date(page.date_created).toLocaleDateString()}
            </span>
                        {page.date_updated && (
                            <span className="ssg-date">
                Updated: {new Date(page.date_updated).toLocaleDateString()}
              </span>
                        )}
                    </div>
                </header>

                <section className="ssg-sections">
                    <h2>SSG Sections ({sections.length})</h2>

                    <div className="ssg-sections-list">
                        {sections.map((section: SSGSection) => (
                            <div key={section.id} className="ssg-section-card">
                                <h3>Section #{section.id}</h3>

                                <div className="ssg-section-radio">
                                    <h4>Radio Button Selection:</h4>
                                    <div className="ssg-radio-display">
                    <span className="ssg-radio-tag">
                      {section.radio_button}
                    </span>
                                    </div>
                                </div>

                                <div className="ssg-section-meta">
                                    <small>
                                        Created: {new Date(section.date_created).toLocaleDateString()}
                                        {section.date_updated && (
                                            <> • Updated: {new Date(section.date_updated).toLocaleDateString()}</>
                                        )}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </article>
        </div>
    );
}