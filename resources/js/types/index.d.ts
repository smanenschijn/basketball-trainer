export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
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
    title: string;
    description: string;
    explanation: string;
    youtube_url: string | null;
    duration_minutes: number;
    materials: Material[];
    age_groups: AgeGroup[];
    created_at: string;
    updated_at: string;
}

export interface TechnicalFramework {
    id: number;
    original_filename: string;
    age_group_bookmarks: Record<string, number>;
    pdf_url: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
