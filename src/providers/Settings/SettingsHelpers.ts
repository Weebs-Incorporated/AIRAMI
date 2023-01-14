import { Settings, defaultSettings, SettingsSessionData } from '../../contexts';

const KEY_SETTINGS = 'AIRAMI.Settings';
const KEY_SETTINGS_STATE = 'AIRAMI.Settings.State';

export function getLocalSettings(): Settings {
    const existing = localStorage.getItem(KEY_SETTINGS);
    if (existing !== null) {
        const existingSettings = JSON.parse(existing) as Settings;

        return { ...defaultSettings, ...existingSettings };
    }
    return { ...defaultSettings };
}

export function saveLocalSettings(s: Settings): void {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
}

export function generateSessionData(discordApplicationId: string, redirectUri: string): SettingsSessionData {
    let state = sessionStorage.getItem(KEY_SETTINGS_STATE);
    if (state === null) {
        // generate new pseudorandom state
        // not cryptographically secure, but better than nothing
        state = new Array(32)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join('');
        sessionStorage.setItem(KEY_SETTINGS_STATE, state);
    }

    const linkParams = new URLSearchParams([
        ['response_type', 'code'],
        ['client_id', discordApplicationId],
        ['state', state],
        ['redirect_uri', redirectUri],
        ['prompt', 'consent'],
        ['scope', 'identify'],
    ]);

    const oAuthLink = `https://discord.com/api/v10/oauth2/authorize?${linkParams.toString()}`;

    return { state, oAuthLink };
}
