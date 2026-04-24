import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayCanvasData } from '@/types';

const PlayDesigner = lazy(() => import('@/Components/Plays/PlayDesigner'));

const ArrowLeftIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export default function Create() {
    const { t } = useTranslation();
    const { exerciseId } = usePage().props as { exerciseId?: number | string };
    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        court_type: 'half' | 'full';
        canvas_data: PlayCanvasData;
        exercise_id: string;
    }>({
        title: '',
        court_type: 'half',
        canvas_data: { players: [], lines: [] },
        exercise_id: exerciseId ? String(exerciseId) : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('plays.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('plays.createPlay')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    href={route('plays.index')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-600 transition hover:text-brand-black"
                >
                    <ArrowLeftIcon />
                    {t('plays.backToPlays')}
                </Link>

                {/* Title */}
                <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                    {exerciseId ? t('plays.createPlayForExercise') : t('plays.createPlay')}
                </h1>

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
