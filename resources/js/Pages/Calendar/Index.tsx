import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CalendarAssignment, CalendarSession } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    assignments: CalendarAssignment[];
    trainingDays: number[];
    sessions: CalendarSession[];
    startDate: string;
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function formatDateShort(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().split('T')[0];
}

function isPast(dateStr: string): boolean {
    return dateStr < new Date().toISOString().split('T')[0];
}

const FrameworkIcon = () => (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const XIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function Index({ assignments, trainingDays: initialTrainingDays, sessions, startDate }: Props) {
    const { t } = useTranslation();
    const [trainingDays, setTrainingDays] = useState<number[]>(initialTrainingDays);
    const [pickingDate, setPickingDate] = useState<string | null>(null);
    const [dragSessionId, setDragSessionId] = useState<number | null>(null);

    // Build assignment map: date -> assignment
    const assignmentMap = new Map<string, CalendarAssignment>();
    assignments.forEach((a) => assignmentMap.set(a.date, a));

    // Build 4 weeks of dates
    const weeks: string[][] = [];
    for (let w = 0; w < 4; w++) {
        const week: string[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(addDays(startDate, w * 7 + d));
        }
        weeks.push(week);
    }

    const toggleTrainingDay = (dayIndex: number) => {
        const newDays = trainingDays.includes(dayIndex)
            ? trainingDays.filter((d) => d !== dayIndex)
            : [...trainingDays, dayIndex];
        setTrainingDays(newDays);
        router.put(route('training-days.update'), { days: newDays }, { preserveScroll: true });
    };

    const assignSession = (sessionId: number, date: string) => {
        router.post(
            route('calendar.assign'),
            { session_id: sessionId, date },
            { preserveScroll: true, onSuccess: () => setPickingDate(null) },
        );
    };

    const unassignSession = (assignmentId: number) => {
        router.delete(route('calendar.unassign', assignmentId), { preserveScroll: true });
    };

    const handleDrop = (date: string) => {
        if (dragSessionId && !assignmentMap.has(date)) {
            assignSession(dragSessionId, date);
        }
        setDragSessionId(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('calendar.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <h1 className="mb-6 text-3xl font-black uppercase tracking-tight text-brand-black">
                    {t('calendar.title')}
                </h1>

                {/* Training days selector */}
                <div className="mb-8 border-3 border-brand-black bg-white p-4 shadow-brutal">
                    <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-500">
                        {t('calendar.trainingDays')}
                    </h2>
                    <div className="flex gap-2">
                        {DAY_KEYS.map((key, i) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleTrainingDay(i)}
                                className={`border-3 border-brand-black px-4 py-2 text-sm font-black uppercase tracking-wider transition ${
                                    trainingDays.includes(i)
                                        ? 'bg-brand-gold text-brand-black shadow-brutal-sm'
                                        : 'bg-white text-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                {t(`calendar.${key}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Calendar grid */}
                    <div className="flex-1">
                        {trainingDays.length === 0 ? (
                            <div className="border-3 border-dashed border-gray-300 py-16 text-center">
                                <p className="text-sm text-gray-400">{t('calendar.dragOrClick')}</p>
                            </div>
                        ) : (
                        weeks.map((week, wi) => {
                            const weekLabel = formatDateShort(week[0]);
                            const sortedDays = [...trainingDays].sort((a, b) => a - b);
                            return (
                                <div key={wi} className="mb-6">
                                    <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-500">
                                        {t('calendar.weekOf', { date: weekLabel })}
                                    </h3>
                                    <div
                                        className="grid gap-2"
                                        style={{ gridTemplateColumns: `repeat(${sortedDays.length}, minmax(0, 1fr))` }}
                                    >
                                        {/* Day headers (first week only) */}
                                        {wi === 0 &&
                                            sortedDays.map((di) => (
                                                <div
                                                    key={`header-${di}`}
                                                    className="pb-1 text-center text-xs font-black uppercase tracking-widest text-brand-black"
                                                >
                                                    {t(`calendar.${DAY_KEYS[di]}`)}
                                                </div>
                                            ))}

                                        {sortedDays.map((di) => {
                                            const date = week[di];
                                            const assignment = assignmentMap.get(date);
                                            const today = isToday(date);
                                            const past = isPast(date);
                                            const canAssign = !assignment && !past;

                                            return (
                                                <div
                                                    key={date}
                                                    onDragOver={(e) => {
                                                        if (canAssign) e.preventDefault();
                                                    }}
                                                    onDrop={() => !past && handleDrop(date)}
                                                    className={`min-h-[100px] border-3 p-2 transition ${
                                                        today ? 'border-brand-gold' : 'border-brand-black'
                                                    } ${
                                                        past ? 'bg-gray-100 opacity-60' : 'bg-white'
                                                    } ${
                                                        canAssign ? 'cursor-pointer hover:bg-brand-gold/10' : ''
                                                    }`}
                                                    onClick={() => {
                                                        if (canAssign) {
                                                            setPickingDate(date);
                                                        }
                                                    }}
                                                >
                                                    <div className={`text-xs font-bold ${today ? 'text-brand-gold' : 'text-gray-400'}`}>
                                                        {formatDateShort(date)}
                                                    </div>

                                                    {assignment ? (
                                                        <div className="mt-1">
                                                            <Link
                                                                href={route('sessions.show', assignment.session.id)}
                                                                className="block text-xs font-black uppercase text-brand-black hover:text-brand-gold"
                                                            >
                                                                {assignment.session.title}
                                                            </Link>
                                                            {assignment.session.age_group && (
                                                                <p className="text-[10px] text-gray-500">
                                                                    {assignment.session.age_group.label}
                                                                </p>
                                                            )}
                                                            <p className="text-[10px] text-gray-400">
                                                                {assignment.session.duration_minutes} {t('common.min')} &middot;{' '}
                                                                {t('sessions.exerciseCount', { count: assignment.session.exercise_count })}
                                                            </p>
                                                            {assignment.session.framework_exercise_count > 0 && (
                                                                <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-brand-black">
                                                                    <FrameworkIcon />
                                                                    {t('sessions.fundamentalCount', {
                                                                        count: assignment.session.framework_exercise_count,
                                                                    })}
                                                                </div>
                                                            )}
                                                            {!past && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    unassignSession(assignment.id);
                                                                }}
                                                                className="mt-1 flex items-center gap-0.5 text-[10px] text-red-500 hover:text-red-700"
                                                            >
                                                                <XIcon />
                                                                {t('calendar.unassign')}
                                                            </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-center text-[10px] text-gray-300">
                                                            {t('calendar.noSession')}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                        )}
                    </div>

                    {/* Sidebar: available sessions */}
                    <div className="w-72 shrink-0">
                        <div className="sticky top-4 border-3 border-brand-black bg-white p-4 shadow-brutal">
                            <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-500">
                                {t('calendar.availableSessions')}
                            </h2>
                            {sessions.length > 0 ? (
                                <div className="space-y-2">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            draggable
                                            onDragStart={() => setDragSessionId(session.id)}
                                            onDragEnd={() => setDragSessionId(null)}
                                            className={`cursor-grab border-2 border-brand-black p-2 transition active:cursor-grabbing ${
                                                dragSessionId === session.id ? 'opacity-50' : 'hover:bg-brand-gold/10'
                                            }`}
                                        >
                                            <p className="text-xs font-black uppercase text-brand-black">
                                                {session.title}
                                            </p>
                                            {session.age_group && (
                                                <p className="text-[10px] text-gray-500">{session.age_group.label}</p>
                                            )}
                                            <p className="text-[10px] text-gray-400">
                                                {session.duration_minutes} {t('common.min')} &middot;{' '}
                                                {t('sessions.exerciseCount', { count: session.exercise_count })}
                                            </p>
                                            {session.framework_exercise_count > 0 && (
                                                <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-brand-black">
                                                    <FrameworkIcon />
                                                    {t('sessions.fundamentalCount', {
                                                        count: session.framework_exercise_count,
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">{t('calendar.noSessionsAvailable')}</p>
                            )}
                            <p className="mt-3 text-[10px] text-gray-400">{t('calendar.dragOrClick')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session picker modal */}
            {pickingDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPickingDate(null)}>
                    <div
                        className="w-full max-w-sm border-3 border-brand-black bg-white p-6 shadow-brutal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-1 text-sm font-black uppercase tracking-wider text-brand-black">
                            {t('calendar.pickSession')}
                        </h3>
                        <p className="mb-4 text-xs text-gray-500">{formatDateShort(pickingDate)}</p>

                        {sessions.length > 0 ? (
                            <div className="max-h-64 space-y-2 overflow-y-auto">
                                {sessions.map((session) => (
                                    <button
                                        key={session.id}
                                        type="button"
                                        onClick={() => assignSession(session.id, pickingDate)}
                                        className="w-full border-2 border-brand-black p-3 text-left transition hover:bg-brand-gold/20"
                                    >
                                        <p className="text-xs font-black uppercase text-brand-black">
                                            {session.title}
                                        </p>
                                        {session.age_group && (
                                            <p className="text-[10px] text-gray-500">{session.age_group.label}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400">
                                            {session.duration_minutes} {t('common.min')} &middot;{' '}
                                            {t('sessions.exerciseCount', { count: session.exercise_count })}
                                        </p>
                                        {session.framework_exercise_count > 0 && (
                                            <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-brand-black">
                                                <FrameworkIcon />
                                                {t('sessions.fundamentalCount', {
                                                    count: session.framework_exercise_count,
                                                })}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">{t('calendar.noSessionsAvailable')}</p>
                        )}

                        <button
                            type="button"
                            onClick={() => setPickingDate(null)}
                            className="mt-4 w-full border-3 border-brand-black bg-gray-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-black hover:bg-gray-200"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
