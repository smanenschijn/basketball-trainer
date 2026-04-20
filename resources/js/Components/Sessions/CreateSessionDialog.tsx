import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { AgeGroup } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    show: boolean;
    onClose: () => void;
    ageGroups: AgeGroup[];
}

export default function CreateSessionDialog({ show, onClose, ageGroups }: Props) {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        duration_minutes: '60',
        age_group_id: '',
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('sessions.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-black uppercase tracking-wider text-brand-black">
                    {t('sessions.createSession')}
                </h2>

                <div className="mt-6 space-y-4">
                    {/* Title */}
                    <div>
                        <InputLabel htmlFor="session-title" value={t('sessions.sessionName')} />
                        <TextInput
                            id="session-title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder={t('sessions.sessionNamePlaceholder')}
                            required
                            autoFocus
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    {/* Duration */}
                    <div>
                        <InputLabel htmlFor="session-duration" value={t('sessions.duration')} />
                        <TextInput
                            id="session-duration"
                            type="number"
                            value={data.duration_minutes}
                            onChange={(e) => setData('duration_minutes', e.target.value)}
                            className="mt-1 block w-full"
                            min="1"
                            max="300"
                            required
                        />
                        <InputError message={errors.duration_minutes} className="mt-2" />
                    </div>

                    {/* Age Group */}
                    <div>
                        <InputLabel htmlFor="session-age-group" value={t('sessions.targetAgeGroup')} />
                        <select
                            id="session-age-group"
                            value={data.age_group_id}
                            onChange={(e) => setData('age_group_id', e.target.value)}
                            className="mt-1 block w-full border-3 border-brand-black bg-white px-3 py-2 text-sm shadow-brutal-sm focus:border-brand-black focus:ring-0"
                        >
                            <option value="">{t('filters.allAges')}</option>
                            {ageGroups.map((ag) => (
                                <option key={ag.id} value={ag.id}>
                                    {ag.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.age_group_id} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={handleClose}>
                        {t('common.cancel')}
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>
                        {t('sessions.create')}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
