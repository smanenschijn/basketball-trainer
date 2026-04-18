import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import RichTextEditor from '@/Components/RichTextEditor';
import MaterialsInput from '@/Components/MaterialsInput';
import { useTranslation } from 'react-i18next';
import { Exercise, AgeGroup } from '@/types';

interface ExerciseDialogProps {
    show: boolean;
    onClose: () => void;
    exercise?: Exercise | null;
    ageGroups?: AgeGroup[];
}

export default function ExerciseDialog({
    show,
    onClose,
    exercise,
    ageGroups = [],
}: ExerciseDialogProps) {
    const { t } = useTranslation();
    const isEditing = !!exercise;

    const { data, setData, post, put, processing, errors, reset, setDefaults } = useForm({
        title: '',
        description: '',
        explanation: '',
        youtube_url: '',
        duration_minutes: '',
        materials: [] as string[],
        age_groups: [] as number[],
        framework_age_groups: [] as number[],
    });

    useEffect(() => {
        if (exercise) {
            const values = {
                title: exercise.title,
                description: exercise.description,
                explanation: exercise.explanation,
                youtube_url: exercise.youtube_url ?? '',
                duration_minutes: String(exercise.duration_minutes),
                materials: exercise.materials.map((m) => m.name),
                age_groups: exercise.age_groups?.map((ag) => ag.id) ?? [],
                framework_age_groups: exercise.age_groups
                    ?.filter((ag) => ag.pivot?.is_framework)
                    .map((ag) => ag.id) ?? [],
            };
            setDefaults(values);
            // Also set current data
            setData(values);
        } else {
            const empty = {
                title: '',
                description: '',
                explanation: '',
                youtube_url: '',
                duration_minutes: '',
                materials: [] as string[],
                age_groups: [] as number[],
                framework_age_groups: [] as number[],
            };
            setDefaults(empty);
            setData(empty);
        }
    }, [show]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('exercises.update', exercise.id), {
                onSuccess: () => handleClose(),
            });
        } else {
            post(route('exercises.store'), {
                onSuccess: () => handleClose(),
            });
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900">
                    {isEditing ? t('exercises.editExercise') : t('exercises.addNewExercise')}
                </h2>

                <div className="mt-6 space-y-5">
                    {/* Title */}
                    <div>
                        <InputLabel htmlFor="title" value={t('exercises.titleLabel')} />
                        <TextInput
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    {/* Short description */}
                    <div>
                        <InputLabel
                            htmlFor="description"
                            value={t('exercises.shortDescription')}
                        />
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            maxLength={500}
                            rows={2}
                            className="mt-1 block w-full border-3 border-gray-300 px-3 py-2 text-sm shadow-brutal-sm transition focus:border-gray-800 focus:ring-0"
                            required
                        />
                        <div className="mt-1 flex items-center justify-between">
                            <InputError message={errors.description} />
                            <span className="text-xs text-gray-400">
                                {data.description.length}/500
                            </span>
                        </div>
                    </div>

                    {/* Explanation (rich text) */}
                    <div>
                        <InputLabel value={t('exercises.explanation')} />
                        <div className="mt-1">
                            <RichTextEditor
                                value={data.explanation}
                                onChange={(html) =>
                                    setData('explanation', html)
                                }
                                error={errors.explanation}
                            />
                        </div>
                        <InputError
                            message={errors.explanation}
                            className="mt-1"
                        />
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <InputLabel
                            htmlFor="youtube_url"
                            value={t('exercises.youtubeUrl')}
                        />
                        <TextInput
                            id="youtube_url"
                            type="url"
                            value={data.youtube_url}
                            onChange={(e) =>
                                setData('youtube_url', e.target.value)
                            }
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="mt-1 block w-full"
                        />
                        <InputError
                            message={errors.youtube_url}
                            className="mt-1"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <InputLabel
                            htmlFor="duration_minutes"
                            value={t('exercises.duration')}
                        />
                        <TextInput
                            id="duration_minutes"
                            type="number"
                            min="1"
                            value={data.duration_minutes}
                            onChange={(e) =>
                                setData('duration_minutes', e.target.value)
                            }
                            className="mt-1 block w-32"
                            required
                        />
                        <InputError
                            message={errors.duration_minutes}
                            className="mt-1"
                        />
                    </div>

                    {/* Materials */}
                    <div>
                        <InputLabel value={t('exercises.materials')} />
                        <div className="mt-1">
                            <MaterialsInput
                                value={data.materials}
                                onChange={(materials) =>
                                    setData('materials', materials)
                                }
                                error={errors.materials}
                            />
                        </div>
                        <InputError
                            message={errors.materials}
                            className="mt-1"
                        />
                    </div>

                    {/* Age Groups */}
                    {ageGroups.length > 0 && (
                        <div>
                            <InputLabel value={t('exercises.ageGroups')} />
                            <div className="mt-1 flex flex-wrap gap-2">
                                {ageGroups.map((ag) => (
                                    <label
                                        key={ag.id}
                                        className={`cursor-pointer border-3 px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition ${
                                            data.age_groups.includes(ag.id)
                                                ? 'border-brand-black bg-brand-gold text-brand-black'
                                                : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={data.age_groups.includes(ag.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setData('age_groups', [...data.age_groups, ag.id]);
                                                } else {
                                                    setData('age_groups', data.age_groups.filter((id) => id !== ag.id));
                                                    // Also remove from framework if unchecked
                                                    setData('framework_age_groups', data.framework_age_groups.filter((id) => id !== ag.id));
                                                }
                                            }}
                                        />
                                        {ag.label}
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.age_groups} className="mt-1" />
                        </div>
                    )}

                    {/* Framework Exercise Toggle */}
                    {data.age_groups.length > 0 && (
                        <div>
                            <InputLabel value={t('exercises.frameworkExercise')} />
                            <div className="mt-1 flex flex-wrap gap-2">
                                {ageGroups
                                    .filter((ag) => data.age_groups.includes(ag.id))
                                    .map((ag) => (
                                        <label
                                            key={ag.id}
                                            className={`cursor-pointer border-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                                                data.framework_age_groups.includes(ag.id)
                                                    ? 'border-emerald-600 bg-emerald-100 text-emerald-800'
                                                    : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={data.framework_age_groups.includes(ag.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setData('framework_age_groups', [...data.framework_age_groups, ag.id]);
                                                    } else {
                                                        setData('framework_age_groups', data.framework_age_groups.filter((id) => id !== ag.id));
                                                    }
                                                }}
                                            />
                                            {ag.label}
                                        </label>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex items-center justify-end gap-3">
                    <SecondaryButton type="button" onClick={handleClose}>
                        {t('common.cancel')}
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {processing ? t('common.saving') : t('exercises.saveExercise')}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
