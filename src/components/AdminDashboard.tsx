'use client';

import { useState } from 'react';
import { Submission } from '../types/submission';

export default function AdminDashboard({ initialSubmissions }: { initialSubmissions: Submission[] }) {
    const [filter, setFilter] = useState<'all' | 'waitlist' | 'feedback'>('all');

    const filteredSubmissions = initialSubmissions.filter(sub =>
        filter === 'all' ? true : sub.type === filter
    );

    const exportToCSV = () => {
        const headers = ['날짜', '구분', '이메일', '피드백', '기관명'];
        const rows = filteredSubmissions.map(sub => [
            new Date(sub.createdAt).toLocaleString('ko-KR'),
            sub.type === 'waitlist' ? '알림신청' : '피드백',
            sub.email || '',
            sub.feedback || '',
            sub.organization || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">사용자 문의 및 피드백 내역 (Enhanced)</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Total: {filteredSubmissions.length}</span>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <span>📊</span> Sheets로 내보내기 (CSV)
                    </button>
                </div>
            </header>

            <div className="mb-6 flex gap-2">
                {(['all', 'waitlist', 'feedback'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === type
                            ? 'bg-[#222222] text-white'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {type === 'all' ? '전체' : type === 'waitlist' ? '알림신청' : '피드백'}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">날짜</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">구분</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">이메일 / 피드백</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">기관명</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            {new Date(sub.createdAt).toLocaleString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-md ${sub.type === 'waitlist'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {sub.type === 'waitlist' ? '알림신청' : '피드백'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 max-w-md">
                                            {sub.type === 'waitlist' ? sub.email : (
                                                <div className="whitespace-pre-wrap">{sub.feedback}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {sub.organization || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
