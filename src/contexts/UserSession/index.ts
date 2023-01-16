import { createContext } from 'react';
import { defaultUserSessionContext } from './UserSessionDefaults';

export * from './UserSessionDefaults';
export * from './UserSessionTypes';

export const UserSessionContext = createContext(defaultUserSessionContext);
