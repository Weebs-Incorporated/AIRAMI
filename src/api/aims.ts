import axios, { AxiosRequestConfig, AxiosHeaders, AxiosResponse } from 'axios';
import { RateLimitedResponse, ServerResponse } from '../types/CommonResponses';

export interface BaseRequestProps<RateLimitApplicable extends boolean = false> {
    baseUrl: string;
    controller?: AbortController;
    rateLimitBypassToken?: RateLimitApplicable extends true ? string : never;
}

function attachController(conf: AxiosRequestConfig, controller?: AbortController): void {
    if (controller !== undefined) {
        conf.signal = controller.signal;
    }
}

function attachRateLimitBypassToken(headers: AxiosHeaders, token: string | undefined): void {
    headers.set('RateLimit-Bypass-Token', token || undefined);
}

function handleRateLimited(res: AxiosResponse): RateLimitedResponse {
    return {
        _code: 429,
        after: Number(res.headers['retry-after']),
        limit: Number(res.headers['ratelimit-limit']),
        remaining: Number(res.headers['ratelimit-remaining']),
        reset: Number(res.headers['ratelimit-reset']),
    };
}

export async function getRoot(
    props: BaseRequestProps<true>,
): Promise<
    ServerResponse<
        { startTime: string; version: string; receivedRequest: string },
        RateLimitedResponse | { _code: number; statusText: string }
    >
> {
    const { baseUrl, controller, rateLimitBypassToken } = props;

    const headers = new AxiosHeaders();
    attachRateLimitBypassToken(headers, rateLimitBypassToken);

    const conf: AxiosRequestConfig = { url: baseUrl, method: 'GET', headers };
    attachController(conf, controller);

    try {
        const { data } = await axios.request<{
            startTime: string;
            version: string;
            receivedRequest: string;
        }>(conf);
        return { success: true, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) throw error;

        if (error.response.status === 429)
            return {
                success: false,
                data: handleRateLimited(error.response),
            };
        return {
            success: false,
            data: { _code: error.response.status, statusText: error.response.statusText },
        };
    }
}

export async function checkRateLimitResponse(
    props: BaseRequestProps<true> & { rateLimitBypassToken: string },
): Promise<ServerResponse<null, { _code: 200; message: 'Error' } | { _code: 200; message: 'Invalid Token' }>> {
    const { baseUrl, controller, rateLimitBypassToken } = props;

    const headers = new AxiosHeaders();
    attachRateLimitBypassToken(headers, rateLimitBypassToken);

    const conf: AxiosRequestConfig = { url: baseUrl, method: 'GET', headers };
    attachController(conf, controller);

    try {
        const { headers } = await axios.request(conf);
        if (headers['ratelimit-bypass-response'] === 'Valid') {
            return { success: true, data: null };
        }
        return { success: false, data: { _code: 200, message: 'Invalid Token' } };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) throw error;

        if (error.response.status === 429)
            return {
                success: false,
                data: { _code: 200, message: 'Invalid Token' },
            };
        return {
            success: false,
            data: { _code: 200, message: 'Error' },
        };
    }
}
