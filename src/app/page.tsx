import AdminDashboard from '@/components/AdminDashboard';
import { Submission } from '@/types/submission';

export const dynamic = 'force-dynamic';

async function getSubmissions(): Promise<Submission[]> {
  // Production URL as default, can be overridden with NEXT_PUBLIC_API_URL env var
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://label-maker-olive.vercel.app';

  try {
    const res = await fetch(`${API_URL}/api/submissions`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

export default async function Home() {
  const submissions = await getSubmissions();
  const sortedSubmissions = [...submissions].reverse();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <AdminDashboard initialSubmissions={sortedSubmissions} />
    </main>
  );
}
