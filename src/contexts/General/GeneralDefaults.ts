import { General, GeneralControllers, IGeneralContext } from './GeneralTypes';
import { notImplementedFunction } from '../defaultFillers';

export const defaultGeneral: General = {
    rateLimited: false,
    notFound: false,
};

export const defaultGeneralControllers: GeneralControllers = {
    setRateLimited: notImplementedFunction,
    clearRateLimited: notImplementedFunction,
    setNotFound: notImplementedFunction,
};

export const defaultGeneralContext: IGeneralContext = {
    general: defaultGeneral,
    controllers: defaultGeneralControllers,
};
