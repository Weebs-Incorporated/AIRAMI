import { GenericFailResponse, RateLimited } from '../types';

export const messages = {
    401: (m: string) => `Invalid Credentials (401): ${m}.`,
    403: (m?: string | void) => m ?? 'Missing Permissions (403)',
    429: (res: RateLimited) => `Rate limited, try again in ${res.reset} seconds.`,
    500: (m: string) => `Error 500: ${m}`,
    501: 'Database Disabled (501)',

    genericFail: (res: GenericFailResponse) =>
        `Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`,
    aborted: 'Aborted',
} as const;
