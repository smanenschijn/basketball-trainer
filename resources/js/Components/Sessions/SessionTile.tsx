import { Session } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface Props {
    session: Session;
}

const ClockIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ListIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const EquipmentIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const FrameworkIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

function getFrameworkExerciseCount(session: Session): number {
    if (!session.age_group_id) return 0;
    return session.exercises.filter((ex) =>
        ex.age_groups?.some(
            (ag) => ag.id === session.age_group_id && ag.pivot?.is_framework,
        ),
    ).length;
}

export default function SessionTile({ session }: Props) {
    const { t } = useTranslation();

    const totalDuration = session.exercises.reduce((sum, ex) => {
        return sum + (ex.pivot.duration_override ?? ex.duration_minutes);
    }, 0);

    const frameworkCount = getFrameworkExerciseCount(session);

    const allMaterials = [
        ...new Set(
            session.exercises.flatMap((ex) => ex.materials?.map((m) => m.name) ?? []),
        ),
    ];

    return (
        <Link
            href={route('sessions.show', session.id)}
            className="flex flex-col overflow-hidden border-3 border-brand-black bg-white shadow-brutal transition hover:shadow-brutal-lg"
        >
            {/* Header */}
            <div className="bg-brand-black px-4 py-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-gold">
                    {session.title}
                </h3>
                {session.age_group && (
                    <p className="mt-0.5 text-xs text-gray-400">{session.age_group.label}</p>
                )}
            </div>

            {/* Metadata bar */}
            <div className="grid grid-cols-2 bg-brand-gold text-brand-black">
                <div className="flex items-center gap-2 border-r border-brand-black/20 px-4 py-2">
                    <ClockIcon />
                    <span className="text-sm font-bold">
                        {totalDuration} / {session.duration_minutes} {t('common.min')}
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                    <ListIcon />
                    <span className="text-sm font-bold">
                        {t('sessions.exerciseCount', { count: session.exercises.length })}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                {/* Framework badge */}
                {frameworkCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <FrameworkIcon />
                        <span className="text-xs font-bold text-brand-black">
                            {t('sessions.fundamentalCount', { count: frameworkCount })}
                        </span>
                    </div>
                )}

                {allMaterials.length > 0 && (
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-500">
                            <EquipmentIcon />
                            <span className="text-xs font-bold uppercase tracking-wider">{t('sessions.materials')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {allMaterials.slice(0, 5).map((name) => (
                                <span
                                    key={name}
                                    className="border border-brand-black px-2 py-0.5 text-xs font-semibold capitalize text-brand-black"
                                >
                                    {name}
                                </span>
                            ))}
                            {allMaterials.length > 5 && (
                                <span className="px-2 py-0.5 text-xs text-gray-400">
                                    +{allMaterials.length - 5}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
