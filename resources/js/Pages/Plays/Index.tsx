import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { PaginatedData, Play } from '@/types';

const PlayPreview = lazy(() => import('@/Components/Plays/PlayPreview'));

const PlusIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const PencilIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CourtIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const PeopleIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default function Index({ plays }: { plays: PaginatedData<Play> }) {
    const { t } = useTranslation();
    const { auth } = usePage().props as { auth: { user: { is_admin: boolean } } };

    const handleDelete = (play: Play) => {
        if (confirm(t('plays.confirmDelete'))) {
            router.delete(route('plays.destroy', play.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('plays.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                            {t('plays.title')}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {t('plays.playCount', { count: plays.total })}
                        </p>
                    </div>
                    {auth.user.is_admin && (
                        <Link
                            href={route('plays.create')}
                            className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400"
                        >
                            <PlusIcon />
                            {t('plays.newPlay')}
                        </Link>
                    )}
                </div>

                {plays.data.length === 0 ? (
                    <div className="border-3 border-dashed border-gray-300 py-16 text-center">
                        <CourtIcon />
                        <p className="mt-4 text-lg font-bold text-gray-400">{t('plays.noPlays')}</p>
                        <p className="mt-1 text-sm text-gray-400">{t('plays.noPlaysDescription')}</p>
                        {auth.user.is_admin && (
                            <Link
                                href={route('plays.create')}
                                className="mt-6 inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400"
                            >
                                <PlusIcon />
                                {t('plays.newPlay')}
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {plays.data.map((play) => (
                            <div key={play.id} className="flex flex-col overflow-hidden border-3 border-brand-black bg-white shadow-brutal">
                                {/* Black header */}
                                <div className="bg-brand-black px-4 py-3">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-brand-gold truncate">
                                        {play.title}
                                    </h3>
                                </div>

                                {/* Gold metadata bar */}
                                <div className="grid grid-cols-2 bg-brand-gold text-brand-black">
                                    <div className="flex items-center gap-2 border-r border-brand-black/20 px-4 py-2">
                                        <CourtIcon />
                                        <span className="text-sm font-bold">
                                            {play.court_type === 'half' ? t('plays.halfCourt') : t('plays.fullCourt')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2">
                                        <PeopleIcon />
                                        <span className="text-sm font-bold">
                                            {play.canvas_data.players.length} {t('plays.addPlayer').toLowerCase().split(' ').pop()}
                                        </span>
                                    </div>
                                </div>

                                {/* Preview */}
                                <Link href={route('plays.show', play.id)} className="block">
                                    <Suspense fallback={<div className="h-48 bg-gray-50 animate-pulse" />}>
                                        <PlayPreview
                                            canvasData={play.canvas_data}
                                            courtType={play.court_type}
                                        />
                                    </Suspense>
                                </Link>

                                {/* Actions */}
                                {auth.user.is_admin && (
                                    <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-3">
                                        <Link
                                            href={route('plays.edit', play.id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-black hover:text-brand-gold transition"
                                        >
                                            <PencilIcon />
                                            {t('common.edit')}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(play)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 transition"
                                        >
                                            <TrashIcon />
                                            {t('common.delete')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
