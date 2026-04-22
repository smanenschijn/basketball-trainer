import ExerciseDialog from '@/Components/Exercises/ExerciseDialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Exercise, AgeGroup } from '@/types';
import { sanitizeHtml } from '@/utils/sanitize';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    exercise: Exercise;
    ageGroups: AgeGroup[];
}

const ArrowLeftIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const ClockIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PeopleIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EquipmentIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

function extractYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/,
    );
    return match?.[1] ?? null;
}

export default function Show({ exercise, ageGroups }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as { auth: { user: { is_admin: boolean } } };
    const [showEditDialog, setShowEditDialog] = useState(false);
    const ageLabels = exercise.age_groups?.map((ag) => ag.label).join(', ') || '-';
    const videoId = exercise.youtube_url ? extractYouTubeId(exercise.youtube_url) : null;

    const backLink = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        if (from === 'framework') {
            return { href: route('technical-framework.index'), label: t('exercises.backToFramework') };
        }
        // Preserve filter params when navigating back to the exercise library
        const filterParams = new URLSearchParams();
        ['search', 'age_group_id', 'duration', 'material_id', 'page'].forEach((key) => {
            const value = params.get(key);
            if (value) filterParams.set(key, value);
        });
        const query = filterParams.toString();
        return {
            href: route('exercises.index') + (query ? `?${query}` : ''),
            label: t('exercises.backToLibrary'),
        };
    }, [t]);

    const handleDelete = () => {
        if (confirm(t('exercises.confirmDelete'))) {
            router.delete(route('exercises.destroy', exercise.slug));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={exercise.title} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    href={backLink.href}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-600 transition hover:text-brand-black"
                >
                    <ArrowLeftIcon />
                    {backLink.label}
                </Link>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left column: video + title + description */}
                    <div>
                        {videoId && (
                            <div className="mb-6 border-3 border-brand-black shadow-brutal">
                                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        className="absolute inset-0 h-full w-full"
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title={exercise.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}

                            <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                                {exercise.title}
                            </h1>
                            {auth.user.is_admin && (
                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditDialog(true)}
                                    className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-black transition hover:bg-yellow-400"
                                >
                                    <PencilIcon />
                                    {t('common.edit')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="inline-flex items-center gap-2 border-3 border-brand-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-black transition hover:bg-red-50 hover:text-red-600"
                                >
                                    <TrashIcon />
                                    {t('common.delete')}
                                </button>
                            </div>
                            )}
                        </div>

                        {/* Metadata bar */}
                        <div className="mt-4 grid grid-cols-2 border-3 border-brand-black bg-brand-gold text-brand-black">
                            <div className="flex items-center gap-2 border-r border-brand-black/20 px-4 py-2">
                                <ClockIcon />
                                <span className="text-sm font-bold">{exercise.duration_minutes} MIN</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2">
                                <PeopleIcon />
                                <span className="text-sm font-bold">{ageLabels}</span>
                            </div>
                        </div>

                        {exercise.description && (
                            <p className="mt-4 text-gray-700">{exercise.description}</p>
                        )}
                    </div>

                    {/* Right column: materials + instruction */}
                    <div>
                        {/* Materials */}
                        <div className="mb-8 border-3 border-brand-black bg-white p-6 shadow-brutal">
                            <div className="mb-4 flex items-center gap-2">
                                <EquipmentIcon />
                                <h2 className="text-sm font-black uppercase tracking-wider text-brand-black">
                                    {t('exercises.equipment')}
                                </h2>
                            </div>
                            {exercise.materials.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {exercise.materials.map((m) => (
                                        <span
                                            key={m.id}
                                            className="border border-brand-black px-3 py-1 text-sm font-semibold capitalize text-brand-black"
                                        >
                                            {m.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">{t('exercises.noMaterials')}</p>
                            )}
                        </div>

                        {/* Instruction */}
                        {exercise.explanation && (
                            <div className="border-3 border-brand-black bg-white p-6 shadow-brutal">
                                <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-brand-black">
                                    {t('exercises.instruction')}
                                </h2>
                                <div
                                    className="prose prose-sm max-w-none text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(exercise.explanation) }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ExerciseDialog
                show={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                exercise={exercise}
                ageGroups={ageGroups}
            />
        </AuthenticatedLayout>
    );
}
