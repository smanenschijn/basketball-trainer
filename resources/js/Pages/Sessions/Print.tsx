import { Head } from '@inertiajs/react';
import { Session } from '@/types';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from '@/utils/sanitize';

interface Props {
    session: Session;
}

export default function Print({ session }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${session.title} - ${t('sessions.printSession')}`} />

            <div className="mx-auto max-w-3xl px-6 py-8 text-black">
                {/* Print button — hidden when printing */}
                <div className="mb-8 flex justify-end print:hidden">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-4 py-2 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal-sm transition hover:bg-yellow-400"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.25 7.034V3.375" />
                        </svg>
                        {t('sessions.printSession')}
                    </button>
                </div>

                {/* Session header */}
                <h1 className="text-3xl font-black uppercase tracking-tight">
                    {session.title}
                </h1>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                    {session.age_group && <span>{session.age_group.label}</span>}
                    <span>{session.duration_minutes} {t('common.min')}</span>
                </div>

                <hr className="my-6 border-gray-300" />

                {/* Exercise overview */}
                <section className="mb-8">
                    <h2 className="mb-3 text-lg font-black uppercase tracking-wide">
                        {t('sessions.exerciseOverview')}
                    </h2>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        {session.exercises.map((exercise) => (
                            <li key={exercise.pivot.id} className="font-medium">
                                {exercise.title}
                                <span className="ml-2 text-gray-500">
                                    ({exercise.pivot.duration_override ?? exercise.duration_minutes} {t('common.min')})
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                <hr className="my-6 border-gray-300" />

                {/* Exercise details */}
                {session.exercises.map((exercise, index) => (
                    <section
                        key={exercise.pivot.id}
                        className="mb-8 break-inside-avoid"
                    >
                        <h2 className="text-xl font-black uppercase tracking-tight">
                            {index + 1}. {exercise.title} ({exercise.pivot.duration_override ?? exercise.duration_minutes} {t('common.min')})
                        </h2>

                        {/* Materials */}
                        <div className="mt-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-gray-500">
                                {t('sessions.requiredMaterials')}
                            </h3>
                            <p className="mt-1 text-sm">
                                {exercise.materials.length > 0
                                    ? exercise.materials.map((m) => m.name).join(', ')
                                    : t('exercises.noMaterials')}
                            </p>
                        </div>

                        {/* Instruction */}
                        {exercise.explanation && (
                            <div className="mt-3">
                                <h3 className="text-sm font-black uppercase tracking-wider text-gray-500">
                                    {t('sessions.explanation')}
                                </h3>
                                <div
                                    className="prose prose-sm mt-1 max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(exercise.explanation) }}
                                />
                            </div>
                        )}

                        {index < session.exercises.length - 1 && (
                            <hr className="mt-6 border-gray-200" />
                        )}
                    </section>
                ))}
            </div>
        </>
    );
}
