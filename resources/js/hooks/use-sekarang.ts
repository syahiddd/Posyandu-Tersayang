import { useEffect, useState } from 'react';

/** Waktu sekarang yang diperbarui berkala, untuk lama tunda (FR-49). */
export function useSekarang(intervalMs = 30_000): Date {
    const [sekarang, setSekarang] = useState(() => new Date());

    useEffect(() => {
        const pengatur = setInterval(() => setSekarang(new Date()), intervalMs);

        return () => clearInterval(pengatur);
    }, [intervalMs]);

    return sekarang;
}
