import ExerciseFilters from '@/Components/ExerciseFilters';
import ExerciseTile from '@/Components/ExerciseTile';
import ExerciseDialog from '@/Components/Exercises/ExerciseDialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AgeGroup, Exercise, Material } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    exercises: PaginatedData<Exercise>;
    totalCount: number;
    filters: {
        search?: string;
        age_group_id?: string;
        duration?: string;
        material_id?: string;
    };
    ageGroups: AgeGroup[];
    materials: Material[];
}

const PlusIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export default function Index({ exercises, totalCount, filters, ageGroups, materials }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as { auth: { user: { is_admin: boolean } } };
    const [showDialog, setShowDialog] = useState(false);

    const handleClose = () => {
        setShowDialog(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('exercises.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                            {t('exercises.title')}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {t('exercises.drillCount', { count: totalCount })}
                        </p>
                    </div>
                    {auth.user.is_admin && (
                    <button
                        type="button"
                        onClick={() => setShowDialog(true)}
                        className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400"
                    >
                        <PlusIcon />
                        {t('exercises.addDrill')}
                    </button>
                    )}
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <ExerciseFilters filters={filters} ageGroups={ageGroups} materials={materials} />
                </div>

                {/* Count */}
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('exercises.showingOf', { shown: exercises.data.length, total: exercises.total })}
                </p>

                {/* Grid */}
                {exercises.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {exercises.data.map((exercise) => (
                            <ExerciseTile key={exercise.id} exercise={exercise} />
                        ))}
                    </div>
                ) : (
                    <div className="border-3 border-dashed border-gray-300 py-16 text-center">
                        <p className="text-lg font-bold text-gray-400">{t('exercises.noDrillsFound')}</p>
                        <p className="mt-1 text-sm text-gray-400">
                            {Object.keys(filters).length > 0
                                ? t('exercises.tryAdjustingFilters')
                                : t('exercises.addFirstDrill')}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {exercises.last_page > 1 && (
                    <nav className="mt-8 flex justify-center gap-1">
                        {exercises.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-2 text-sm font-semibold transition ${
                                    link.active
                                        ? 'bg-brand-gold text-brand-black'
                                        : link.url
                                          ? 'text-gray-600 hover:bg-gray-100'
                                          : 'cursor-default text-gray-300'
                                }`}
                                preserveScroll
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>

            <ExerciseDialog
                show={showDialog}
                onClose={handleClose}
            />
        </AuthenticatedLayout>
    );
}
