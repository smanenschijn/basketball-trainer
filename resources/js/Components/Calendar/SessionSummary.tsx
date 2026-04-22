import { CalendarSession } from '@/types';
import { useTranslation } from 'react-i18next';

const FrameworkIcon = () => (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

interface Props {
    session: CalendarSession;
    /** Render at compact size (10px text) for calendar cells */
    compact?: boolean;
}

export default function SessionSummary({ session, compact = false }: Props) {
    const { t } = useTranslation();
    const textSize = compact ? 'text-[10px]' : 'text-xs';
    const titleSize = compact ? 'text-xs' : 'text-xs';

    return (
        <>
            <p className={`${titleSize} font-black uppercase text-brand-black`}>
                {session.title}
            </p>
            {session.age_group && (
                <p className={`${textSize} text-gray-500`}>{session.age_group.label}</p>
            )}
            <p className={`${textSize} text-gray-400`}>
                {session.duration_minutes} {t('common.min')} &middot;{' '}
                {t('sessions.exerciseCount', { count: session.exercise_count })}
            </p>
            {session.framework_exercise_count > 0 && (
                <div className={`mt-0.5 flex items-center gap-1 ${textSize} font-bold text-brand-black`}>
                    <FrameworkIcon />
                    {t('sessions.fundamentalCount', {
                        count: session.framework_exercise_count,
                    })}
                </div>
            )}
        </>
    );
}
