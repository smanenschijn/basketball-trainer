import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { Play } from '@/types';

const PlayPreview = lazy(() => import('@/Components/Plays/PlayPreview'));

const ArrowLeftIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const PencilIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const CourtIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const PeopleIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default function Show({ play }: { play: Play }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout>
            <Head title={play.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    href={route('plays.index')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-600 transition hover:text-brand-black"
                >
                    <ArrowLeftIcon />
                    {t('plays.backToPlays')}
                </Link>

                {/* Title + actions */}
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                        {play.title}
                    </h1>
                    <Link
                        href={route('plays.edit', play.id)}
                        className="inline-flex shrink-0 items-center gap-2 border-3 border-brand-black bg-brand-gold px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-black transition hover:bg-yellow-400"
                    >
                        <PencilIcon />
                        {t('common.edit')}
                    </Link>
                </div>

                {/* Metadata bar */}
                <div className="mt-4 grid grid-cols-2 border-3 border-brand-black bg-brand-gold text-brand-black sm:max-w-md">
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

                {/* Play canvas */}
                <div className="mt-6 border-3 border-brand-black bg-white shadow-brutal">
                    <Suspense fallback={<div className="flex h-96 items-center justify-center text-gray-400">{t('common.loading')}...</div>}>
                        <PlayPreview
                            canvasData={play.canvas_data}
                            courtType={play.court_type}
                        />
                    </Suspense>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
