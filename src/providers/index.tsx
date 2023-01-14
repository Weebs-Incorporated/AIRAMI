import { ReactNode } from 'react';
import SettingsContextProvider from './Settings/SettingsProvider';

const ContextProviders = ({ children }: { children: ReactNode }) => (
    <SettingsContextProvider>{children}</SettingsContextProvider>
);

export default ContextProviders;
