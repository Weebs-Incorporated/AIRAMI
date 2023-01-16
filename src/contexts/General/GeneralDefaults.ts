import { RateLimited } from '../../types/CommonResponses';
import { General, GeneralControllers, IGeneralContext } from './GeneralTypes';

export const defaultGeneral: General = {
    rateLimited: false,
    notFound: false,
};

export const defaultGeneralControllers: GeneralControllers = {
    setRateLimited: function (r: RateLimited): void {
        throw new Error('Function not implemented.');
    },
    clearRateLimited: function (): void {
        throw new Error('Function not implemented.');
    },
    setNotFound: function (newNotFoundState: boolean): void {
        throw new Error('Function not implemented.');
    },
};

export const defaultGeneralContext: IGeneralContext = {
    general: defaultGeneral,
    controllers: defaultGeneralControllers,
};
