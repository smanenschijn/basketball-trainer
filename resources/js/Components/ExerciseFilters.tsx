import { AgeGroup, Material } from '@/types';
import { router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Filters {
    search?: string;
    age_group_id?: string;
    duration?: string;
    material_id?: string;
}

interface Props {
    filters: Filters;
    ageGroups: AgeGroup[];
    materials: Material[];
}

const FilterIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const SearchIcon = () => (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export default function ExerciseFilters({ filters, ageGroups, materials }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const applyFilters = useCallback((newFilters: Partial<Filters>) => {
        const merged = { ...filters, ...newFilters };

        // Remove empty values
        const cleaned = Object.fromEntries(
            Object.entries(merged).filter(([, v]) => v !== '' && v !== undefined),
        );

        router.get(route('exercises.index'), cleaned, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [filters]);

    const handleSearch = (value: string) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ search: value || undefined });
        }, 300);
    };

    const durationOptions = [
        { value: '', label: t('filters.anyDuration') },
        { value: '5', label: t('filters.minutesOrLess', { minutes: 5 }) },
        { value: '10', label: t('filters.minutesOrLess', { minutes: 10 }) },
        { value: '15', label: t('filters.minutesOrLess', { minutes: 15 }) },
        { value: '20', label: t('filters.minutesOrLess', { minutes: 20 }) },
        { value: '30', label: t('filters.minutesOrLess', { minutes: 30 }) },
        { value: '45', label: t('filters.minutesOrLess', { minutes: 45 }) },
        { value: '60', label: t('filters.minutesOrLess', { minutes: 60 }) },
    ];

    const selectClasses =
        'w-full appearance-none border-3 border-brand-black bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-brand-black focus:border-brand-gold focus:outline-none focus:ring-0';

    return (
        <div className="border-3 border-brand-black bg-white p-6 shadow-brutal">
            <div className="mb-4 flex items-center gap-2 text-brand-black">
                <FilterIcon />
                <h2 className="text-sm font-black uppercase tracking-wider">{t('filters.title')}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={t('filters.searchPlaceholder')}
                        className="w-full border-3 border-brand-black bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-brand-black placeholder-gray-400 focus:border-brand-gold focus:outline-none focus:ring-0"
                    />
                </div>

                {/* Age Group */}
                <div className="relative">
                    <select
                        value={filters.age_group_id ?? ''}
                        onChange={(e) => applyFilters({ age_group_id: e.target.value || undefined })}
                        className={selectClasses}
                    >
                        <option value="">{t('filters.allAges')}</option>
                        {ageGroups.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                                {ag.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="h-4 w-4 text-brand-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Duration */}
                <div className="relative">
                    <select
                        value={filters.duration ?? ''}
                        onChange={(e) => applyFilters({ duration: e.target.value || undefined })}
                        className={selectClasses}
                    >
                        {durationOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="h-4 w-4 text-brand-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Materials */}
                <div className="relative">
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
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="h-4 w-4 text-brand-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
