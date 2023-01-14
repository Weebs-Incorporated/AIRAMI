export interface BaseResponseInfo {
    _code: number;
}

export interface RateLimitedResponse extends BaseResponseInfo {
    _code: 429;

    /** Maximum number of requests per time window. */
    limit: number;

    /** Number of requests remaining in this time window. */
    remaining: number;

    /** Number of seconds until this time window ends. */
    reset: number;

    /** Length of time window in seconds. */
    after: number;
}

export type ServerResponse<TSuccess, TFail extends BaseResponseInfo> =
    | { success: true; data: TSuccess }
    | { success: false; data: TFail };
