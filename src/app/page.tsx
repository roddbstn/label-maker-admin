import AdminDashboard from '@/components/AdminDashboard';
import { Submission } from '@/types/submission';

export const dynamic = 'force-dynamic';

async function getSubmissions(): Promise<{ data: Submission[]; error: string | null }> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://label-maker-olive.vercel.app';

  try {
    const res = await fetch(`${API_URL}/api/submissions`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { data: [], error: `API 오류 (${res.status})` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    console.error('[Admin Error] Data fetching failed:', error);
    return { data: [], error: '서버와 연결할 수 없습니다.' };
  }
}

export default async function Home() {
  const { data: submissions, error } = await getSubmissions();
  const sortedSubmissions = [...submissions].reverse();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <AdminDashboard initialSubmissions={sortedSubmissions} error={error} />
    </main>
  );
}
