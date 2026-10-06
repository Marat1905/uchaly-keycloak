// src/keycloak.ts
// =============================================================================
// Инициализация Keycloak-клиента (keycloak-js).
//
// КЛЮЧЕВОЕ ОТЛИЧИЕ ОТ ПРЕДЫДУЩИХ ВЕРСИЙ:
// - В init() ЯВНО передаём redirectUri — жёстко заданную СТРОКУ.
//   Это исключает возможность keycloak-js взять location.href (в котором
//   может оказаться [object Promise] из-за застрявшей вкладки) или
//   кэшированный redirectUri из sessionStorage.
// - silentCheckSsoRedirectUri НЕ передаём — silent check через iframe
//   отключён, чтобы не было CORS-падений и fallback-редиректов.
// =============================================================================

import Keycloak, { type KeycloakConfig } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8090',
    realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'uchaly',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'uchaly-frontend',
};

/**
 * Единственный экземпляр Keycloak на всё приложение.
 */
const keycloak = new Keycloak(keycloakConfig);

/**
 * Статический redirectUri. Это ЧИСТАЯ СТРОКА, никогда не Promise.
 * Именно её передаём в init() и login(), чтобы keycloak-js не использовал
 * location.href (в котором может застрять [object Promise]).
 */
const STATIC_REDIRECT_URI = `${window.location.origin}/`;

/**
 * Promise инициализации. Хранится в module-scope, чтобы повторные вызовы
 * initKeycloak() возвращали тот же результат (защита от React 19 StrictMode).
 */
let initPromise: Promise<boolean> | null = null;

/**
 * Инициализация Keycloak.
 * ЯВНО передаём redirectUri — статическую строку.
 */
export const initKeycloak = (): Promise<boolean> => {
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            const authenticated = await keycloak.init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                // Отключаем iframe-проверку SSO, чтобы не было CORS-падений
                // и fallback-редиректов через location.href.
                checkLoginIframe: false,
                // КЛЮЧЕВОЕ: явно задаём redirectUri строкой.
                redirectUri: STATIC_REDIRECT_URI,
                flow: 'standard',
                responseMode: 'query',
                // silentCheckSsoRedirectUri — НЕ передаём вообще.
            });
            return authenticated;
        } catch (error) {
            console.error('[Keycloak] Ошибка инициализации:', error);
            initPromise = null;
            return false;
        }
    })();

    return initPromise;
};

/**
 * Явный getter для redirectUri — если понадобится в других местах.
 * Строго синхронная функция, всегда возвращает строку.
 */
export const getStaticRedirectUri = (): string => STATIC_REDIRECT_URI;

/**
 * Автообновление access-токена.
 */
export const setupTokenRefresh = (): (() => void) => {
    const REFRESH_INTERVAL_MS = 30_000;

    const intervalId = window.setInterval(async () => {
        if (!keycloak.authenticated) return;
        try {
            const refreshed = await keycloak.updateToken(60);
            if (refreshed) {
                console.debug('[Keycloak] Токен обновлён');
            }
        } catch (error) {
            console.warn('[Keycloak] Не удалось обновить токен, разлогин:', error);
            try {
                await keycloak.logout({ redirectUri: STATIC_REDIRECT_URI });
            } catch {
                keycloak.clearToken();
            }
        }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
};

export default keycloak;