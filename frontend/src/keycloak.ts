// src/keycloak.ts
// =============================================================================
// Инициализация Keycloak-клиента (keycloak-js).
// Все параметры берутся из переменных окружения Vite (import.meta.env.VITE_*).
// =============================================================================

import Keycloak, { type KeycloakConfig } from 'keycloak-js';

/**
 * Конфигурация Keycloak.
 *
 * VITE_KEYCLOAK_URL — публичный URL Keycloak (например, http://localhost:8090).
 *   В dev-режиме Vite проксирует /realms и /admin на этот же адрес,
 *   но keycloak-js требует абсолютный URL для redirect.
 *
 * VITE_KEYCLOAK_REALM — имя realm (uchaly).
 *
 * VITE_KEYCLOAK_CLIENT_ID — clientId публичного SPA-клиента (uchaly-frontend).
 */
const keycloakConfig: KeycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8090',
    realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'uchaly',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'uchaly-frontend',
};

/**
 * Единственный экземпляр Keycloak на всё приложение.
 * Создаётся один раз при импорте модуля — keycloak-js этого требует.
 */
const keycloak = new Keycloak(keycloakConfig);

/**
 * Хук для react-router: сохраняет текущий путь, чтобы после логина
 * вернуться туда же. Мы используем его через onLoad: 'check-sso' и
 * redirectUri = window.location.href.
 */
export const getRedirectUri = (): string => {
    return window.location.origin + '/';
};

// =============================================================================
// ВАЖНО (исправление StrictMode):
// keycloak-js допускает только ОДИН вызов init() за время жизни страницы.
// React в dev-режиме (<StrictMode>) монтирует компоненты дважды, из-за чего
// AuthProvider дважды вызывает initKeycloak() и второй вызов падает с
// ошибкой "A 'Keycloak' instance can only be initialized once."
//
// Решение: модульный Promise-guard. Первый вызов initKeycloak() инициирует
// keycloak.init(...) и кладёт Promise в переменную initPromise. Все
// последующие вызовы (в т.ч. от повторного монтирования StrictMode)
// получают тот же самый Promise и НЕ запускают init заново.
// =============================================================================
let initPromise: Promise<boolean> | null = null;

/**
 * Инициализация Keycloak.
 *
 * onLoad: 'check-sso' — при старте приложения проверяем, есть ли SSO-сессия,
 *   но НЕ редиректим на форму логина автоматически (иначе нельзя
 *   показать гостевые страницы). Для принудительного входа используем
 *   keycloak.login().
 *
 * pkceMethod: 'S256' — обязательно для публичного SPA-клиента.
 *
 * silentCheckSsoRedirectUri — используем iframe на Keycloak для тихой
 *   проверки SSO (опционально, можно закомментировать).
 */
export const initKeycloak = (): Promise<boolean> => {
    // Если init уже был запущен (даже если он ещё не завершился) —
    // возвращаем тот же самый Promise. Это делает функцию идемпотентной
    // и безопасной при двойном монтировании в StrictMode.
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async (): Promise<boolean> => {
        try {
            const authenticated = await keycloak.init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                checkLoginIframe: false, // отключаем iframe-проверку (в некоторых браузерах блокируется)
                silentCheckSsoRedirectUri:
                    window.location.origin + '/silent-check-sso.html',
                flow: 'standard',
                responseMode: 'query',
            });

            return authenticated;
        } catch (error) {
            console.error('[Keycloak] Ошибка инициализации:', error);
            return false;
        }
    })();

    return initPromise;
};

/**
 * Автообновление access-токена.
 * keycloak-js сам обновляет токен, но мы дополнительно подстраховываемся
 * интервалом. Возвращаем функцию очистки.
 */
export const setupTokenRefresh = (): (() => void) => {
    const REFRESH_INTERVAL_MS = 30_000; // проверяем каждые 30 секунд

    const intervalId = window.setInterval(async () => {
        if (!keycloak.authenticated) return;

        try {
            const refreshed = await keycloak.updateToken(60); // обновить, если истекает <60 сек
            if (refreshed) {
                console.debug('[Keycloak] Токен обновлён');
            }
        } catch (error) {
            console.warn('[Keycloak] Не удалось обновить токен, разлогин:', error);
            keycloak.logout({ redirectUri: getRedirectUri() });
        }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
};

export default keycloak;