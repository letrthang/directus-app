'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Page {
    id: number;
    title: string;
    status: string;
    date_created: string;
    date_updated?: string;
    sections: number[];
}

interface SSGPage {
    id: number;
    title: string;
    date_created: string;
    date_updated?: string;
    ssg_sections: number[];
}

interface SSRPage {
    id: number;
    title: string;
    date_created: string;
    date_updated?: string;
    ssr_sections: number[];
}

export default function Home() {
    const [pages, setPages] = useState<Page[]>([]);
    const [ssgPages, setSSGPages] = useState<SSGPage[]>([]);
    const [ssrPages, setSSRPages] = useState<SSRPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAllPages();
    }, []);

    const fetchAllPages = async () => {
        try {
            setLoading(true);

            // Fetch all page types
            const [pagesResponse, ssgResponse, ssrResponse] = await Promise.all([
                fetch('/api/pages'),
                fetch('/api/ssg_pages'),
                fetch('/api/ssr_pages')
            ]);

            if (!pagesResponse.ok || !ssgResponse.ok || !ssrResponse.ok) {
                throw new Error('Failed to fetch pages');
            }

            const [pagesData, ssgData, ssrData] = await Promise.all([
                pagesResponse.json(),
                ssgResponse.json(),
                ssrResponse.json()
            ]);

            setPages(pagesData);
            setSSGPages(ssgData);
            setSSRPages(ssrData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading pages...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="container">
            <h1>All Pages</h1>

            {/* Original CSR Pages */}
            <section className="page-section">
                <h2>CSR Pages (Client-Side Rendering)</h2>
                <div className="pages-grid">
                    {pages.map((page) => (
                        <div key={page.id} className="page-card csr-card">
                            <h3>
                                <Link href={`/page/${page.id}`}>
                                    {page.title}
                                </Link>
                            </h3>
                            <p className="page-type">Type: CSR</p>
                            <p className="status">Status: {page.status}</p>
                            <p className="sections-count">
                                Total Sections: {page.sections ? page.sections.length : 0}
                            </p>
                            <p className="date">
                                Created: {new Date(page.date_created).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SSG Pages */}
            <section className="page-section">
                <h2>SSG Pages (Static Site Generation)</h2>
                <div className="pages-grid">
                    {ssgPages.map((page) => (
                        <div key={page.id} className="page-card ssg-card">
                            <h3>
                                <Link href={`/ssg_page/${page.id}`}>
                                    {page.title}
                                </Link>
                            </h3>
                            <p className="page-type">Type: SSG</p>
                            <p className="sections-count">
                                Total Sections: {page.ssg_sections ? page.ssg_sections.length : 0}
                            </p>
                            <p className="date">
                                Created: {new Date(page.date_created).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SSR Pages */}
            <section className="page-section">
                <h2>SSR Pages (Server-Side Rendering)</h2>
                <div className="pages-grid">
                    {ssrPages.map((page) => (
                        <div key={page.id} className="page-card ssr-card">
                            <h3>
                                <Link href={`/ssr_page/${page.id}`}>
                                    {page.title}
                                </Link>
                            </h3>
                            <p className="page-type">Type: SSR</p>
                            <p className="sections-count">
                                Total Sections: {page.ssr_sections ? page.ssr_sections.length : 0}
                            </p>
                            <p className="date">
                                Created: {new Date(page.date_created).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    font-family: Arial, sans-serif;
                }

                h1 {
                    color: #333;
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .page-section {
                    margin-bottom: 3rem;
                }

                .page-section h2 {
                    color: #374151;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #e5e7eb;
                }

                .pages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .page-card {
                    border-radius: 8px;
                    padding: 1.5rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .page-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .csr-card {
                    background: #f9f9f9;
                    border: 1px solid #ddd;
                }

                .ssg-card {
                    background: #f0fdf4;
                    border: 1px solid #10b981;
                }

                .ssr-card {
                    background: #fffbeb;
                    border: 1px solid #f59e0b;
                }

                .page-card h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                }

                .csr-card h3 a { color: #2563eb; }
                .ssg-card h3 a { color: #059669; }
                .ssr-card h3 a { color: #d97706; }

                .page-card h3 a {
                    text-decoration: none;
                }

                .page-card h3 a:hover {
                    text-decoration: underline;
                }

                .page-type {
                    font-weight: 600;
                    font-size: 0.85rem;
                    margin: 0.5rem 0;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .csr-card .page-type {
                    background: #2563eb;
                    color: white;
                }

                .ssg-card .page-type {
                    background: #10b981;
                    color: white;
                }

                .ssr-card .page-type {
                    background: #f59e0b;
                    color: white;
                }

                .status, .sections-count, .date {
                    color: #666;
                    font-size: 0.9rem;
                    margin: 0.5rem 0;
                }

                .sections-count {
                    font-weight: bold;
                }

                .csr-card .sections-count { color: #2563eb; }
                .ssg-card .sections-count { color: #059669; }
                .ssr-card .sections-count { color: #d97706; }

                .loading, .error {
                    text-align: center;
                    padding: 2rem;
                    font-size: 1.1rem;
                }

                .error {
                    color: #dc2626;
                }

                .loading {
                    color: #2563eb;
                }
            `}</style>
        </div>
    );
}