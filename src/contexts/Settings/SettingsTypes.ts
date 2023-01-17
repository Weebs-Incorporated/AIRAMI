export interface Settings {
    /**
     * Endpoint for the AIMS API.
     * @default 'https://aims.nachotoast.com'
     */
    serverUrl: string;

    /**
     * Rate limit bypass token for the AIMS API.
     * @default ''
     */
    rateLimitBypassToken: string;

    /**
     * ID of Discord application to use in OAuth.
     * @default '1050340681463369738'
     */
    discordApplicationId: string;

    /**
     * URI to redirect to after login attempt.
     * @default `${window.location.origin}/login`
     */
    redirectUri: string;

    /**
     * Will not try to refresh site token if it expires in less than this many seconds.
     * @default 30
     */
    minRefreshSeconds: number;
    /**
     * Will try to refresh site token if it expires in this many minutes or less.
     * @default 3 * 24 * 60 // (3 days)
     */
    maxRefreshMinutes: number;
}

export interface SettingsControllers {
    setValue<T extends keyof Settings>(key: T, value: Settings[T]): void;
    resetValue<T extends keyof Settings>(key: T): void;
}

export interface SettingsSessionData {
    state: string;
    oAuthLink: string;
}

export interface ISettingsContext {
    settings: Settings;
    controllers: SettingsControllers;
    sessionData: SettingsSessionData;
}
