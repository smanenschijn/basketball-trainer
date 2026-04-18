import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExerciseDialog from '@/Components/Exercises/ExerciseDialog';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
    exerciseCount: number;
}

function StatCard({ title, value, subtitle, unit, icon }: { title: string; value: number; subtitle: string; unit?: string; icon: React.ReactNode }) {
    return (
        <div className="border-3 border-gray-800 bg-white p-6 shadow-brutal">
            <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold tracking-wide text-gray-900">{title}</h3>
                <div className="flex h-10 w-10 items-center justify-center bg-brand-gold text-black">
                    {icon}
                </div>
            </div>
            <p className="mt-3 text-4xl font-bold text-gray-900">
                {value}{unit && <span className="ml-1 text-lg font-semibold">{unit}</span>}
            </p>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}

function ActionCard({ title, description, primaryLabel, primaryHref, primaryOnClick, primaryDisabled, secondaryLabel, secondaryHref, secondaryDisabled }: {
    title: string; description: string; primaryLabel: string; primaryHref?: string; primaryOnClick?: () => void; primaryDisabled?: boolean; secondaryLabel: string; secondaryHref?: string; secondaryDisabled?: boolean;
}) {
    const { t } = useTranslation();
    return (
        <div className="border-3 border-gray-800 bg-white p-6 shadow-brutal">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="text-brand-gold">&#9889;</span> {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
            <div className="mt-5 space-y-3">
                <button
                    type="button"
                    onClick={primaryDisabled ? undefined : primaryOnClick}
                    disabled={primaryDisabled}
                    className={`flex w-full items-center justify-center gap-2 border-3 px-6 py-3 text-sm font-bold tracking-wide transition ${primaryDisabled ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400' : 'border-brand-black bg-black text-brand-gold hover:bg-gray-800'}`}
                >
                    + {primaryLabel}{primaryDisabled ? ` (${t('common.comingSoon')})` : ''}
                </button>
                {secondaryDisabled ? (
                    <span className="flex cursor-not-allowed items-center justify-center border-3 border-gray-300 bg-gray-50 px-6 py-3 text-sm font-bold tracking-wide text-gray-400">
                        {secondaryLabel} ({t('common.comingSoon')})
                    </span>
                ) : (
                    <a href={secondaryHref} className="flex items-center justify-center border-3 border-black bg-white px-6 py-3 text-sm font-bold tracking-wide text-black transition hover:bg-gray-50">
                        {secondaryLabel}
                    </a>
                )}
            </div>
        </div>
    );
}

// Icon components for stat cards
const ExerciseIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const CalendarIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const ChartIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export default function Dashboard({ exerciseCount }: DashboardProps) {
    const { t } = useTranslation();
    const [showAddExercise, setShowAddExercise] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title={t('dashboard.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero Banner */}
                <div className="relative overflow-hidden bg-gray-900" style={{ minHeight: '220px' }}>
                    <img src="/images/hero.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-brand-gold/30" />
                    <div className="relative z-10 flex h-full min-h-[220px] items-end p-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-wide text-brand-gold">{t('dashboard.teamName')}</h1>
                            <p className="mt-1 text-lg font-bold text-white">{t('dashboard.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <StatCard
                        title={t('dashboard.totalExercises')}
                        value={exerciseCount}
                        subtitle={t('dashboard.inYourLibrary')}
                        icon={<ExerciseIcon />}
                    />
                    <StatCard
                        title={t('dashboard.trainingSessions')}
                        value={0}
                        subtitle={t('dashboard.sessionsCreated')}
                        icon={<CalendarIcon />}
                    />
                    <StatCard
                        title={t('dashboard.totalTrainingTime')}
                        value={0}
                        unit={t('common.min')}
                        subtitle={t('dashboard.acrossAllSessions')}
                        icon={<ChartIcon />}
                    />
                </div>

                {/* Action Cards */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ActionCard
                        title={t('dashboard.exerciseLibrary')}
                        description={t('dashboard.exerciseLibraryDescription')}
                        primaryLabel={t('dashboard.addNewExercise')}
                        primaryOnClick={() => setShowAddExercise(true)}
                        secondaryLabel={t('dashboard.viewAllExercises')}
                        secondaryHref={route('exercises.index')}
                    />
                    <ActionCard
                        title={t('dashboard.trainingSessions2')}
                        description={t('dashboard.trainingSessionsDescription')}
                        primaryLabel={t('dashboard.createNewSession')}
                        primaryDisabled
                        secondaryLabel={t('dashboard.viewAllSessions')}
                        secondaryDisabled
                    />
                </div>

                {/* Get Started */}
                <div className="mt-8 border-3 border-gray-800 bg-white p-8 shadow-brutal">
                    <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-gray-900">
                        <span className="text-brand-gold">&#9889;</span> {t('dashboard.getStarted')}
                    </h3>
                    <p className="mt-3 font-semibold text-gray-900">
                        {t('dashboard.welcomeMessage')}
                    </p>
                    <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-gray-700">
                        <li>{t('dashboard.step1')}</li>
                        <li>{t('dashboard.step2')}</li>
                        <li>{t('dashboard.step3')}</li>
                        <li>{t('dashboard.step4')}</li>
                    </ol>
                </div>

                <ExerciseDialog
                    show={showAddExercise}
                    onClose={() => setShowAddExercise(false)}
                />
            </div>
        </AuthenticatedLayout>
    );
}
