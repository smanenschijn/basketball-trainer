import { Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
    lastPage: number;
}

export default function Pagination({ links, lastPage }: Props) {
    if (lastPage <= 1) return null;

    return (
        <nav className="mt-8 flex justify-center gap-1">
            {links.map((link, i) => (
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
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(link.label) }}
                />
            ))}
        </nav>
    );
}
