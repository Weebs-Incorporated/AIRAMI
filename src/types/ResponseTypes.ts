interface BaseResponse {
    status: number;
}

export interface SuccessResponse extends BaseResponse {
    data: unknown;
}

export interface SpecificFailResponse extends BaseResponse {
    data: unknown;
}

export interface GenericFailResponse extends BaseResponse {
    success: false;
    generic: true;
    statusText: string;
}

export type ServerResponse<TSuccess extends SuccessResponse, TFail extends SpecificFailResponse> =
    | ({ success: true } & TSuccess)
    | ({ success: false; generic: false } & TFail)
    | GenericFailResponse
    | 'canceled';

export interface Responsify<TData, TStatus extends number> {
    status: TStatus;
    data: TData;
}
