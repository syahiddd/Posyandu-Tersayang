export type Role = 'kader' | 'ketua';

export type User = {
    id: number;
    name: string;
    username: string;
    role: Role;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Auth = {
    user: User;
};
