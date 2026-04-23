import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { Play, PlayCanvasData } from '@/types';

const PlayDesigner = lazy(() => import('@/Components/Plays/PlayDesigner'));

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
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link
                            href={route('plays.index')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            &larr; {t('plays.backToPlays')}
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900">{t('plays.editPlay')}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-full border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                        {t('common.delete')}
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('plays.playName')}
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('plays.playNamePlaceholder')}
                            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-400">Loading...</div>}>
                        <PlayDesigner
                            canvasData={data.canvas_data}
                            courtType={data.court_type}
                            onChange={(canvasData) => setData('canvas_data', canvasData)}
                            onCourtTypeChange={(type) => setData('court_type', type)}
                        />
                    </Suspense>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-full bg-brand-black px-6 py-2.5 text-sm font-bold text-brand-gold hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {processing ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
