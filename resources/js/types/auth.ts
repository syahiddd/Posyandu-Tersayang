export type Role = 'kader' | 'ketua';

export type User = {
    id: number;
    name: string;
    username: string;
    role: Role;
};

export type Auth = {
    user: User | null;
};
