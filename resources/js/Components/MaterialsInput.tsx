import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface MaterialsInputProps {
    value: string[];
    onChange: (materials: string[]) => void;
    error?: string;
}

export default function MaterialsInput({
    value,
    onChange,
    error,
}: MaterialsInputProps) {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const fetchSuggestions = useCallback(
        (search: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (!search.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            debounceRef.current = setTimeout(async () => {
                try {
                    const { data } = await axios.get(
                        route('materials.index'),
                        { params: { search } },
                    );
                    const filtered = (data as string[]).filter(
                        (s) => !value.includes(s),
                    );
                    setSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                    setHighlightedIndex(-1);
                } catch {
                    setSuggestions([]);
                }
            }, 250);
        },
        [value],
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const addMaterial = useCallback(
        (name: string) => {
            const trimmed = name.trim().toLowerCase();
            if (trimmed && !value.includes(trimmed)) {
                onChange([...value, trimmed]);
            }
            setInput('');
            setSuggestions([]);
            setShowSuggestions(false);
            inputRef.current?.focus();
        },
        [value, onChange],
    );

    const removeMaterial = useCallback(
        (name: string) => {
            onChange(value.filter((m) => m !== name));
        },
        [value, onChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                addMaterial(suggestions[highlightedIndex]);
            } else if (input.trim()) {
                addMaterial(input);
            }
        } else if (
            e.key === 'Backspace' &&
            !input &&
            value.length > 0
        ) {
            removeMaterial(value[value.length - 1]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((i) =>
                Math.min(i + 1, suggestions.length - 1),
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative">
            <div
                className={`flex flex-wrap items-center gap-1.5 border-3 px-3 py-2 shadow-brutal-sm transition focus-within:border-gray-800 ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((material) => (
                    <span
                        key={material}
                        className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800"
                    >
                        {material}
                        <button
                            type="button"
                            onClick={() => removeMaterial(material)}
                            className="ml-0.5 text-gray-500 hover:text-gray-800"
                        >
                            &times;
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        fetchSuggestions(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 150)
                    }
                    placeholder={
                        value.length === 0 ? t('filters.materialsPlaceholder') : ''
                    }
                    className="min-w-[120px] flex-1 border-0 p-0 text-sm focus:ring-0"
                />
            </div>

            {showSuggestions && (
                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto border-3 border-gray-200 bg-white py-1 shadow-brutal">
                    {suggestions.map((s, i) => (
                        <li
                            key={s}
                            onMouseDown={() => addMaterial(s)}
                            className={`cursor-pointer px-3 py-1.5 text-sm ${
                                i === highlightedIndex
                                    ? 'bg-gray-100'
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
