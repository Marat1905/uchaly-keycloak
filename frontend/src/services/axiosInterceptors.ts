// src/services/axiosInterceptors.ts
// =============================================================================
// Axios-интерцепторы.
// - requestInterceptor: добавляет Bearer-токен из Keycloak.
// - responseErrorInterceptor: при 401 пытается обновить токен через
//   keycloak.updateToken() и повторить исходный запрос. Если обновить
//   не удалось — делает logout.
// =============================================================================

import axios, {
    type InternalAxiosRequestConfig,
    type AxiosResponse,
    type AxiosError,
} from 'axios';
import keycloak from '../keycloak';

/**
 * Добавляет заголовок Authorization с текущим access-токеном Keycloak.
 * Если токен истёк — синхронно обновляет его.
 */
export const requestInterceptor = async (
    config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
    if (keycloak.authenticated) {
        try {
            // Обновляем токен, если он истекает в ближайшие 30 секунд
            await keycloak.updateToken(30);
        } catch (error) {
            console.warn('[Axios] Не удалось обновить токен перед запросом:', error);
        }

        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
    }

    // Для FormData запросов не устанавливаем Content-Type — браузер сам подставит boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
};

export const requestErrorInterceptor = (error: unknown) => {
    return Promise.reject(error);
};

/**
 * Пропускает успешные ответы без изменений.
 */
export const responseInterceptor = (response: AxiosResponse) => {
    return response;
};

/**
 * Обработка 401: попытка refresh + повтор исходного запроса.
 * Если refresh не удался — logout и редирект на /login.
 */
export const responseErrorInterceptor = async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
        // Не пытаемся обновлять токен для запросов к самому Keycloak —
        // иначе получим рекурсию.
        if (
            originalRequest.url?.includes('/realms/') ||
            originalRequest.url?.includes('/admin/realms/') ||
            originalRequest.url?.includes('/protocol/openid-connect/')
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const refreshed = await keycloak.updateToken(30);

            if (refreshed && keycloak.token) {
                originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                return axios(originalRequest);
            }
        } catch (refreshError) {
            console.warn('[Axios] Refresh token failed, logging out');
            keycloak.logout({ redirectUri: window.location.origin + '/login' });
            return Promise.reject(refreshError);
        }

        // Если refreshed === false, значит токен ещё валиден, но сервер вернул 401 —
        // скорее всего проблема в правах. Пробрасываем ошибку.
        return Promise.reject(error);
    }

    return Promise.reject(error);
};