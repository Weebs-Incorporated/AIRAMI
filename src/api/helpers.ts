import { AxiosRequestConfig, AxiosHeaders, AxiosResponse, CanceledError } from 'axios';
import { Responsify, BaseRequestProps, RateLimited, GenericFailResponse } from '../types';

type FullResponsifyFail<TData, TStatus extends number> = Responsify<TData, TStatus> & {
    success: false;
    generic: false;
};

export function makeRequestConfig(
    props: BaseRequestProps<boolean, boolean | 'optional'>,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    url?: string,
): AxiosRequestConfig {
    const { baseURL, controller, rateLimitBypassToken, siteToken } = props;

    const headers = new AxiosHeaders();

    if (rateLimitBypassToken !== undefined) headers.set('RateLimit-Bypass-Token', rateLimitBypassToken);

    if (siteToken !== undefined) headers.set('Authorization', `Bearer ${siteToken}`);

    const conf: AxiosRequestConfig = {
        baseURL,
        // cloudflare pages build dies without this assertion
        headers: headers as Exclude<AxiosRequestConfig['headers'], undefined>,
        method,
    };

    if (url !== undefined) conf.url = url;

    if (controller !== undefined) conf.signal = controller.signal;

    return conf;
}

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

export function genericFailResponse(res: AxiosResponse): GenericFailResponse {
    return {
        success: false,
        generic: true,
        status: res.status,
        statusText: res.statusText,
    };
}

export function unknownFailResponse(res: unknown): GenericFailResponse | 'canceled' {
    if (res instanceof CanceledError) return 'canceled';
    console.error(res);
    return {
        success: false,
        generic: true,
        status: 0,
        statusText: 'A really unknown error occurred',
    };
}
