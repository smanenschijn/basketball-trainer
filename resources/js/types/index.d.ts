export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    is_admin: boolean;
}

export interface Material {
    id: number;
    name: string;
}

export interface AgeGroup {
    id: number;
    label: string;
    pivot?: {
        is_framework?: boolean;
    };
}

export interface Exercise {
    id: number;
    slug: string;
    title: string;
    description: string;
    explanation: string;
    youtube_url: string | null;
    duration_minutes: number;
    materials: Material[];
    age_groups: AgeGroup[];
    plays?: Play[];
    created_at: string;
    updated_at: string;
}

export interface TechnicalFramework {
    id: number;
    original_filename: string;
    age_group_bookmarks: Record<string, number>;
    pdf_url: string;
}

export interface SessionExercise extends Exercise {
    pivot: {
        id: number;
        sort_order: number;
        duration_override: number | null;
        notes: string | null;
    };
}

export interface Session {
    id: number;
    title: string;
    description: string | null;
    duration_minutes: number;
    age_group_id: number | null;
    age_group: AgeGroup | null;
    exercises: SessionExercise[];
    created_at: string;
    updated_at: string;
}

export interface CalendarSession {
    id: number;
    title: string;
    duration_minutes: number;
    age_group: AgeGroup | null;
    exercise_count: number;
    framework_exercise_count: number;
}

export interface CalendarAssignment {
    id: number;
    date: string;
    session: CalendarSession;
}

export interface PlayPlayer {
    id: string;
    team: 'yellow' | 'red';
    x: number;
    y: number;
    label: string;
}

export interface PlayLine {
    id: string;
    points: number[];
    dashed: boolean;
}

export interface PlayCanvasData {
    players: PlayPlayer[];
    lines: PlayLine[];
}

export interface Play {
    id: number;
    title: string;
    court_type: 'half' | 'full';
    canvas_data: PlayCanvasData;
    created_at: string;
    updated_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}
