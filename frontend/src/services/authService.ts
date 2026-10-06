// src/services/authService.ts
// =============================================================================
// Сервис аутентификации на базе Keycloak.
// Методы login/logout/register — тонкие обёртки над keycloak-js.
// Работа с пользователями и ролями (создание/редактирование) —
// в adminService.ts (Keycloak Admin REST API).
// =============================================================================

import keycloak, { getRedirectUri } from '../keycloak';
import type { UserDto, ChangePasswordRequest } from '../types/auth';
import { jwtDecode } from 'jwt-decode';
import type { KeycloakTokenPayload } from '../types/auth';

/**
 * Преобразует payload access-токена Keycloak в наш UserDto.
 * ВАЖНО: часть полей (isActive, createdAt) в токене отсутствует — их
 * подставляет вызывающий код при необходимости, дозапрашивая Admin API.
 */
const mapTokenToUser = (payload: KeycloakTokenPayload): UserDto => {
    // Извлекаем realm-роли. В нашем realm-export маппер кладёт их в claim "roles".
    // На случай, если маппер не сработал, читаем из resource_access.
    const realmRoles: string[] =
        payload.roles ??
        payload.resource_access?.['uchaly-frontend']?.roles ??
        [];

    const firstName = payload.given_name ?? '';
    const lastName = payload.family_name ?? '';
    const patronymic = payload.patronymic ?? '';

    // Собираем fullName в том же формате, что и раньше: "Фамилия Имя Отчество"
    const fullName =
        [lastName, firstName, patronymic].filter(Boolean).join(' ').trim() ||
        payload.preferred_username ||
        '';

    return {
        id: payload.sub,
        email: payload.email ?? '',
        firstName,
        lastName,
        patronymic: patronymic || undefined,
        avatarUrl: undefined,
        isActive: true, // по умолчанию; уточняется через Admin API
        isDeleted: false, // в Keycloak нет мягкого удаления
        roles: realmRoles,
        createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
        fullName,
    };
};

export const authService = {
    // ---------------------------------------------------------------------
    // Аутентификация
    // ---------------------------------------------------------------------

    /**
     * Запускает Authorization Code Flow + PKCE.
     * Редиректит пользователя на форму логина Keycloak.
     */
    login: async (): Promise<void> => {
        await keycloak.login({
            redirectUri: getRedirectUri(),
        });
    },

    /**
     * Регистрация нового пользователя.
     *
     * ИСТОРИЯ ВОПРОСА:
     * В некоторых сборках keycloak-js 26.x метод keycloak.register()
     * приводит к редиректу на URL вида /[object Promise], потому что
     * внутри createRegisterUrl() возвращает Promise, который где-то
     * не дожидается await, и Promise stringify-ится в "[object Promise]".
     *
     * НАДЁЖНОЕ РЕШЕНИЕ:
     * Используем тот же рабочий путь, что и для входа — keycloak.login(),
     * но с параметром action: 'register'. Keycloak увидит этот параметр
     * и покажет пользователю страницу регистрации вместо страницы логина.
     * Это гарантированно работает, поскольку login() мы уже проверили.
     *
     * ВАЖНО: в realm-export (uchaly-realm.json) должно быть
     * registrationAllowed: true — иначе Keycloak откажется регистрировать.
     */
    register: async (): Promise<void> => {
        await keycloak.login({
            action: 'register',
            redirectUri: getRedirectUri(),
        });
    },

    /**
     * Выход из системы. Очищает SSO-сессию Keycloak.
     *
     * ИЗМЕНЕНИЕ:
     * Раньше redirectUri указывал на '/login', из-за чего после выхода
     * пользователь возвращался на страницу входа. Теперь возвращаем его
     * на главную страницу ('/').
     *
     * ВАЖНО: keycloak.logout() — это редирект на SSO-эндпоинт Keycloak,
     * браузер уходит со страницы SPA. Поэтому последующие вызовы
     * (например, navigate('/') внутри обработчика кнопки) не успевают
     * выполниться — реальный переход делает именно redirectUri.
     */
    logout: (): void => {
        keycloak.logout({
            redirectUri: window.location.origin + '/',
        });
    },

    /**
     * Возвращает текущего пользователя на основе access-токена.
     * Если пользователь не аутентифицирован — возвращает null.
     */
    getCurrentUser: (): UserDto | null => {
        if (!keycloak.authenticated || !keycloak.token) return null;

        try {
            const payload = jwtDecode<KeycloakTokenPayload>(keycloak.token);
            return mapTokenToUser(payload);
        } catch (error) {
            console.error('[authService] Не удалось декодировать токен:', error);
            return null;
        }
    },

    /**
     * Проверка, аутентифицирован ли пользователь.
     */
    isAuthenticated: (): boolean => {
        return Boolean(keycloak.authenticated);
    },

    /**
     * Возвращает access-токен (может быть null).
     */
    getToken: (): string | undefined => keycloak.token,

    /**
     * Обновляет токен и возвращает новый access-токен.
     */
    refreshToken: async (): Promise<string | undefined> => {
        await keycloak.updateToken(30);
        return keycloak.token;
    },

    /**
     * Смена пароля текущего пользователя.
     *
     * В Keycloak пользователь может сменить пароль через Account Console
     * (keycloak.accountManagement()) либо через Admin API. Здесь мы
     * перенаправляем в Account Console — самый безопасный способ.
     */
    changePassword: async (_userId: string, _request: ChangePasswordRequest): Promise<void> => {
        // ВАЖНО: параметры не используются — Keycloak сам знает, кто текущий
        // пользователь. Оставлены для совместимости с прежним интерфейсом.
        await keycloak.accountManagement();
    },

    /**
     * Открывает Account Console Keycloak (для редактирования профиля).
     */
    openAccountConsole: async (): Promise<void> => {
        await keycloak.accountManagement();
    },
};

export default authService;