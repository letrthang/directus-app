import Link from 'next/link';
import './ssr_page.css';

interface SSRPage {
    id: number;
    title: string;
    date_created: string;
    date_updated?: string;
    ssr_sections: number[];
}

interface SSRSection {
    id: number;
    text_editor: {
        time: number;
        blocks: Array<{
            id: string;
            type: string;
            data: {
                text: string;
            };
        }>;
        version: string;
    };
    page_id: string;
    date_created: string;
    date_updated?: string;
}

// Server-Side Rendering - runs on each request
async function getSSRPageData(id: string) {
    try {
        const [pageResponse, sectionsResponse] = await Promise.all([
            fetch(`${process.env.DIRECTUS_URL}/items/ssr_page/${id}`, {
                headers: { 'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}` },
                cache: 'no-store', // Always fresh data
            }),
            fetch(`${process.env.DIRECTUS_URL}/items/ssr_section?filter[page_id][_eq]=${id}`, {
                headers: { 'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}` },
                cache: 'no-store',
            }),
        ]);

        if (!pageResponse.ok) {
            return null;
        }

        const page = await pageResponse.json();
        const sections = await sectionsResponse.json();

        return {
            page: page.data,
            sections: sections.data,
        };
    } catch (error) {
        console.error('Error fetching SSR data:', error);
        return null;
    }
}

export default async function SSRPageDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSSRPageData(id);

    if (!data) {
        return <div className="ssr-error">SSR Page not found</div>;
    }

    const { page, sections } = data;

    const renderTextEditor = (editorData: any) => {
        if (!editorData || !editorData.blocks) return 'No content';

        return editorData.blocks.map((block: any, index: number) => (
            <div key={index} className="ssr-editor-block">
                {block.data.text}
            </div>
        ));
    };

    return (
        <div className="ssr-container">
            <nav className="ssr-breadcrumb">
                <Link href="/">← Back to All Pages</Link>
            </nav>

            <article className="ssr-page-content">
                <header>
                    <h1>{page.title} (SSR)</h1>
                    <div className="ssr-page-meta">
                        <span className="ssr-status">Type: Server-Side Rendering</span>
                        <span className="ssr-date">
              Created: {new Date(page.date_created).toLocaleDateString()}
            </span>
                        {page.date_updated && (
                            <span className="ssr-date">
                Updated: {new Date(page.date_updated).toLocaleDateString()}
              </span>
                        )}
                    </div>
                </header>

                <section className="ssr-sections">
                    <h2>SSR Sections ({sections.length})</h2>

                    <div className="ssr-sections-list">
                        {sections.map((section: SSRSection) => (
                            <div key={section.id} className="ssr-section-card">
                                <h3>Section #{section.id}</h3>

                                <div className="ssr-section-editor">
                                    <h4>Text Editor Content:</h4>
                                    <div className="ssr-editor-content">
                                        {renderTextEditor(section.text_editor)}
                                    </div>
                                </div>

                                <div className="ssr-section-meta">
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