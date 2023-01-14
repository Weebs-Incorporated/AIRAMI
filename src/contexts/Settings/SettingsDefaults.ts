import { ISettingsContext, Settings, SettingsControllers, SettingsSessionData } from './SettingsTypes';

export const defaultSettings: Settings = {
    serverUrl: 'https://aims.nachotoast.com',
    rateLimitBypassToken: '',
    discordApplicationId: '1050340681463369738',
    redirectUri: `${window.location.origin}/login`,
    minRefreshSeconds: 30,
    maxRefreshMinutes: 30,
};

export const defaultSettingsControllers: SettingsControllers = {
    setValue: function <T extends keyof Settings>(key: T, value: Settings[T]): void {
        throw new Error('Function not implemented.');
    },
    resetValue: function <T extends keyof Settings>(key: T): void {
        throw new Error('Function not implemented.');
    },
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
