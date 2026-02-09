'use client';

import { useState, useMemo } from 'react';
import { Submission } from '../types/submission';

export default function AdminDashboard({
    initialSubmissions,
    error = null
}: {
    initialSubmissions: Submission[];
    error?: string | null;
}) {
    const [filter, setFilter] = useState<'all' | 'waitlist' | 'feedback'>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // 날짜 필터링 + 타입 필터링 + 정렬
    const filteredSubmissions = useMemo(() => {
        return initialSubmissions
            .filter(sub => filter === 'all' ? true : sub.type === filter)
            .filter(sub => {
                if (!startDate) return true;
                const subDate = new Date(sub.createdAt);
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = endDate ? new Date(endDate) : new Date(startDate);
                end.setHours(23, 59, 59, 999);
                return subDate >= start && subDate <= end;
            })
            .sort((a, b) => {
                const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                return sortOrder === 'desc' ? diff : -diff;
            });
    }, [initialSubmissions, filter, startDate, endDate, sortOrder]);

    // 페이지네이션 계산
    const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE));
    const paginatedSubmissions = filteredSubmissions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // 필터 변경 시 페이지 리셋
    const handleFilterChange = (newFilter: 'all' | 'waitlist' | 'feedback') => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        if (type === 'start') {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
        setCurrentPage(1);
    };

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        setCurrentPage(1);
    };

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

            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">⚠️</span> {error}
                </div>
            )}

            {/* 날짜 필터 + 정렬 */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-sm text-slate-500">📅</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="text-sm border-none outline-none bg-transparent"
                    />
                    <span className="text-slate-400">~</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="text-sm border-none outline-none bg-transparent"
                    />
                    {(startDate || endDate) && (
                        <button
                            onClick={clearDateFilter}
                            className="ml-1 text-xs text-slate-400 hover:text-red-500"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <button
                    onClick={toggleSortOrder}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
                >
                    정렬: {sortOrder === 'desc' ? '최신순 ↓' : '오래된순 ↑'}
                </button>
            </div>

            {/* 타입 필터 */}
            <div className="mb-6 flex gap-2">
                {(['all', 'waitlist', 'feedback'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => handleFilterChange(type)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === type
                            ? 'bg-[#222222] text-white'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {type === 'all' ? '전체' : type === 'waitlist' ? '알림신청' : '피드백'}
                    </button>
                ))}
            </div>

            {/* 테이블 */}
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
                            {paginatedSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                paginatedSubmissions.map((sub) => (
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

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        ← 이전
                    </button>
                    <span className="text-sm text-slate-600">
                        페이지 {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        다음 →
                    </button>
                </div>
            )}
        </div>
    );
}
