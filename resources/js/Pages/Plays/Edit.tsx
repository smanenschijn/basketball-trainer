import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { Play, PlayCanvasData } from '@/types';

const PlayDesigner = lazy(() => import('@/Components/Plays/PlayDesigner'));

const ArrowLeftIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const TrashIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default function Edit({ play }: { play: Play }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm<{
        title: string;
        court_type: 'half' | 'full';
        canvas_data: PlayCanvasData;
    }>({
        title: play.title,
        court_type: play.court_type,
        canvas_data: play.canvas_data,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('plays.update', play.id));
    };

    const handleDelete = () => {
        if (confirm(t('plays.confirmDelete'))) {
            router.delete(route('plays.destroy', play.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('plays.editPlay')} />

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
                        {t('plays.editPlay')}
                    </h1>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex shrink-0 items-center gap-2 border-3 border-brand-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50"
                    >
                        <TrashIcon />
                        {t('common.delete')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                    {/* Play name input */}
                    <div className="mb-6">
                        <label htmlFor="title" className="mb-1 block text-xs font-black uppercase tracking-wider text-brand-black">
                            {t('plays.playName')}
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('plays.playNamePlaceholder')}
                            className="block w-full border-3 border-brand-black px-4 py-2.5 text-sm font-medium text-brand-black shadow-brutal-sm focus:border-brand-gold focus:ring-brand-gold sm:max-w-md"
                        />
                        {errors.title && <p className="mt-1 text-sm font-medium text-red-600">{errors.title}</p>}
                    </div>

                    {/* Canvas */}
                    <Suspense fallback={<div className="flex h-96 items-center justify-center border-3 border-brand-black bg-gray-50 text-gray-400">{t('common.loading')}...</div>}>
                        <PlayDesigner
                            canvasData={data.canvas_data}
                            courtType={data.court_type}
                            onChange={(canvasData) => setData('canvas_data', canvasData)}
                            onCourtTypeChange={(type) => setData('court_type', type)}
                        />
                    </Suspense>

                    {/* Submit */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-6 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400 disabled:opacity-50"
                        >
                            {processing ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
