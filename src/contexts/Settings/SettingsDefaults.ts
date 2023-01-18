import { notImplementedFunction } from '../defaultFillers';
import { ISettingsContext, Settings, SettingsControllers, SettingsSessionData } from './SettingsTypes';

export const defaultSettings: Settings = {
    serverUrl: 'https://aims.nachotoast.com',
    rateLimitBypassToken: '',
    discordApplicationId: '1050340681463369738',
    redirectUri: `${window.location.origin}/login`,
    minRefreshSeconds: 30,
    maxRefreshMinutes: 3 * 24 * 60,
};

export const defaultSettingsControllers: SettingsControllers = {
    setValue: notImplementedFunction,
    resetValue: notImplementedFunction,
};

export const defaultSettingsSessionData: SettingsSessionData = {
    state: '',
    oAuthLink: '',
};

export const defaultSettingsContext: ISettingsContext = {
    settings: defaultSettings,
    controllers: defaultSettingsControllers,
    sessionData: defaultSettingsSessionData,
};
