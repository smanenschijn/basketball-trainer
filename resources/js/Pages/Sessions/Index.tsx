import CreateSessionDialog from '@/Components/Sessions/CreateSessionDialog';
import SessionTile from '@/Components/Sessions/SessionTile';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AgeGroup, PaginatedData, Session } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    sessions: PaginatedData<Session>;
    ageGroups: AgeGroup[];
}

const PlusIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export default function Index({ sessions, ageGroups }: Props) {
    const { t } = useTranslation();
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title={t('sessions.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                            {t('sessions.title')}
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateDialog(true)}
                        className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400"
                    >
                        <PlusIcon />
                        {t('sessions.newTraining')}
                    </button>
                </div>

                {/* Session Grid */}
                {sessions.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sessions.data.map((session) => (
                            <SessionTile key={session.id} session={session} />
                        ))}
                    </div>
                ) : (
                    <div className="border-3 border-dashed border-gray-300 py-16 text-center">
                        <p className="text-lg font-bold text-gray-400">{t('sessions.noSessions')}</p>
                        <p className="mt-1 text-sm text-gray-400">{t('sessions.noSessionsDescription')}</p>
                        <button
                            type="button"
                            onClick={() => setShowCreateDialog(true)}
                            className="mt-6 inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400"
                        >
                            <PlusIcon />
                            {t('sessions.newTraining')}
                        </button>
                    </div>
                )}

                {/* Pagination */}
                <Pagination links={sessions.links} lastPage={sessions.last_page} />
            </div>

            <CreateSessionDialog
                show={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                ageGroups={ageGroups}
            />
        </AuthenticatedLayout>
    );
}
