import type { MejaAktif } from '@/types';
import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            mejaAktif: MejaAktif | null;
            namaPosyandu: string | null;
            bolehKelolaAkun: boolean;
            [key: string]: unknown;
        };
    }
}
