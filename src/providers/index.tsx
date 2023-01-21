import { ReactNode } from 'react';
import SettingsContextProvider from './Settings/SettingsProvider';
import UserSessionContextProvider from './UserSession/UserSessionProvider';

const ContextProviders = ({ children }: { children: ReactNode }) => (
    <SettingsContextProvider>
        <UserSessionContextProvider>{children}</UserSessionContextProvider>
    </SettingsContextProvider>
);

export default ContextProviders;
