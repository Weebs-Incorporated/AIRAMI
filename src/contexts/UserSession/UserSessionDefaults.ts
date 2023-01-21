import { UserSessionControllers, IUserSessionContext } from './UserSessionTypes';
import { notImplementedFunction } from '../defaultFillers';

export const defaultUserSession = null;

export const defaultUserSessionControllers: UserSessionControllers = {
    requestLogin: notImplementedFunction,
    requestRefresh: notImplementedFunction,
    requestLogout: notImplementedFunction,
    updatePermissions: notImplementedFunction,
};

export const defaultUserSessionContext: IUserSessionContext = {
    user: defaultUserSession,
    controllers: defaultUserSessionControllers,
};
