import { Responsify } from './ResponseTypes';

export interface RateLimited {
    /** Maximum number of requests per time window. */
    limit: number;

    /** Number of requests remaining in this time window. */
    remaining: number;

    /** Number of seconds until this time window ends. */
    reset: number;

    /** Length of time window in seconds. */
    after: number;
}

export type RateLimitedResponse = Responsify<RateLimited, 429>;

export interface Root {
    startTime: string;
    version: string;
    receivedRequest: string;
}

export type RootResponse = Responsify<Root, 200>;
