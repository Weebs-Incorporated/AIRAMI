import axios, { isAxiosError } from 'axios';
import { AIMS, BaseRequestProps, RateLimitedResponse, Responsify, Root, RootResponse, ServerResponse } from '../types';
import { Post, PostStatus } from '../types/AIMS';
import { makeRequestConfig, unknownFailResponse, handleRateLimited, genericFailResponse } from './helpers';

export async function getRoot(
    props: BaseRequestProps<true, false>,
): Promise<ServerResponse<RootResponse, RateLimitedResponse>> {
    const config = makeRequestConfig(props, 'GET');

    try {
        const { data } = await axios.request<Root>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        return genericFailResponse(error.response);
    }
}

export async function checkRateLimitResponse(
    props: BaseRequestProps<true, false> & { rateLimitBypassToken: string },
): Promise<ServerResponse<Responsify<void, 200>, Responsify<'Error' | 'Invalid Token', 200>>> {
    const config = makeRequestConfig(props, 'GET');

    try {
        const { headers } = await axios.request(config);
        if (headers['ratelimit-bypass-response'] === 'Valid') {
            return { success: true, status: 200, data: undefined };
        }
        return { success: false, generic: false, status: 200, data: 'Invalid Token' };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return { success: false, generic: false, status: 200, data: 'Invalid Token' };

        return genericFailResponse(error.response);
    }
}

export async function requestLogin(
    props: BaseRequestProps<true, false>,
    authorizationCode: string,
    redirectUri: string,
): Promise<
    ServerResponse<
        Responsify<AIMS.LoginResponse, 200>,
        Responsify<string, 400 | 500> | RateLimitedResponse | Responsify<void, 501>
    >
> {
    const config = makeRequestConfig(props, 'POST', '/login');

    config.data = {
        code: authorizationCode,
        redirect_uri: redirectUri,
    };

    try {
        const { data } = await axios.request<AIMS.LoginResponse>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 400 || error.response.status === 500) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.statusText,
            };
        }

        if (error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function requestRefresh(
    props: BaseRequestProps<true, true>,
): Promise<
    ServerResponse<
        Responsify<AIMS.LoginResponse, 200>,
        Responsify<void, 400 | 404 | 501> | Responsify<string, 401 | 500> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', '/refresh');

    try {
        const { data } = await axios.request<AIMS.LoginResponse>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 400 || error.response.status === 404 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 500) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.statusText,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function requestSelf(
    props: BaseRequestProps<true, true>,
): Promise<
    ServerResponse<
        Responsify<AIMS.User, 200>,
        Responsify<string, 401> | Responsify<void, 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', '/users/@me');

    try {
        const { data } = await axios.request<AIMS.User>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 404 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function requestLogout(
    props: BaseRequestProps<true, true>,
): Promise<
    ServerResponse<Responsify<void, 200>, Responsify<void, 400> | Responsify<string, 401> | RateLimitedResponse>
> {
    const config = makeRequestConfig(props, 'GET', '/logout');

    try {
        await axios.request<void>(config);
        return { success: true, status: 200, data: undefined };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 400) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function getUser(
    props: BaseRequestProps<true, 'optional'>,
    id: string,
): Promise<
    ServerResponse<
        Responsify<AIMS.ClientFacingUser, 200>,
        Responsify<string, 401> | Responsify<void, 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', `/users/${id}`);

    try {
        const { data } = await axios.request<AIMS.ClientFacingUser>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 404 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function patchUser(
    props: BaseRequestProps<true, true>,
    id: string,
    newPermissions: AIMS.UserPermissions,
): Promise<
    ServerResponse<
        Responsify<void, 200 | 204>,
        Responsify<string, 401 | 403> | Responsify<void, 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig<{ newPermissions: AIMS.UserPermissions }>(props, 'PATCH', `/users/${id}`, {
        newPermissions,
    });

    try {
        const { status } = await axios.request<void>(config);

        return { success: true, status: status === 204 ? status : 200, data: undefined };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 403) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data,
            };
        }

        if (error.response.status === 404 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

type GetUsersInput = {
    pagination: AIMS.PaginationInput;
    withIds: string[] | null;
};

type GetUsersOutput = {
    users: AIMS.ClientFacingUser[];
    pagination: AIMS.PaginationResponse;
};

export async function getUsers(
    props: BaseRequestProps<true, 'optional'>,
    pagination: AIMS.PaginationInput,
    withIds: string[] | null,
): Promise<
    ServerResponse<
        Responsify<GetUsersOutput, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig<GetUsersInput>(props, 'POST', '/users/all', { pagination, withIds });

    try {
        const { data } = await axios.request<GetUsersOutput>(config);

        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 403 || error.response.status === 404 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function getProxyImage(
    props: BaseRequestProps<true, false>,
    url: string,
): Promise<ServerResponse<Responsify<string, 200>, Responsify<void, 400> | RateLimitedResponse>> {
    const config = makeRequestConfig(props, 'GET', `/image/${encodeURIComponent(url)}`);

    try {
        const { data } = await axios.request(config);

        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 400) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function makeSubmission(
    props: BaseRequestProps<true, true>,
    post: Partial<Post<PostStatus.InitialAwaitingValidation>> & { url: string },
): Promise<
    ServerResponse<Responsify<string, 200>, Responsify<string, 401> | Responsify<void, 409 | 501> | RateLimitedResponse>
> {
    const config = makeRequestConfig(props, 'PUT', '/submissions', post);

    try {
        const { data } = await axios.request<string>(config);

        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 409 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}
