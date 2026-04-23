import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { PaginatedData, Play } from '@/types';

const PlayPreview = lazy(() => import('@/Components/Plays/PlayPreview'));

export default function Index({ plays }: { plays: PaginatedData<Play> }) {
    const { t } = useTranslation();

    const handleDelete = (play: Play) => {
        if (confirm(t('plays.confirmDelete'))) {
            router.delete(route('plays.destroy', play.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('plays.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('plays.title')}</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {t('plays.playCount', { count: plays.total })}
                        </p>
                    </div>
                    <Link
                        href={route('plays.create')}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-black px-5 py-2.5 text-sm font-bold text-brand-gold hover:bg-gray-800 transition"
                    >
                        + {t('plays.newPlay')}
                    </Link>
                </div>

                {plays.data.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('plays.noPlays')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('plays.noPlaysDescription')}</p>
                        <Link
                            href={route('plays.create')}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-black px-5 py-2.5 text-sm font-bold text-brand-gold hover:bg-gray-800 transition"
                        >
                            + {t('plays.newPlay')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {plays.data.map((play) => (
                            <div key={play.id} className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                                <Link href={route('plays.edit', play.id)} className="block">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900 truncate">{play.title}</h3>
                                        <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                            {play.court_type === 'half' ? t('plays.halfCourt') : t('plays.fullCourt')}
                                        </span>
                                    </div>
                                    <Suspense fallback={<div className="h-32 bg-gray-50 rounded animate-pulse" />}>
                                        <PlayPreview
                                            canvasData={play.canvas_data}
                                            courtType={play.court_type}
                                            width={250}
                                        />
                                    </Suspense>
                                    <div className="mt-2 text-xs text-gray-400">
                                        {play.canvas_data.players.length} players · {play.canvas_data.lines.length} lines
                                    </div>
                                </Link>
                                <div className="mt-3 flex gap-2">
                                    <Link
                                        href={route('plays.edit', play.id)}
                                        className="text-xs font-medium text-brand-black hover:underline"
                                    >
                                        {t('common.edit')}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(play)}
                                        className="text-xs font-medium text-red-600 hover:underline"
                                    >
                                        {t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
