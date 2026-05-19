import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import SlideOver from '@/Components/SlideOver';
import { AgeGroup, Exercise, Material, PaginatedData, RotationGroup, Session, SessionExercise } from '@/types';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from '@/utils/sanitize';
import ExerciseDialog from '@/Components/Exercises/ExerciseDialog';

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

// --- Inline duration editor ---
function DurationEditor({
    exercise,
    sessionId,
}: {
    exercise: SessionExercise;
    sessionId: number;
}) {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(
        String(exercise.pivot.duration_override ?? exercise.duration_minutes),
    );
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(String(exercise.pivot.duration_override ?? exercise.duration_minutes));
    }, [exercise.pivot.duration_override, exercise.duration_minutes]);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    const save = () => {
        setEditing(false);
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 1) {
            setValue(String(exercise.pivot.duration_override ?? exercise.duration_minutes));
            return;
        }
        const newOverride = parsed === exercise.duration_minutes ? null : parsed;
        if (newOverride === exercise.pivot.duration_override) return;

        router.put(
            route('sessions.exercises.update', [sessionId, exercise.pivot.id]),
            { duration_override: newOverride },
            { preserveScroll: true },
        );
    };

    const duration = exercise.pivot.duration_override ?? exercise.duration_minutes;
    const isOverridden = exercise.pivot.duration_override !== null;

    if (editing) {
        return (
            <div className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type="number"
                    min={1}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={save}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') save();
                        if (e.key === 'Escape') {
                            setValue(String(exercise.pivot.duration_override ?? exercise.duration_minutes));
                            setEditing(false);
                        }
                    }}
                    className="w-14 border-2 border-brand-black bg-white px-1 py-0.5 text-center text-xs font-black text-brand-black focus:border-brand-gold focus:outline-none focus:ring-0"
                />
                <span className="text-xs font-black text-brand-black">{t('common.min')}</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
            }}
            title={
                isOverridden
                    ? t('sessions.defaultDuration', { minutes: exercise.duration_minutes })
                    : t('sessions.editDuration')
            }
            className={`shrink-0 px-2 py-1 text-xs font-black text-brand-black transition hover:bg-yellow-400 ${
                isOverridden ? 'bg-brand-gold ring-2 ring-brand-black/20' : 'bg-brand-gold'
            }`}
        >
            {duration} {t('common.min')}
            {isOverridden && <span className="ml-1 text-[10px] font-bold opacity-60">*</span>}
        </button>
    );
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

            <DurationEditor exercise={exercise} sessionId={sessionId} />

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
function ExerciseDetailPanel({ exercise, onEdit }: { exercise: SessionExercise; onEdit: () => void }) {
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

            {/* Title + Edit */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black uppercase tracking-tight text-brand-black">
                    {exercise.title}
                </h2>
                <button
                    type="button"
                    onClick={onEdit}
                    className="shrink-0 border-3 border-brand-black bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wider text-brand-black shadow-brutal-sm transition hover:bg-gray-50"
                >
                    {t('common.edit')}
                </button>
            </div>

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
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(exercise.explanation) }}
                    />
                </div>
            )}
        </div>
    );
}

// --- Rotation group block ---
function SortableRotationExercise({
    exercise,
    index,
    intervalMinutes,
    selectedPivotId,
    onSelectExercise,
    onRemoveExercise,
    rotationGroupId,
}: {
    exercise: SessionExercise;
    index: number;
    intervalMinutes: number;
    selectedPivotId: number | null;
    onSelectExercise: (exercise: SessionExercise) => void;
    onRemoveExercise: (rotationGroupId: number, pivotId: number) => void;
    rotationGroupId: number;
}) {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `rotation-${rotationGroupId}-${exercise.pivot.id}`,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelectExercise(exercise)}
            className={`flex items-center gap-3 border-3 border-brand-black bg-white p-2 cursor-pointer transition ${
                selectedPivotId === exercise.pivot.id ? 'ring-2 ring-brand-gold ring-offset-1' : 'hover:bg-gray-50'
            }`}
        >
            <button
                type="button"
                className="cursor-grab touch-none text-gray-400 hover:text-brand-black"
                {...attributes}
                {...listeners}
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>
            </button>
            <span className="shrink-0 flex h-6 w-6 items-center justify-center border-2 border-brand-black bg-brand-gold text-xs font-black text-brand-black">
                {index + 1}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand-black truncate">{exercise.title}</p>
            </div>
            <span className="shrink-0 px-2 py-0.5 text-xs font-black text-brand-black bg-brand-gold">
                {intervalMinutes} {t('common.min')}
            </span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExercise(rotationGroupId, exercise.pivot.id);
                }}
                className="shrink-0 text-gray-400 hover:text-red-600 transition"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

function RotationGroupBlock({
    group,
    sessionId,
    selectedPivotId,
    onSelectExercise,
    onRemoveExercise,
    onEdit,
    onDelete,
    onAddExercise,
}: {
    group: RotationGroup;
    sessionId: number;
    selectedPivotId: number | null;
    onSelectExercise: (exercise: SessionExercise) => void;
    onRemoveExercise: (rotationGroupId: number, pivotId: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddExercise: () => void;
}) {
    const { t } = useTranslation();
    const rotationCount = group.interval_minutes > 0 ? Math.floor(group.total_duration_minutes / group.interval_minutes) : 0;

    const innerSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const innerSortableIds = group.exercises.map((ex) => `rotation-${group.id}-${ex.pivot.id}`);

    const handleInnerDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = innerSortableIds.indexOf(String(active.id));
        const newIndex = innerSortableIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...group.exercises];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const order = reordered.map((ex, i) => ({
            id: ex.pivot.id,
            sort_order: i,
        }));

        router.put(
            route('sessions.rotation-groups.exercises.reorder', [sessionId, group.id]),
            { order },
            { preserveScroll: true },
        );
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `timeline-rotation-${group.id}`,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="border-3 border-brand-black bg-white shadow-brutal-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b-3 border-brand-black bg-brand-gold px-4 py-2">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="cursor-grab touch-none text-brand-black/60 hover:text-brand-black"
                        {...attributes}
                        {...listeners}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                        </svg>
                    </button>
                    <svg className="h-5 w-5 text-brand-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div>
                        <p className="text-sm font-black uppercase tracking-wide text-brand-black">
                            {group.title || t('sessions.rotationGroup')}
                        </p>
                        <p className="text-xs font-bold text-brand-black/70">
                            {t('sessions.rotationInterval', { minutes: group.interval_minutes })}
                            {' · '}
                            {t('sessions.rotationDuration', { minutes: group.total_duration_minutes })}
                            {' · '}
                            {t('sessions.rotationCount', { count: rotationCount })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onAddExercise}
                        className="border-2 border-brand-black bg-white px-2 py-1 text-xs font-black text-brand-black transition hover:bg-gray-50"
                        title={t('sessions.addToRotation')}
                    >
                        +
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        className="px-2 py-1 text-brand-black/60 hover:text-brand-black transition"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="px-2 py-1 text-brand-black/40 hover:text-red-600 transition"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Stations */}
            <div className="p-3 space-y-2">
                {group.exercises.length > 0 ? (
                    <DndContext
                        sensors={innerSensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleInnerDragEnd}
                    >
                        <SortableContext items={innerSortableIds} strategy={verticalListSortingStrategy}>
                            {group.exercises.map((exercise, index) => (
                                <SortableRotationExercise
                                    key={exercise.pivot.id}
                                    exercise={exercise}
                                    index={index}
                                    intervalMinutes={group.interval_minutes}
                                    selectedPivotId={selectedPivotId}
                                    onSelectExercise={onSelectExercise}
                                    onRemoveExercise={onRemoveExercise}
                                    rotationGroupId={group.id}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="border-3 border-dashed border-gray-300 py-4 text-center">
                        <p className="text-xs font-bold text-gray-400">{t('sessions.noStations')}</p>
                        <p className="mt-1 text-xs text-gray-400">{t('sessions.noStationsDescription')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Rotation group form modal ---
function RotationFormModal({
    show,
    onClose,
    sessionId,
    editGroup,
}: {
    show: boolean;
    onClose: () => void;
    sessionId: number;
    editGroup: RotationGroup | null;
}) {
    const { t } = useTranslation();
    const [title, setTitle] = useState(editGroup?.title ?? '');
    const [interval, setInterval] = useState(String(editGroup?.interval_minutes ?? 5));
    const [totalDuration, setTotalDuration] = useState(String(editGroup?.total_duration_minutes ?? 20));

    useEffect(() => {
        setTitle(editGroup?.title ?? '');
        setInterval(String(editGroup?.interval_minutes ?? 5));
        setTotalDuration(String(editGroup?.total_duration_minutes ?? 20));
    }, [editGroup, show]);

    if (!show) return null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            title: title || null,
            interval_minutes: parseInt(interval, 10),
            total_duration_minutes: parseInt(totalDuration, 10),
        };

        if (editGroup) {
            router.put(
                route('sessions.rotation-groups.update', [sessionId, editGroup.id]),
                data,
                { preserveScroll: true, onSuccess: () => onClose() },
            );
        } else {
            router.post(
                route('sessions.rotation-groups.store', sessionId),
                data,
                { preserveScroll: true, onSuccess: () => onClose() },
            );
        }
    };

    const intervalNum = parseInt(interval, 10) || 0;
    const totalNum = parseInt(totalDuration, 10) || 0;
    const rotations = intervalNum > 0 ? Math.floor(totalNum / intervalNum) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="w-full max-w-md border-3 border-brand-black bg-white p-6 shadow-brutal" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-brand-black">
                    {editGroup ? t('sessions.editRotation') : t('sessions.createRotation')}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-brand-black">{t('sessions.rotationTitle')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('sessions.rotationTitlePlaceholder')}
                            className="mt-1 w-full border-3 border-brand-black bg-white px-3 py-2 text-sm font-semibold text-brand-black placeholder-gray-400 focus:border-brand-gold focus:outline-none focus:ring-0"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-brand-black">{t('sessions.intervalMinutes')}</label>
                            <input
                                type="number"
                                min={1}
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className="mt-1 w-full border-3 border-brand-black bg-white px-3 py-2 text-sm font-semibold text-brand-black focus:border-brand-gold focus:outline-none focus:ring-0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-black">{t('sessions.totalDurationMinutes')}</label>
                            <input
                                type="number"
                                min={1}
                                value={totalDuration}
                                onChange={(e) => setTotalDuration(e.target.value)}
                                className="mt-1 w-full border-3 border-brand-black bg-white px-3 py-2 text-sm font-semibold text-brand-black focus:border-brand-gold focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>
                    {rotations > 0 && (
                        <p className="text-sm font-bold text-brand-black">
                            {t('sessions.rotationCount', { count: rotations })}
                        </p>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 border-3 border-brand-black bg-brand-gold px-4 py-2 text-sm font-black uppercase tracking-wider text-brand-black transition hover:bg-yellow-400"
                        >
                            {editGroup ? t('common.save') : t('sessions.addRotation')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-3 border-brand-black bg-white px-4 py-2 text-sm font-bold text-brand-black transition hover:bg-gray-50"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </div>
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
    const [showRotationForm, setShowRotationForm] = useState(false);
    const [editingRotation, setEditingRotation] = useState<RotationGroup | null>(null);
    const [addingToRotation, setAddingToRotation] = useState<number | null>(null);
    const [editingExercise, setEditingExercise] = useState<SessionExercise | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // Standalone exercises (not in any rotation group)
    const standaloneExercises = session.exercises.filter((ex) => ex.pivot.rotation_group_id === null);

    // Total used time: standalone durations + rotation group totals
    const totalUsed =
        standaloneExercises.reduce((sum, ex) => sum + (ex.pivot.duration_override ?? ex.duration_minutes), 0) +
        (session.rotation_groups ?? []).reduce((sum, rg) => sum + rg.total_duration_minutes, 0);

    // Build unified timeline items sorted by sort_order
    type TimelineItem =
        | { type: 'exercise'; exercise: SessionExercise; sort_order: number }
        | { type: 'rotation'; group: RotationGroup; sort_order: number };

    const timeline: TimelineItem[] = [
        ...standaloneExercises.map((ex) => ({
            type: 'exercise' as const,
            exercise: ex,
            sort_order: ex.pivot.sort_order,
        })),
        ...(session.rotation_groups ?? []).map((rg) => ({
            type: 'rotation' as const,
            group: rg,
            sort_order: rg.sort_order,
        })),
    ].sort((a, b) => a.sort_order - b.sort_order);

    const sortableIds = timeline.map((item) =>
        item.type === 'exercise'
            ? `session-${item.exercise.pivot.id}`
            : `timeline-rotation-${item.group.id}`,
    );

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

        const reordered = [...timeline];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const order = reordered.map((item, i) => ({
            type: item.type === 'exercise' ? 'exercise' : 'rotation',
            id: item.type === 'exercise' ? item.exercise.pivot.id : item.group.id,
            sort_order: i,
        }));

        router.put(route('sessions.timeline.reorder', session.id), { order }, {
            preserveScroll: true,
        });
    };

    const addExercise = (exerciseId: number) => {
        if (addingToRotation !== null) {
            router.post(
                route('sessions.rotation-groups.exercises.add', [session.id, addingToRotation]),
                { exercise_id: exerciseId },
                { preserveScroll: true },
            );
        } else {
            router.post(route('sessions.exercises.add', session.id), {
                exercise_id: exerciseId,
            }, { preserveScroll: true });
        }
    };

    const removeExercise = (pivotId: number) => {
        if (selectedExercise?.pivot.id === pivotId) {
            setSelectedExercise(null);
        }
        router.delete(route('sessions.exercises.remove', [session.id, pivotId]), {
            preserveScroll: true,
        });
    };

    const removeRotationExercise = (rotationGroupId: number, pivotId: number) => {
        if (selectedExercise?.pivot.id === pivotId) {
            setSelectedExercise(null);
        }
        router.delete(
            route('sessions.rotation-groups.exercises.remove', [session.id, rotationGroupId, pivotId]),
            { preserveScroll: true },
        );
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

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                                {session.title}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {session.age_group?.label ?? t('sessions.noAgeGroup')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={route('sessions.print', session.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t('sessions.printSession')}
                                className="border-3 border-brand-black bg-white px-3 py-2 text-brand-black shadow-brutal-sm transition hover:bg-gray-50"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.25 7.034V3.375" />
                                </svg>
                            </a>
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
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                                {t('sessions.sessionBuilder')} ({t('sessions.exerciseCount', { count: session.exercises.length })})
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowRotationForm(true)}
                                className="border-3 border-brand-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal-sm transition hover:bg-gray-50"
                            >
                                + {t('sessions.addRotation')}
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                                {timeline.length > 0 ? (
                                    <div className="space-y-3">
                                        {timeline.map((item) =>
                                            item.type === 'exercise' ? (
                                                <SortableSessionExercise
                                                    key={item.exercise.pivot.id}
                                                    exercise={item.exercise}
                                                    sessionId={session.id}
                                                    isSelected={selectedExercise?.pivot.id === item.exercise.pivot.id}
                                                    onSelect={setSelectedExercise}
                                                    onRemove={removeExercise}
                                                />
                                            ) : (
                                                <RotationGroupBlock
                                                    key={`rotation-${item.group.id}`}
                                                    group={item.group}
                                                    sessionId={session.id}
                                                    selectedPivotId={selectedExercise?.pivot.id ?? null}
                                                    onSelectExercise={setSelectedExercise}
                                                    onRemoveExercise={removeRotationExercise}
                                                    onEdit={() => setEditingRotation(item.group)}
                                                    onDelete={() => {
                                                        if (confirm(t('sessions.deleteRotationConfirm'))) {
                                                            router.delete(
                                                                route('sessions.rotation-groups.destroy', [session.id, item.group.id]),
                                                                { preserveScroll: true },
                                                            );
                                                        }
                                                    }}
                                                    onAddExercise={() => {
                                                        setAddingToRotation(item.group.id);
                                                        setLibraryOpen(true);
                                                    }}
                                                />
                                            ),
                                        )}
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
                            <ExerciseDetailPanel exercise={selectedExercise} onEdit={() => setEditingExercise(selectedExercise)} />
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
                onClose={() => {
                    setLibraryOpen(false);
                    setAddingToRotation(null);
                }}
                title={
                    addingToRotation !== null
                        ? `${t('sessions.addToRotation')}: ${(session.rotation_groups ?? []).find((rg) => rg.id === addingToRotation)?.title || t('sessions.rotationGroup')}`
                        : t('sessions.exerciseLibrary')
                }
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
                <Pagination links={exercises.links} lastPage={exercises.last_page} />
            </SlideOver>

            {/* Rotation form modal */}
            <RotationFormModal
                show={showRotationForm || editingRotation !== null}
                onClose={() => {
                    setShowRotationForm(false);
                    setEditingRotation(null);
                }}
                sessionId={session.id}
                editGroup={editingRotation}
            />

            {/* Exercise edit dialog */}
            <ExerciseDialog
                show={editingExercise !== null}
                onClose={() => setEditingExercise(null)}
                exercise={editingExercise}
                ageGroups={ageGroups}
            />
        </AuthenticatedLayout>
    );
}
