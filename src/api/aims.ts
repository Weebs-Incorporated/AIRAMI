import axios, { isAxiosError } from 'axios';
import {
    BaseRequestProps,
    ClientFacingUser,
    LoginResponse,
    Post,
    PostAttributes,
    PostStatus,
    RateLimitedResponse,
    Responsify,
    Root,
    RootResponse,
    ServerResponse,
    User,
    UserPermissions,
} from '../types';
import { makeRequestConfig, unknownFailResponse, handleRateLimited, genericFailResponse } from './helpers';

export async function postRoot(
    props: BaseRequestProps<true, false>,
): Promise<ServerResponse<RootResponse, RateLimitedResponse>> {
    const config = makeRequestConfig(props, 'POST');

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
): Promise<ServerResponse<Responsify<void, 200>, Responsify<'Invalid Token', 200>>> {
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
        Responsify<LoginResponse<'login' | 'register'>, 200>,
        Responsify<void, 403 | 501> | RateLimitedResponse | Responsify<string, 500>
    >
> {
    const config = makeRequestConfig(props, 'POST', '/login');

    config.data = {
        code: authorizationCode,
        redirect_uri: redirectUri,
    };

    try {
        const { data } = await axios.request<LoginResponse<'login' | 'register'>>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 403 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        if (error.response.status === 500) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function requestRefresh(
    props: BaseRequestProps<true, true>,
): Promise<
    ServerResponse<
        Responsify<LoginResponse<'refresh'>, 200>,
        Responsify<string, 401 | 500> | Responsify<void, 403 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', '/refresh');

    try {
        const { data } = await axios.request<LoginResponse<'refresh'>>(config);
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

        if (error.response.status === 403 || error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        if (error.response.status === 500) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function requestLogout(
    props: BaseRequestProps<true, true>,
): Promise<ServerResponse<Responsify<void, 200 | 403>, Responsify<string, 401> | RateLimitedResponse>> {
    const config = makeRequestConfig(props, 'GET', '/logout');

    try {
        await axios.request<void>(config);
        return { success: true, status: 200, data: undefined };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 403) {
            console.warn('GET /logout returned status code 403, asserting that logout was successful!');
            return {
                success: true,
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

export async function requestSelf(
    props: BaseRequestProps<true, true>,
): Promise<
    ServerResponse<Responsify<User, 200>, Responsify<string, 401> | RateLimitedResponse | Responsify<void, 501>>
> {
    const config = makeRequestConfig(props, 'GET', '/users/@me');

    try {
        const { data } = await axios.request<User>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

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

export async function getUser(
    props: BaseRequestProps<true, 'optional'>,
    id: string,
): Promise<
    ServerResponse<
        Responsify<ClientFacingUser, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', `/users/${id}`);

    try {
        const { data } = await axios.request<ClientFacingUser>(config);
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

export async function patchUser(
    props: BaseRequestProps<true, true>,
    id: string,
    newPermissions: UserPermissions,
): Promise<
    ServerResponse<
        Responsify<void, 200 | 204>,
        | Responsify<string, 401>
        | Responsify<string | undefined, 403>
        | Responsify<void, 404 | 501>
        | RateLimitedResponse
    >
> {
    const config = makeRequestConfig<{ newPermissions: UserPermissions }>(props, 'PATCH', `/users/${id}`, {
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
                data: error.response.data === 'Forbidden' ? undefined : error.response.data,
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

type GetAllUsersOutput = {
    totalItems: number;
    users: ClientFacingUser[];
};

export async function getAllUsers(
    props: BaseRequestProps<true, true>,
    page: number,
    perPage: number,
): Promise<
    ServerResponse<
        Responsify<GetAllUsersOutput, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', `/users?page=${page}&perPage=${perPage}`);
    try {
        const { data } = await axios.request<GetAllUsersOutput>(config);

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

        if (error.response.status === 403 || error.response.status === 501) {
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

export async function getSomeUsers(
    props: BaseRequestProps<true, false>,
    withIds: string[],
): Promise<ServerResponse<Responsify<ClientFacingUser[], 200>, RateLimitedResponse | Responsify<void, 501>>> {
    if (withIds.length < 1) return { success: true, status: 200, data: [] };

    const config = makeRequestConfig<{ withIds: string[] }>(props, 'POST', '/users', {
        withIds: withIds.slice(0, 100),
    });

    try {
        const { data } = await axios.request<ClientFacingUser[]>(config);

        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

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

export async function editSubmissionAttributes(
    props: BaseRequestProps<true, true>,
    attributes: PostAttributes,
    id: string,
): Promise<
    ServerResponse<
        Responsify<Post<PostStatus.InitialAwaitingValidation>, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig<Partial<PostAttributes>>(props, 'PATCH', `/submissions/${id}`, attributes);

    try {
        const { data } = await axios.request<Post<PostStatus.InitialAwaitingValidation>>(config);

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

type GetAllSubmissionsOutput = {
    totalItems: number;
    submissions: Post<PostStatus.InitialAwaitingValidation>[];
};

export async function getAllSubmissions(
    props: BaseRequestProps<true, true>,
    page: number,
    perPage: number,
): Promise<
    ServerResponse<
        Responsify<GetAllSubmissionsOutput, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', `/submissions?page=${page}&perPage=${perPage}`);

    try {
        const { data } = await axios.request<GetAllSubmissionsOutput>(config);

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

        if (error.response.status === 403 || error.response.status === 501) {
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

export async function getSubmission(
    props: BaseRequestProps<true, true>,
    id: string,
): Promise<
    ServerResponse<
        Responsify<Post<PostStatus.InitialAwaitingValidation>, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', `/submissions/${id}`);

    try {
        const { data } = await axios.request<Post<PostStatus.InitialAwaitingValidation>>(config);

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

export async function acceptSubmission(
    props: BaseRequestProps<true, true>,
    id: string,
): Promise<
    ServerResponse<
        Responsify<void, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'POST', `/submissions/${id}`);

    try {
        const { data } = await axios.request<void>(config);

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

export async function rejectSubmission(
    props: BaseRequestProps<true, true>,
    id: string,
): Promise<
    ServerResponse<
        Responsify<void, 200>,
        Responsify<string, 401> | Responsify<void, 403 | 404 | 501> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'DELETE', `/submissions/${id}`);

    try {
        const { data } = await axios.request<void>(config);

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
