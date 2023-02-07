import { useCallback, useEffect, useState } from 'react';

type ActionStatuses = 'idle' | 'inProgress' | 'errored' | 'success';

export interface UseActionStateReturn {
    status: ActionStatuses;
    output: string;

    setSuccess: (successMessage?: string) => void;
    setError: (error: string) => void;
    setIdle: () => void;
    setInProgress: (progressMessage?: string) => void;
}

/** Generalized information about an asynchronous action. */
export function useActionState(): UseActionStateReturn {
    const [status, setStatus] = useState<ActionStatuses>('idle');
    const [output, setOutput] = useState<string>('');

    const setSuccess = useCallback<UseActionStateReturn['setSuccess']>((m) => {
        setStatus('success');
        setOutput(m ?? '');
    }, []);

    const setError = useCallback<UseActionStateReturn['setError']>((m) => {
        setStatus('errored');
        setOutput(m);
    }, []);

    const setIdle = useCallback<UseActionStateReturn['setIdle']>(() => {
        setStatus('idle');
        setOutput('');
    }, []);

    const setInProgress = useCallback<UseActionStateReturn['setInProgress']>((m) => {
        setStatus('inProgress');
        setOutput(m ?? '');
    }, []);

    // go to idle after a while
    useEffect(() => {
        if (status === 'idle') return;

        const timeout = setTimeout(setIdle, 5_000);

        return () => {
            clearTimeout(timeout);
        };
    }, [setIdle, status]);

    return { status, output, setSuccess, setError, setIdle, setInProgress };
}
