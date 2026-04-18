import { Exercise } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface Props {
    exercise: Exercise;
}

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

const PlayIcon = () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

export default function ExerciseTile({ exercise }: Props) {
    const { t } = useTranslation();
    const ageLabels = exercise.age_groups?.map((ag) => ag.label).join(', ') || '-';

    return (
        <div className="flex h-full flex-col overflow-hidden border-3 border-brand-black bg-white shadow-brutal">
            {/* Black header */}
            <div className="bg-brand-black px-4 py-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-gold">
                    {exercise.title}
                </h3>
            </div>

            {/* Gold metadata bar */}
            <div className="grid grid-cols-2 bg-brand-gold text-brand-black">
                <div className="flex items-center gap-2 border-r border-brand-black/20 px-4 py-2">
                    <ClockIcon />
                    <span className="text-sm font-bold">{exercise.duration_minutes} MIN</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                    <PeopleIcon />
                    <span className="text-sm font-bold">{ageLabels}</span>
                </div>
            </div>

            {/* White body */}
            <div className="flex flex-1 flex-col px-4 py-4">
                {exercise.description && (
                    <p className="mb-4 text-sm text-gray-700">{exercise.description}</p>
                )}

                {exercise.materials.length > 0 && (
                    <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <EquipmentIcon />
                            <span className="text-xs font-bold uppercase tracking-wider">{t('exercises.equipment')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {exercise.materials.map((m) => (
                                <span
                                    key={m.id}
                                    className="border border-brand-black px-3 py-0.5 text-xs font-semibold capitalize text-brand-black"
                                >
                                    {m.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <Link
                    href={`${route('exercises.show', exercise.slug)}${window.location.search}`}
                    className="mt-auto inline-flex items-center gap-2 self-start bg-brand-gold px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-black transition hover:bg-yellow-400"
                >
                    <PlayIcon />
                    {t('exercises.viewDetails')}
                </Link>
            </div>
        </div>
    );
}
