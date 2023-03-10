import { UserSession } from '../../contexts';

const KEY_USER_SESSION = 'AIRAMI.UserSession';

export function getLocalUserSession(): UserSession | null {
    const existing = localStorage.getItem(KEY_USER_SESSION);

    if (existing === null) return null;

    return JSON.parse(existing);
}

export function saveLocalUserSession(u: UserSession | null): void {
    if (u === null) {
        localStorage.removeItem(KEY_USER_SESSION);
    } else {
        localStorage.setItem(KEY_USER_SESSION, JSON.stringify(u));
    }
}
