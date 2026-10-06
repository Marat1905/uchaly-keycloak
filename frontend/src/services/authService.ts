// src/services/authService.ts
// =============================================================================
// Сервис аутентификации на базе Keycloak.
// Все вызовы login/register/logout ЯВНО передают redirectUri как строку.
// =============================================================================

import keycloak, { getStaticRedirectUri } from '../keycloak';
import type { UserDto, ChangePasswordRequest, KeycloakTokenPayload } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

const mapTokenToUser = (payload: KeycloakTokenPayload): UserDto => {
    const realmRoles: string[] =
        payload.roles ??
        payload.resource_access?.['uchaly-frontend']?.roles ??
        [];

    const firstName = payload.given_name ?? '';
    const lastName = payload.family_name ?? '';
    const patronymic = payload.patronymic ?? '';

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
        isActive: true,
        isDeleted: false,
        roles: realmRoles,
        createdAt: payload.iat
            ? new Date(payload.iat * 1000).toISOString()
            : new Date().toISOString(),
        fullName,
    };
};

export const authService = {
    login: async (): Promise<void> => {
        const redirectUri: string = getStaticRedirectUri(); // всегда строка
        console.debug('[authService.login] redirectUri =', redirectUri);
        await keycloak.login({ redirectUri });
    },

    register: async (): Promise<void> => {
        const redirectUri: string = getStaticRedirectUri();
        console.debug('[authService.register] redirectUri =', redirectUri);
        await keycloak.register({ redirectUri });
    },

    logout: (): void => {
        const redirectUri: string = `${window.location.origin}/login`;
        keycloak.logout({ redirectUri });
    },

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

    isAuthenticated: (): boolean => Boolean(keycloak.authenticated),

    getToken: (): string | undefined => keycloak.token,

    refreshToken: async (): Promise<string | undefined> => {
        await keycloak.updateToken(30);
        return keycloak.token;
    },

    changePassword: async (
        _userId: string,
        _request: ChangePasswordRequest
    ): Promise<void> => {
        await keycloak.accountManagement();
    },

    openAccountConsole: async (): Promise<void> => {
        await keycloak.accountManagement();
    },
};

export default authService;