import { ReactNode } from 'react';
import GeneralContextProvider from './General/GeneralProvider';
import SettingsContextProvider from './Settings/SettingsProvider';
import UserSessionContextProvider from './UserSession/UserSessionProvider';

const ContextProviders = ({ children }: { children: ReactNode }) => (
    <GeneralContextProvider>
        <SettingsContextProvider>
            <UserSessionContextProvider>{children}</UserSessionContextProvider>
        </SettingsContextProvider>
    </GeneralContextProvider>
);

export default ContextProviders;
