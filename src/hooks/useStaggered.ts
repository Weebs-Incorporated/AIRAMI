import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseStaggeredReturn {
    /** Call this to begin the staggered entry. */
    beginTimer: () => void;
    /** Whether an element at position `i` should enter. */
    shouldStart: (i: number) => boolean;
}

/**
 * Handles staggered entry of elements.
 * @param {number[]} offsets Relative offsets in milliseconds.
 * @param {number} numElements Number of elements in this stagger sequence, if larger than the number of offsets then
 * the final offset will be cumulatively added.
 */
export function useStaggered(offsets: number[], numElements: number): UseStaggeredReturn {
    const [hasStarted, setHasStarted] = useState(false);
    const [trueOffsets] = useState(offsets);

    const delays = useMemo(() => {
        const finalOffset = trueOffsets.at(-1) ?? 0;
        const _delays = new Array<number>(numElements).fill(0);

        _delays[0] = trueOffsets.at(0) ?? finalOffset;

        for (let i = 1, len = numElements; i < len; i++) {
            const prevDelay = _delays[i - 1];
            const offset = trueOffsets[i] ?? finalOffset;
            _delays[i] = prevDelay + offset;
        }
        return _delays;
    }, [numElements, trueOffsets]);

    const [shouldEnter, setShouldEnter] = useState<boolean[]>(new Array(numElements).fill(false));

    useEffect(() => {
        setHasStarted(false);
        setShouldEnter(new Array(numElements).fill(false));
    }, [numElements, trueOffsets]);

    useEffect(() => {
        if (!hasStarted) return;
        const len = numElements;

        const timeouts = delays.map((_e, i) =>
            setTimeout(() => {
                setShouldEnter([...new Array(i + 1).fill(true), ...new Array(len - 1 - i).fill(false)]);
            }, delays[i]),
        );

        return () => {
            timeouts.map(clearTimeout);
        };
    }, [delays, hasStarted, numElements]);

    const shouldStart = useCallback(
        (i: number) => shouldEnter.at(i) ?? shouldEnter.at(numElements - 1) ?? true,
        [numElements, shouldEnter],
    );

    return {
        beginTimer: () => setHasStarted(true),
        shouldStart,
    };
}
