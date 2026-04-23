import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { Play } from '@/types';

const PlayDesigner = lazy(() => import('@/Components/Plays/PlayDesigner'));

export default function Show({ play }: { play: Play }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout>
            <Head title={play.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link
                            href={route('plays.index')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            &larr; {t('plays.backToPlays')}
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900">{play.title}</h1>
                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {play.court_type === 'half' ? t('plays.halfCourt') : t('plays.fullCourt')}
                        </span>
                    </div>
                    <Link
                        href={route('plays.edit', play.id)}
                        className="inline-flex items-center rounded-full bg-brand-black px-5 py-2.5 text-sm font-bold text-brand-gold hover:bg-gray-800 transition"
                    >
                        {t('common.edit')}
                    </Link>
                </div>

                <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-400">Loading...</div>}>
                    <PlayDesigner
                        canvasData={play.canvas_data}
                        courtType={play.court_type}
                        onChange={() => {}}
                        onCourtTypeChange={() => {}}
                        readOnly
                    />
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
