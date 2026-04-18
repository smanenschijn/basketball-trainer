import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AgeGroup, Exercise, TechnicalFramework } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    framework: TechnicalFramework | null;
    ageGroups: AgeGroup[];
    exercisesByAgeGroup: Record<number, Exercise[]>;
}

const UploadIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const BookIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

export default function Index({ framework, ageGroups, exercisesByAgeGroup }: Props) {
    const { t } = useTranslation();
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<number | null>(ageGroups[0]?.id ?? null);
    const [showManage, setShowManage] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadForm = useForm<{
        pdf: File | null;
        bookmarks: Record<string, string>;
    }>({
        pdf: null,
        bookmarks: ageGroups.reduce(
            (acc, ag) => ({
                ...acc,
                [ag.id]: framework?.age_group_bookmarks?.[String(ag.id)]?.toString() ?? '',
            }),
            {} as Record<string, string>,
        ),
    });

    const handleUpload: FormEventHandler = (e) => {
        e.preventDefault();

        // Build form data manually since useForm doesn't handle File + nested objects well
        const formData = new FormData();
        if (uploadForm.data.pdf) {
            formData.append('pdf', uploadForm.data.pdf);
        }
        for (const [key, value] of Object.entries(uploadForm.data.bookmarks)) {
            if (value) {
                formData.append(`bookmarks[${key}]`, value);
            }
        }

        uploadForm.post(route('technical-framework.upload'), {
            forceFormData: true,
            onSuccess: () => {
                setShowManage(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const jumpToPage = (page: number) => {
        if (iframeRef.current && framework) {
            iframeRef.current.src = `${framework.pdf_url}#page=${page}`;
        }
    };

    const selectedExercises = selectedAgeGroup
        ? (exercisesByAgeGroup[selectedAgeGroup] ?? [])
        : [];

    const hasBookmarks = framework && Object.values(framework.age_group_bookmarks).some((v) => v);

    return (
        <AuthenticatedLayout>
            <Head title={t('framework.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-black">
                            {t('framework.title')}
                        </h1>
                        {framework && (
                            <p className="mt-1 text-sm text-gray-600">
                                {t('framework.currentFile')}: {framework.original_filename}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowManage(!showManage)}
                        className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400"
                    >
                        <UploadIcon />
                        {t('framework.manageDocument')}
                        <ChevronIcon open={showManage} />
                    </button>
                </div>

                {/* Upload / Manage Panel */}
                {showManage && (
                    <div className="mb-6 border-3 border-brand-black bg-white p-6 shadow-brutal">
                        <form onSubmit={handleUpload} className="space-y-4">
                            {/* File input */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-brand-black">
                                    {framework ? t('framework.replace') : t('framework.upload')}
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => uploadForm.setData('pdf', e.target.files?.[0] ?? null)}
                                    className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:border-3 file:border-brand-black file:bg-brand-gold file:px-4 file:py-2 file:text-sm file:font-bold file:uppercase file:text-brand-black hover:file:bg-yellow-400"
                                />
                                {uploadForm.errors.pdf && (
                                    <p className="mt-1 text-sm text-red-600">{uploadForm.errors.pdf}</p>
                                )}
                            </div>

                            {/* Bookmarks */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider text-brand-black">
                                    {t('framework.bookmarks')}
                                </label>
                                <p className="mt-1 text-xs text-gray-500">{t('framework.bookmarkHelp')}</p>
                                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                                    {ageGroups.map((ag) => (
                                        <div key={ag.id}>
                                            <label className="block text-xs font-bold text-gray-700">{ag.label}</label>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder={t('framework.pageNumber')}
                                                value={uploadForm.data.bookmarks[ag.id] ?? ''}
                                                onChange={(e) =>
                                                    uploadForm.setData('bookmarks', {
                                                        ...uploadForm.data.bookmarks,
                                                        [ag.id]: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full border-3 border-gray-300 px-2 py-1.5 text-sm shadow-brutal-sm focus:border-gray-800 focus:ring-0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploadForm.processing || (!uploadForm.data.pdf && !framework)}
                                className="inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400 disabled:opacity-50"
                            >
                                <UploadIcon />
                                {uploadForm.processing ? t('common.saving') : framework ? t('framework.replace') : t('framework.upload')}
                            </button>
                        </form>
                    </div>
                )}

                {framework ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                        {/* PDF Viewer */}
                        <div>
                            {/* Age group bookmark buttons */}
                            {hasBookmarks && (
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        {t('framework.jumpTo')}:
                                    </span>
                                    {ageGroups.map((ag) => {
                                        const page = framework.age_group_bookmarks[String(ag.id)];
                                        if (!page) return null;
                                        return (
                                            <button
                                                key={ag.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedAgeGroup(ag.id);
                                                    jumpToPage(page);
                                                }}
                                                className={`border-3 px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition ${
                                                    selectedAgeGroup === ag.id
                                                        ? 'border-brand-black bg-brand-gold text-brand-black'
                                                        : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                                                }`}
                                            >
                                                {ag.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="border-3 border-brand-black shadow-brutal">
                                <iframe
                                    ref={iframeRef}
                                    src={framework.pdf_url}
                                    className="h-[80vh] w-full"
                                    title={t('framework.title')}
                                />
                            </div>
                        </div>

                        {/* Sidebar: Framework Exercises */}
                        <div>
                            <div className="sticky top-4">
                                <div className="border-3 border-brand-black bg-white shadow-brutal">
                                    <div className="border-b-3 border-brand-black bg-brand-gold px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <BookIcon />
                                            <h2 className="text-sm font-black uppercase tracking-wider text-brand-black">
                                                {t('framework.exercises')}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Age group tabs */}
                                    <div className="flex flex-wrap border-b border-gray-200">
                                        {ageGroups.map((ag) => (
                                            <button
                                                key={ag.id}
                                                type="button"
                                                onClick={() => setSelectedAgeGroup(ag.id)}
                                                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                                                    selectedAgeGroup === ag.id
                                                        ? 'border-b-2 border-brand-gold text-brand-black'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                {ag.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Exercise list */}
                                    <div className="max-h-[60vh] overflow-y-auto">
                                        {selectedExercises.length > 0 ? (
                                            <ul className="divide-y divide-gray-100">
                                                {selectedExercises.map((exercise) => (
                                                    <li key={exercise.id}>
                                                        <Link
                                                            href={`${route('exercises.show', exercise.slug)}?from=framework`}
                                                            className="block px-4 py-3 transition hover:bg-gray-50"
                                                        >
                                                            <p className="text-sm font-bold text-brand-black">
                                                                {exercise.title}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {exercise.duration_minutes} {t('common.min')}
                                                                {exercise.materials.length > 0 && (
                                                                    <> &middot; {exercise.materials.map((m) => m.name).join(', ')}</>
                                                                )}
                                                            </p>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <p className="text-sm text-gray-400">{t('framework.noExercises')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* No PDF uploaded state */
                    <div className="border-3 border-dashed border-gray-300 py-16 text-center">
                        <BookIcon />
                        <p className="mt-4 text-lg font-bold text-gray-400">{t('framework.noDocument')}</p>
                        <button
                            type="button"
                            onClick={() => setShowManage(true)}
                            className="mt-4 inline-flex items-center gap-2 border-3 border-brand-black bg-brand-gold px-5 py-2.5 text-sm font-black uppercase tracking-wider text-brand-black shadow-brutal transition hover:bg-yellow-400"
                        >
                            <UploadIcon />
                            {t('framework.upload')}
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
