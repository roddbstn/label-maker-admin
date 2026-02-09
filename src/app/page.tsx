import AdminDashboard from '@/components/AdminDashboard';
import { Submission } from '@/types/submission';

export const dynamic = 'force-dynamic';

async function getSubmissions(): Promise<{ data: Submission[]; error: string | null }> {
  // 환경변수가 비어있거나 설정되지 않은 경우를 대비해 더 강력한 폴백 처리
  let API_URL = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  if (!API_URL || API_URL === 'undefined' || !API_URL.startsWith('http')) {
    API_URL = 'https://label-maker-olive.vercel.app';
  }

  console.log(`[Admin] Fetching from API: ${API_URL}/api/submissions`);

  try {
    const res = await fetch(`${API_URL}/api/submissions`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { data: [], error: `API 오류 (${res.status}) - 대상: ${API_URL}` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    console.error('[Admin Error] Data fetching failed:', error);
    return { data: [], error: `서버와 연결할 수 없습니다. (${API_URL})` };
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
