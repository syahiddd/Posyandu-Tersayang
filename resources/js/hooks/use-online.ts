import { useSyncExternalStore } from 'react';

function langganan(kabari: () => void) {
    window.addEventListener('online', kabari);
    window.addEventListener('offline', kabari);

    return () => {
        window.removeEventListener('online', kabari);
        window.removeEventListener('offline', kabari);
    };
}

/** True selama peramban melaporkan ada jaringan (DESIGN bab 8, state Offline). */
export function useOnline(): boolean {
    return useSyncExternalStore(
        langganan,
        () => navigator.onLine,
        () => true,
    );
}
