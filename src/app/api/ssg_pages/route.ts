import { NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

export async function GET() {
    try {
        const response = await fetch(`${DIRECTUS_URL}/items/ssg_page`, {
            headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Directus API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data.data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch SSG pages' },
            { status: 500 }
        );
    }
}