import { isAxiosError, AxiosRequestConfig, AxiosHeaders, AxiosResponse, CanceledError } from 'axios';
import { Responsify, BaseRequestProps, RateLimited, GenericFailResponse } from '../types';

type FullResponsifyFail<TData, TStatus extends number> = Responsify<TData, TStatus> & {
    success: false;
    generic: false;
};

export function makeRequestConfig<T = never>(
    props: BaseRequestProps<boolean, boolean | 'optional'>,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    url?: string,
    data?: T,
    extraHeaders?: Record<string, string>,
): AxiosRequestConfig {
    const { baseURL, controller, rateLimitBypassToken, siteToken } = props;

    const headers = new AxiosHeaders();

    if (rateLimitBypassToken !== undefined && rateLimitBypassToken !== '') {
        headers.set('RateLimit-Bypass-Token', rateLimitBypassToken);
    }

    if (siteToken !== undefined) headers.set('Authorization', `Bearer ${siteToken}`);
    if (extraHeaders !== undefined) {
        for (const headerName of Object.keys(extraHeaders)) {
            headers.set(headerName, extraHeaders[headerName]);
        }
    }

    const conf: AxiosRequestConfig = {
        baseURL,
        // cloudflare pages build dies without this assertion
        headers: headers as Exclude<AxiosRequestConfig['headers'], undefined>,
        method,
        data,
    };

    if (url !== undefined) conf.url = url;

    if (controller !== undefined) conf.signal = controller.signal;

    return conf;
}

/**
 * Checks whether the response is a rate limited error esponse. If it is then this will also create an object out of
 * it's relevant headers.
 */
export function handleRateLimited(res: AxiosResponse): FullResponsifyFail<RateLimited, 429> | false {
    if (res.status !== 429) return false;

    return {
        success: false,
        generic: false,
        status: 429,
        data: {
            after: Number(res.headers['retry-after']),
            limit: Number(res.headers['ratelimit-limit']),
            remaining: Number(res.headers['ratelimit-remaining']),
            reset: Number(res.headers['ratelimit-reset']),
        },
    };
}

/** Creates an object out of an Axios response from a failed request.  */
export function genericFailResponse(res: AxiosResponse): GenericFailResponse {
    return {
        success: false,
        generic: true,
        status: res.status,
        statusText: res.statusText,
    };
}

/** Creates an object out of an Axios error or otherwise unknown response. */
export function unknownFailResponse(res: unknown): GenericFailResponse | 'aborted' {
    if (res instanceof CanceledError) return 'aborted';

    if (isAxiosError(res)) {
        return {
            success: false,
            generic: true,
            status: res.response?.status ?? res.status ?? 0,
            statusText: res.response?.statusText || res.message,
        };
    }

    console.error(res);
    return {
        success: false,
        generic: true,
        status: 0,
        statusText: 'A really unknown error occurred',
    };
}
