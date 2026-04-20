import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SlideOver from '@/Components/SlideOver';
import { AgeGroup, Exercise, Material, Session, SessionExercise } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useRef, useState } from 'react';
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
    session: Session;
    exercises: PaginatedData<Exercise>;
    filters: {
        search?: string;
        age_group_id?: string;
        duration?: string;
        material_id?: string;
        is_framework?: string;
    };
    ageGroups: AgeGroup[];
    materials: Material[];
}

// --- Sortable exercise item in the session ---
function SortableSessionExercise({
    exercise,
    sessionId,
    isSelected,
    onSelect,
    onRemove,
}: {
    exercise: SessionExercise;
    sessionId: number;
    isSelected: boolean;
    onSelect: (exercise: SessionExercise) => void;
    onRemove: (pivotId: number) => void;
}) {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `session-${exercise.pivot.id}`,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const duration = exercise.pivot.duration_override ?? exercise.duration_minutes;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(exercise)}
            className={`flex items-center gap-3 border-3 border-brand-black bg-white p-3 shadow-brutal-sm cursor-pointer transition ${
                isSelected ? 'ring-2 ring-brand-gold ring-offset-1' : 'hover:bg-gray-50'
            }`}
        >
            <button
                type="button"
                className="cursor-grab touch-none text-gray-400 hover:text-brand-black"
                {...attributes}
                {...listeners}
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>
            </button>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand-black truncate">{exercise.title}</p>
                <p className="text-xs text-gray-500">
                    {duration} {t('common.min')}
                    {exercise.materials?.length > 0 && (
                        <> &middot; {exercise.materials.map((m) => m.name).join(', ')}</>
                    )}
                </p>
            </div>

            <span className="shrink-0 bg-brand-gold px-2 py-1 text-xs font-black text-brand-black">
                {duration} {t('common.min')}
            </span>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(exercise.pivot.id);
                }}
                className="shrink-0 text-gray-400 hover:text-red-600 transition"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// --- Library exercise card ---
function LibraryExerciseCard({
    exercise,
    onAdd,
}: {
    exercise: Exercise;
    onAdd: (exerciseId: number) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-3 border-3 border-brand-black bg-white p-3 shadow-brutal-sm">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand-black truncate">{exercise.title}</p>
                <p className="text-xs text-gray-500">
                    {exercise.duration_minutes} {t('common.min')}
                    {exercise.age_groups?.length > 0 && (
                        <> &middot; {exercise.age_groups.map((ag) => ag.label).join(', ')}</>
                    )}
                </p>
            </div>

            <button
                type="button"
                onClick={() => onAdd(exercise.id)}
                className="shrink-0 border-2 border-brand-black bg-brand-gold px-3 py-1 text-xs font-black uppercase tracking-wider text-brand-black transition hover:bg-yellow-400"
            >
                + {t('sessions.addExercise')}
            </button>
        </div>
    );
}

// --- Time progress bar ---
function TimeProgressBar({ used, target }: { used: number; target: number }) {
    const { t } = useTranslation();
    const percentage = target > 0 ? Math.min((used / target) * 100, 100) : 0;
    const isOver = used > target;
    const overMinutes = used - target;
    const remaining = target - used;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-brand-black">
                    {used} / {target} {t('common.min')}
                </span>
                <span className={`text-xs font-bold ${isOver ? 'text-red-600' : 'text-gray-500'}`}>
                    {isOver
                        ? t('sessions.overTime', { minutes: overMinutes })
                        : t('sessions.remaining', { minutes: remaining })}
                </span>
            </div>
            <div className="h-3 w-full border-2 border-brand-black bg-gray-100">
                <div
                    className={`h-full transition-all ${isOver ? 'bg-red-500' : 'bg-brand-gold'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isOver && (
                <p className="text-xs font-bold text-red-600">
                    {t('sessions.overTimeWarning')}
                </p>
            )}
        </div>
    );
}

// --- Exercise detail panel ---
function ExerciseDetailPanel({ exercise }: { exercise: SessionExercise }) {
    const { t } = useTranslation();
    const videoId = exercise.youtube_url
        ? exercise.youtube_url.match(
              /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/,
          )?.[1] ?? null
        : null;
    const duration = exercise.pivot.duration_override ?? exercise.duration_minutes;

    return (
        <div className="space-y-6">
            {/* Video */}
            {videoId && (
                <div className="border-3 border-brand-black shadow-brutal">
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

            {/* Title */}
            <h2 className="text-2xl font-black uppercase tracking-tight text-brand-black">
                {exercise.title}
            </h2>

            {/* Metadata bar */}
            <div className="grid grid-cols-2 border-3 border-brand-black bg-brand-gold text-brand-black">
                <div className="flex items-center gap-2 border-r border-brand-black/20 px-4 py-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-bold">{duration} MIN</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-bold">
                        {exercise.age_groups?.map((ag) => ag.label).join(', ') || '-'}
                    </span>
                </div>
            </div>

            {/* Description */}
            {exercise.description && (
                <p className="text-gray-700">{exercise.description}</p>
            )}

            {/* Materials */}
            <div className="border-3 border-brand-black bg-white p-4 shadow-brutal">
                <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-brand-black">
                    {t('exercises.equipment')}
                </h3>
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
                <div className="border-3 border-brand-black bg-white p-4 shadow-brutal">
                    <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-brand-black">
                        {t('exercises.instruction')}
                    </h3>
                    <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: exercise.explanation }}
                    />
                </div>
            )}
        </div>
    );
}

export default function Show({ session, exercises, filters, ageGroups, materials }: Props) {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<SessionExercise | null>(
        session.exercises.length > 0 ? session.exercises[0] : null,
    );
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const totalUsed = session.exercises.reduce((sum, ex) => {
        return sum + (ex.pivot.duration_override ?? ex.duration_minutes);
    }, 0);

    const sortableIds = session.exercises.map((ex) => `session-${ex.pivot.id}`);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sortableIds.indexOf(String(active.id));
        const newIndex = sortableIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...session.exercises];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const order = reordered.map((ex, i) => ({
            id: ex.pivot.id,
            sort_order: i,
        }));

        router.put(route('sessions.exercises.reorder', session.id), { order }, {
            preserveScroll: true,
        });
    };

    const addExercise = (exerciseId: number) => {
        router.post(route('sessions.exercises.add', session.id), {
            exercise_id: exerciseId,
        }, { preserveScroll: true });
    };

    const removeExercise = (pivotId: number) => {
        if (selectedExercise?.pivot.id === pivotId) {
            setSelectedExercise(null);
        }
        router.delete(route('sessions.exercises.remove', [session.id, pivotId]), {
            preserveScroll: true,
        });
    };

    // Filter helpers
    const applyFilters = useCallback((newFilters: Record<string, string | undefined>) => {
        const merged = { ...filters, ...newFilters };
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(([, v]) => v !== '' && v !== undefined),
        );

        router.get(route('sessions.show', session.id), cleaned, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [filters, session.id]);

    const handleSearch = (value: string) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ search: value || undefined });
        }, 300);
    };

    const selectClasses =
        'w-full appearance-none border-3 border-brand-black bg-white px-3 py-2 text-sm font-semibold text-brand-black focus:border-brand-gold focus:outline-none focus:ring-0';

    return (
        <AuthenticatedLayout>
            <Head title={`${session.title} - ${t('sessions.sessionBuilder')}`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('sessions.index')}
                        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-black transition"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('sessions.backToSessions')}
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                                {session.title}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {session.age_group?.label ?? t('sessions.noAgeGroup')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setLibraryOpen(true)}
                                className="border-3 border-brand-black bg-brand-gold px-4 py-2 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal-sm transition hover:bg-yellow-400"
                            >
                                + {t('sessions.addExercises')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm(t('sessions.deleteSessionConfirm'))) {
                                        router.delete(route('sessions.destroy', session.id));
                                    }
                                }}
                                className="border-3 border-brand-black bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-brutal-sm transition hover:bg-red-50"
                            >
                                {t('sessions.deleteSession')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Time bar */}
                <div className="mb-8 border-3 border-brand-black bg-white p-4 shadow-brutal">
                    <TimeProgressBar used={totalUsed} target={session.duration_minutes} />
                </div>

                {/* Two-column layout: session exercises + exercise detail */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left: Session exercises */}
                    <div>
                        <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-gray-500">
                            {t('sessions.sessionBuilder')} ({t('sessions.exerciseCount', { count: session.exercises.length })})
                        </h2>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                                {session.exercises.length > 0 ? (
                                    <div className="space-y-3">
                                        {session.exercises.map((exercise) => (
                                            <SortableSessionExercise
                                                key={exercise.pivot.id}
                                                exercise={exercise}
                                                sessionId={session.id}
                                                isSelected={selectedExercise?.pivot.id === exercise.pivot.id}
                                                onSelect={setSelectedExercise}
                                                onRemove={removeExercise}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-3 border-dashed border-gray-300 py-12 text-center">
                                        <p className="text-sm font-bold text-gray-400">
                                            {t('sessions.noExercisesInSession')}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {t('sessions.noExercisesInSessionDescription')}
                                        </p>
                                    </div>
                                )}
                            </SortableContext>
                            <DragOverlay>
                                {activeId ? (
                                    <div className="border-3 border-brand-black bg-brand-gold p-3 shadow-brutal opacity-80">
                                        <p className="text-sm font-bold text-brand-black">Dragging...</p>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>

                    {/* Right: Exercise detail */}
                    <div>
                        {selectedExercise ? (
                            <ExerciseDetailPanel exercise={selectedExercise} />
                        ) : (
                            <div className="border-3 border-dashed border-gray-300 py-16 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <p className="mt-4 text-sm font-bold text-gray-400">
                                    {t('sessions.selectExercise')}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    {t('sessions.selectExerciseDescription')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-over: Exercise library */}
            <SlideOver
                show={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                title={t('sessions.exerciseLibrary')}
            >
                {/* Filters */}
                <div className="mb-4 space-y-3">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder={t('filters.searchPlaceholder')}
                            className="w-full border-3 border-brand-black bg-white py-2 pl-9 pr-3 text-sm font-semibold text-brand-black placeholder-gray-400 focus:border-brand-gold focus:outline-none focus:ring-0"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <select
                            value={filters.age_group_id ?? ''}
                            onChange={(e) => applyFilters({ age_group_id: e.target.value || undefined })}
                            className={selectClasses}
                        >
                            <option value="">{t('filters.allAges')}</option>
                            {ageGroups.map((ag) => (
                                <option key={ag.id} value={ag.id}>{ag.label}</option>
                            ))}
                        </select>

                        <select
                            value={filters.duration ?? ''}
                            onChange={(e) => applyFilters({ duration: e.target.value || undefined })}
                            className={selectClasses}
                        >
                            <option value="">{t('filters.anyDuration')}</option>
                            {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                                <option key={m} value={m}>{t('filters.minutesOrLess', { minutes: m })}</option>
                            ))}
                        </select>

                        <select
                            value={filters.material_id ?? ''}
                            onChange={(e) => applyFilters({ material_id: e.target.value || undefined })}
                            className={selectClasses}
                        >
                            <option value="">{t('filters.anyMaterials')}</option>
                            {materials.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name.charAt(0).toUpperCase() + m.name.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fundamentals checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.is_framework === '1'}
                            onChange={(e) =>
                                applyFilters({ is_framework: e.target.checked ? '1' : undefined })
                            }
                            className="h-4 w-4 border-2 border-brand-black text-brand-gold focus:ring-brand-gold"
                        />
                        <span className="text-sm font-bold text-brand-black">
                            {t('sessions.fundamentalsOnly')}
                        </span>
                    </label>
                </div>

                {/* Exercise list */}
                {exercises.data.length > 0 ? (
                    <div className="space-y-3">
                        {exercises.data.map((exercise) => (
                            <LibraryExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                onAdd={addExercise}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="border-3 border-dashed border-gray-300 py-8 text-center">
                        <p className="text-sm font-bold text-gray-400">{t('exercises.noDrillsFound')}</p>
                    </div>
                )}

                {/* Pagination */}
                {exercises.last_page > 1 && (
                    <nav className="mt-4 flex justify-center gap-1">
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
            </SlideOver>
        </AuthenticatedLayout>
    );
}
