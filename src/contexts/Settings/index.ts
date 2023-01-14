import { createContext } from 'react';
import { defaultSettingsContext } from './SettingsDefaults';

export * from './SettingsDefaults';
export * from './SettingsTypes';

export const SettingsContext = createContext(defaultSettingsContext);
