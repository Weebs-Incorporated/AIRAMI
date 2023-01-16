import { RateLimited } from '../../types/CommonResponses';

export interface General {
    /** Global rate limit status. */
    rateLimited: (RateLimited & { since: Date }) | false;

    /** Global 404 status. */
    notFound: boolean;
}

export interface GeneralControllers {
    setRateLimited(r: RateLimited): void;
    clearRateLimited(): void;
    setNotFound(newNotFoundState: boolean): void;
}

export interface IGeneralContext {
    general: General;
    controllers: GeneralControllers;
}
