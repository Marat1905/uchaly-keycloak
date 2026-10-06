// src/services/adminService.ts
// =============================================================================
// Сервис для работы с Keycloak Admin REST API.
// Требует, чтобы у текущего пользователя была роль Admin (в нашем realm она
// включает composite-роли realm-management: manage-users, view-users,
// view-realm, manage-realm и т.д.).
// =============================================================================

import axios from 'axios';
import keycloak from '../keycloak';
import type {
    UserDto,
    RoleDto,
    PagedResultDto,
    AdminStats,
    UserManagementFilters,
    CreateUserRequest,
    UpdateUserRequest,
    CreateRoleRequest,
    UpdateRoleRequest,
} from '../types/auth';

// -----------------------------------------------------------------------------
// Базовый URL Keycloak Admin REST API.
// В dev-режиме Vite проксирует /admin на Keycloak, поэтому используем
// относительный путь. В проде nginx делает то же самое.
// -----------------------------------------------------------------------------
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'uchaly';
const ADMIN_BASE = `/admin/realms/${KEYCLOAK_REALM}`;

// -----------------------------------------------------------------------------
// Axios-клиент для Admin API.
// Не используем общий apiClient, чтобы не зациклить интерцепторы.
// -----------------------------------------------------------------------------
const adminClient = axios.create({
    baseURL: ADMIN_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Автоматически подставляем access-токен Keycloak и обновляем его при необходимости
adminClient.interceptors.request.use(async (config) => {
    if (keycloak.authenticated) {
        try {
            await keycloak.updateToken(30);
        } catch (error) {
            console.warn('[adminService] Не удалось обновить токен:', error);
        }

        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
    }
    return config;
});

// -----------------------------------------------------------------------------
// Вспомогательные типы — то, что реально возвращает Keycloak.
// -----------------------------------------------------------------------------

interface KeycloakUserRepresentation {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
    emailVerified: boolean;
    createdTimestamp?: number;
    attributes?: Record<string, string[]>;
    realmRoles?: string[];
}

interface KeycloakRoleRepresentation {
    id: string;
    name: string;
    description?: string;
    composite?: boolean;
    clientRole?: boolean;
    containerId?: string;
}

interface KeycloakRoleMappingRepresentation {
    id: string;
    name: string;
    description?: string;
    composite?: boolean;
    clientRole?: boolean;
    containerId?: string;
}

// -----------------------------------------------------------------------------
// Проекции Keycloak → наши DTO.
// -----------------------------------------------------------------------------

const mapUser = (u: KeycloakUserRepresentation): UserDto => {
    const firstName = u.firstName ?? '';
    const lastName = u.lastName ?? '';
    const patronymic = u.attributes?.patronymic?.[0] ?? '';

    const fullName =
        [lastName, firstName, patronymic].filter(Boolean).join(' ').trim() ||
        u.username;

    return {
        id: u.id,
        email: u.email ?? u.username,
        firstName,
        lastName,
        patronymic: patronymic || undefined,
        avatarUrl: undefined,
        isActive: u.enabled,
        isDeleted: false, // в Keycloak нет мягкого удаления
        roles: u.realmRoles ?? [],
        createdAt: u.createdTimestamp
            ? new Date(u.createdTimestamp).toISOString()
            : new Date().toISOString(),
        fullName,
    };
};

const mapRole = (r: KeycloakRoleRepresentation, userCount = 0): RoleDto => ({
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    userCount,
    createdAt: new Date().toISOString(),
});

// -----------------------------------------------------------------------------
// Публичный API сервиса.
// -----------------------------------------------------------------------------

export const adminService = {
    // =========================================================================
    // Пользователи
    // =========================================================================

    /**
     * Возвращает постраничный список пользователей с фильтрами.
     * Keycloak Admin API поддерживает first/max/search.
     * Фильтр по роли и isActive/isDeleted применяем на клиенте.
     */
    async getUsers(filters: UserManagementFilters): Promise<PagedResultDto<UserDto>> {
        const first = (filters.page - 1) * filters.pageSize;
        const params: Record<string, string | number | boolean> = {
            first,
            max: filters.pageSize,
        };

        if (filters.search) {
            params.search = filters.search;
        }

        if (filters.isActive !== null) {
            params.enabled = filters.isActive;
        }

        // Получаем общее количество (используем count endpoint)
        const countResponse = await adminClient.get<number>('/users/count', { params });
        const totalCount = countResponse.data;

        // Получаем самих пользователей
        const response = await adminClient.get<KeycloakUserRepresentation[]>('/users', {
            params,
        });

        // Подтягиваем роли для каждого пользователя (иначе realmRoles не придут)
        const users = await Promise.all(
            response.data.map(async (u) => {
                const roles = await adminService.getUserRealmRoles(u.id);
                return mapUser({ ...u, realmRoles: roles.map((r) => r.name) });
            }),
        );

        // Клиентская фильтрация по роли (если задана)
        let filteredUsers = users;
        if (filters.role) {
            filteredUsers = filteredUsers.filter((u) => u.roles.includes(filters.role!));
        }

        // Клиентская фильтрация по isDeleted (в Keycloak её нет — всегда пусто,
        // оставлено для совместимости интерфейса).
        if (filters.isDeleted === true) {
            filteredUsers = [];
        }

        const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

        return {
            items: filteredUsers,
            totalCount: filteredUsers.length, // после клиентской фильтрации
            pageNumber: filters.page,
            pageSize: filters.pageSize,
            totalPages,
        };
    },

    /**
     * Получить пользователя по id.
     */
    async getUserById(id: string): Promise<UserDto> {
        const response = await adminClient.get<KeycloakUserRepresentation>(`/users/${id}`);
        const roles = await adminService.getUserRealmRoles(id);
        return mapUser({ ...response.data, realmRoles: roles.map((r) => r.name) });
    },

    /**
     * Создать пользователя.
     * roleIds — это НЕ id ролей, а их имена (в нашем UI используются имена).
     */
    async createUser(data: CreateUserRequest): Promise<UserDto> {
        // 1. Создаём пользователя
        const payload: Record<string, unknown> = {
            username: data.email,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            enabled: true,
            emailVerified: true,
            attributes: data.patronymic ? { patronymic: [data.patronymic] } : undefined,
            credentials: [
                {
                    type: 'password',
                    value: data.password,
                    temporary: false,
                },
            ],
        };

        const createResponse = await adminClient.post('/users', payload);

        // Keycloak возвращает 201 + Location: .../users/{id}
        const location = createResponse.headers['location'] as string | undefined;
        const userId = location?.split('/').pop() ?? '';

        // 2. Назначаем роли (по имени, не по id)
        if (data.roleIds.length > 0) {
            await adminService.assignRolesByName(userId, data.roleIds);
        }

        // 3. Возвращаем созданного пользователя
        return adminService.getUserById(userId);
    },

    /**
     * Обновить пользователя.
     */
    async updateUser(id: string, data: UpdateUserRequest): Promise<UserDto> {
        // 1. Базовые поля
        const current = await adminClient.get<KeycloakUserRepresentation>(`/users/${id}`);

        const payload: Record<string, unknown> = {
            ...current.data,
            firstName: data.firstName ?? current.data.firstName,
            lastName: data.lastName ?? current.data.lastName,
            enabled: data.isActive ?? current.data.enabled,
        };

        if (data.patronymic !== undefined) {
            payload.attributes = {
                ...(current.data.attributes ?? {}),
                patronymic: [data.patronymic],
            };
        }

        await adminClient.put(`/users/${id}`, payload);

        // 2. Роли (если переданы)
        if (data.roleIds) {
            await adminService.setUserRolesByName(id, data.roleIds);
        }

        return adminService.getUserById(id);
    },

    /**
     * Удалить пользователя (жёстко — в Keycloak нет мягкого удаления).
     */
    async deleteUser(id: string): Promise<void> {
        await adminClient.delete(`/users/${id}`);
    },

    /**
     * Включить/выключить пользователя.
     */
    async setUserEnabled(id: string, enabled: boolean): Promise<void> {
        const current = await adminClient.get<KeycloakUserRepresentation>(`/users/${id}`);
        await adminClient.put(`/users/${id}`, { ...current.data, enabled });
    },

    /**
     * Сбросить пароль (сгенерировать новый случайный).
     * Возвращает новый пароль (не сохранён в открытом виде нигде).
     */
    async resetUserPassword(id: string): Promise<string> {
        const newPassword = generateRandomPassword(12);
        await adminClient.put(`/users/${id}/reset-password`, {
            type: 'password',
            value: newPassword,
            temporary: false,
        });
        return newPassword;
    },

    // =========================================================================
    // Роли
    // =========================================================================

    /**
     * Получить все realm-роли.
     */
    async getRoles(): Promise<RoleDto[]> {
        const response = await adminClient.get<KeycloakRoleRepresentation[]>('/roles');
        // Исключаем дефолтные роли Keycloak (offline_access, uma_authorization)
        const filtered = response.data.filter(
            (r) => !['offline_access', 'uma_authorization', 'default-roles-uchaly'].includes(r.name),
        );

        // Для каждой роли считаем количество пользователей
        const rolesWithCount = await Promise.all(
            filtered.map(async (r) => {
                const users = await adminClient.get<KeycloakUserRepresentation[]>(
                    `/roles/${r.name}/users`,
                    { params: { max: 1 } },
                );
                // Keycloak не возвращает общее количество — используем max=0 и подсчёт
                // (в текущей версии Admin API нет count для ролей, поэтому грубо).
                const totalCountResp = await adminClient.get<KeycloakUserRepresentation[]>(
                    `/roles/${r.name}/users`,
                    { params: { max: 1000 } },
                );
                return mapRole(r, totalCountResp.data.length || users.data.length);
            }),
        );

        return rolesWithCount;
    },

    /**
     * Получить realm-роли пользователя.
     */
    async getUserRealmRoles(userId: string): Promise<KeycloakRoleMappingRepresentation[]> {
        const response = await adminClient.get<KeycloakRoleMappingRepresentation[]>(
            `/users/${userId}/role-mappings/realm`,
        );
        return response.data;
    },

    /**
     * Установить роли пользователя по именам (полная замена).
     */
    async setUserRolesByName(userId: string, roleNames: string[]): Promise<void> {
        const currentRoles = await adminService.getUserRealmRoles(userId);
        const currentNames = currentRoles.map((r) => r.name);

        // Удаляем роли, которых больше нет
        const toRemove = currentRoles.filter((r) => !roleNames.includes(r.name));
        if (toRemove.length > 0) {
            await adminClient.delete(`/users/${userId}/role-mappings/realm`, {
                data: toRemove.map((r) => ({ id: r.id, name: r.name })),
            });
        }

        // Добавляем новые роли
        const toAddNames = roleNames.filter((n) => !currentNames.includes(n));
        if (toAddNames.length > 0) {
            await adminService.assignRolesByName(userId, toAddNames);
        }
    },

    /**
     * Назначить роли пользователю по именам.
     */
    async assignRolesByName(userId: string, roleNames: string[]): Promise<void> {
        // Для каждой роли получаем её представление
        const roles = await Promise.all(
            roleNames.map((name) =>
                adminClient
                    .get<KeycloakRoleRepresentation>(`/roles/${name}`)
                    .then((r) => r.data)
                    .catch(() => null),
            ),
        );

        const validRoles = roles.filter((r): r is KeycloakRoleRepresentation => r !== null);
        if (validRoles.length === 0) return;

        await adminClient.post(`/users/${userId}/role-mappings/realm`, validRoles);
    },

    /**
     * Создать роль.
     */
    async createRole(data: CreateRoleRequest): Promise<RoleDto> {
        await adminClient.post('/roles', {
            name: data.name,
            description: data.description,
        });
        const created = await adminClient.get<KeycloakRoleRepresentation>(`/roles/${data.name}`);
        return mapRole(created.data, 0);
    },

    /**
     * Обновить роль (описание; имя роли в Keycloak менять нельзя).
     */
    async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleDto> {
        const current = await adminClient.get<KeycloakRoleRepresentation>(`/roles/${id}`);
        await adminClient.put(`/roles/${id}`, {
            ...current.data,
            description: data.description ?? current.data.description,
            // name не меняется: Keycloak не поддерживает переименование роли
        });
        const updated = await adminClient.get<KeycloakRoleRepresentation>(`/roles/${id}`);
        return mapRole(updated.data, 0);
    },

    /**
     * Удалить роль.
     */
    async deleteRole(id: string): Promise<void> {
        await adminClient.delete(`/roles/${id}`);
    },

    // =========================================================================
    // Статистика
    // =========================================================================

    /**
     * Собрать статистику для админ-панели.
     */
    async getStats(): Promise<AdminStats> {
        // Общее количество пользователей
        const totalResp = await adminClient.get<number>('/users/count');
        const totalUsers = totalResp.data;

        // Активные
        const activeResp = await adminClient.get<number>('/users/count', {
            params: { enabled: true },
        });
        const activeUsers = activeResp.data;

        // Новые за неделю: получаем всех и фильтруем по createdTimestamp
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const allUsersResp = await adminClient.get<KeycloakUserRepresentation[]>('/users', {
            params: { max: 10000 },
        });
        const newUsersThisWeek = allUsersResp.data.filter(
            (u) => (u.createdTimestamp ?? 0) >= oneWeekAgo,
        ).length;

        // Роли (исключаем дефолтные)
        const rolesResp = await adminClient.get<KeycloakRoleRepresentation[]>('/roles');
        const totalRoles = rolesResp.data.filter(
            (r) => !['offline_access', 'uma_authorization', 'default-roles-uchaly'].includes(r.name),
        ).length;

        return {
            totalUsers,
            activeUsers,
            newUsersThisWeek,
            totalRoles,
        };
    },
};

// -----------------------------------------------------------------------------
// Утилиты
// -----------------------------------------------------------------------------

/**
 * Генерация случайного пароля.
 * Соответствует требованиям из UpdateUserRequestValidator / CreateUserRequestValidator:
 * минимум 8 символов, заглавная, строчная, цифра, спецсимвол.
 */
function generateRandomPassword(length = 12): string {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{};:\'",.<>/?\\|';
    const all = lower + upper + digits + special;

    // Гарантируем наличие каждого класса
    const required = [
        lower[Math.floor(Math.random() * lower.length)],
        upper[Math.floor(Math.random() * upper.length)],
        digits[Math.floor(Math.random() * digits.length)],
        special[Math.floor(Math.random() * special.length)],
    ];

    const remaining = Array.from({ length: length - required.length }, () =>
        all[Math.floor(Math.random() * all.length)],
    );

    // Перемешиваем
    return [...required, ...remaining].sort(() => Math.random() - 0.5).join('');
}

export default adminService;