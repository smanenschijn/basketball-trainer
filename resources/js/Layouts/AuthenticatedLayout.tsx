import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';

function NavPill({ href, label, icon, active = false }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
    const baseClasses = "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition";
    const activeClasses = active
        ? "bg-brand-gold text-black border-3 border-brand-gold"
        : "border-3 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black";

    if (href.startsWith('#')) {
        return <span className={`${baseClasses} ${activeClasses} cursor-default`}>{icon}{label}</span>;
    }

    return (
        <Link href={href} className={`${baseClasses} ${activeClasses}`}>
            {icon}{label}
        </Link>
    );
}

// Simple inline SVG icons
const HomeIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
    </svg>
);

const ExercisesIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const FrameworkIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const SessionsIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default function Authenticated({ children }: PropsWithChildren) {
    const { t } = useTranslation();
    const auth = (usePage().props as any).auth;
    const pendingRegistrationCount = (usePage().props as any).pendingRegistrationCount ?? 0;
    const user = auth?.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-brand-cream">
            <nav className="bg-brand-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo + Title */}
                        <div className="flex items-center gap-3">
                            <Link href={route('dashboard')} className="flex items-center gap-3">
                                <img src="/images/logo.png" alt="Basketball Trainer" className="h-20 w-20 -my-4 object-contain" />
                            </Link>
                        </div>

                        {/* Desktop nav pills */}
                        <div className="hidden items-center gap-3 sm:flex">
                            <NavPill
                                href={route('dashboard')}
                                label={t('nav.home')}
                                icon={<HomeIcon />}
                                active={route().current('dashboard')}
                            />
                            <NavPill
                                href={route('exercises.index')}
                                label={t('nav.exercises')}
                                icon={<ExercisesIcon />}
                                active={route().current('exercises.*')}
                            />
                            <NavPill
                                href={route('technical-framework.index')}
                                label={t('nav.technicalFramework')}
                                icon={<FrameworkIcon />}
                                active={route().current('technical-framework.*')}
                            />
                            <NavPill href="#" label={t('nav.sessions')} icon={<SessionsIcon />} />

                            {/* User dropdown */}
                            {user && (
                            <div className="relative ml-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-full border-3 border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition hover:text-white"
                                        >
                                            {user.name}
                                            {user.is_admin && pendingRegistrationCount > 0 && (
                                                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                                                    {pendingRegistrationCount}
                                                </span>
                                            )}
                                            <svg className="-me-0.5 ms-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>{t('nav.profile')}</Dropdown.Link>
                                        {user?.is_admin && (
                                            <Dropdown.Link href={route('admin.registration-requests.index')}>
                                                {t('admin.registrationRequests')}
                                            </Dropdown.Link>
                                        )}
                                        <Dropdown.Link href={route('logout')} method="post" as="button">{t('nav.logOut')}</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(prev => !prev)}
                                className="inline-flex items-center justify-center p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            {t('nav.home')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('exercises.index')} active={route().current('exercises.*')}>
                            {t('nav.exercises')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('technical-framework.index')} active={route().current('technical-framework.*')}>
                            {t('nav.technicalFramework')}
                        </ResponsiveNavLink>
                    </div>
                    <div className="border-t border-gray-700 pb-1 pt-4">
                        {user && (
                        <>
                        <div className="px-4">
                            <div className="flex items-center text-base font-medium text-white">
                                {user.name}
                                {user.is_admin && pendingRegistrationCount > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                                        {pendingRegistrationCount}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-gray-400">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>{t('nav.profile')}</ResponsiveNavLink>
                            {user?.is_admin && (
                                <ResponsiveNavLink href={route('admin.registration-requests.index')}>
                                    {t('admin.registrationRequests')}
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">{t('nav.logOut')}</ResponsiveNavLink>
                        </div>
                        </>
                        )}
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
