import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { defaultGeneral, General, GeneralContext, GeneralControllers, IGeneralContext } from '../../contexts';

const GeneralContextProvider = ({ children }: { children: ReactNode }) => {
    const [general, setGeneral] = useState<General>({ ...defaultGeneral });

    const setRateLimited = useCallback<GeneralControllers['setRateLimited']>(
        (r) => {
            console.log('now ratelimited');
            setGeneral({ ...general, rateLimited: { ...r, since: new Date() } });
        },
        [general],
    );

    const clearRateLimited = useCallback<GeneralControllers['clearRateLimited']>(() => {
        console.log('no longer ratelimited');
        setGeneral({ ...general, rateLimited: false });
    }, [general]);

    useEffect(() => {
        if (general.rateLimited === false) return;

        console.log(general.rateLimited.reset);

        const timeout = setTimeout(
            () => setGeneral({ ...general, rateLimited: false }),
            general.rateLimited.reset * 1000,
        );

        return () => {
            clearTimeout(timeout);
        };
    }, [general, general.rateLimited]);

    const setNotFound = useCallback<GeneralControllers['setNotFound']>(
        (newNotFoundState) => {
            setGeneral({ ...general, notFound: newNotFoundState });
        },
        [general],
    );

    const finalValue = useMemo<IGeneralContext>(() => {
        return {
            general,
            controllers: {
                setRateLimited,
                clearRateLimited,
                setNotFound,
            },
        };
    }, [general, clearRateLimited, setNotFound, setRateLimited]);

    return <GeneralContext.Provider value={finalValue}>{children}</GeneralContext.Provider>;
};

export default GeneralContextProvider;
