// src/context/AuthContext.tsx
// =============================================================================
// Контекст аутентификации на базе Keycloak.
// Учитывает React 19 StrictMode: init и подписки выполняются один раз.
// =============================================================================

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
    type ReactNode,
} from 'react';
import keycloak, { initKeycloak, setupTokenRefresh } from '../keycloak';
import { authService } from '../services/authService';
import type { UserDto } from '../types/auth';

export type TestRole = 'User' | 'Safety' | 'TCX' | 'Admin';

interface AuthContextType {
    user: UserDto | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isAdminOrDiagnost: boolean;
    isAdminOrDiagnostOrService: boolean;
    isElectric: boolean;
    isAdminOrElectric: boolean;
    isTcx: boolean;
    isAdminOrTcx: boolean;
    isSafety: boolean;
    isAdminOrSafety: boolean;
    fullNameInitials: string;

    testRole: TestRole;
    setTestRole: (role: TestRole) => void;
    cycleTestRole: () => void;

    login: () => Promise<void>;
    register: () => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    openAccountConsole: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    // Флаг: bootstrap уже запускался в этом жизненном цикле компонента.
    // Защищает от двойного срабатывания useEffect в StrictMode.
    const bootstrappedRef = useRef(false);

    // -------------------------------------------------------------------------
    // Вычисляемые роли
    // -------------------------------------------------------------------------
    const isAdmin = useMemo(() => user?.roles.includes('Admin') ?? false, [user]);

    const isAdminOrDiagnost = useMemo(
        () => user?.roles.some((r) => r === 'Admin' || r === 'Diagnost') ?? false,
        [user],
    );

    const isAdminOrDiagnostOrService = useMemo(
        () =>
            user?.roles.some(
                (r) => r === 'Admin' || r === 'Diagnost' || r === 'Service',
            ) ?? false,
        [user],
    );

    const isElectric = useMemo(() => user?.roles.includes('Electric') ?? false, [user]);
    const isAdminOrElectric = useMemo(() => isAdmin || isElectric, [isAdmin, isElectric]);

    const isTcx = useMemo(() => user?.roles.includes('TCX') ?? false, [user]);
    const isAdminOrTcx = useMemo(() => isAdmin || isTcx, [isAdmin, isTcx]);

    const isSafety = useMemo(() => user?.roles.includes('Safety') ?? false, [user]);
    const isAdminOrSafety = useMemo(() => isAdmin || isSafety, [isAdmin, isSafety]);

    const fullNameInitials = useMemo(() => {
        if (!user) return '';
        const { lastName, firstName, patronymic } = user;
        let formatted = lastName;
        if (firstName) formatted += ` ${firstName.charAt(0)}.`;
        if (patronymic) formatted += `${patronymic.charAt(0)}.`;
        return formatted;
    }, [user]);

    // -------------------------------------------------------------------------
    // Заглушки тестовых ролей
    // -------------------------------------------------------------------------
    const testRole = useMemo<TestRole>(() => {
        if (isAdmin) return 'Admin';
        if (isSafety) return 'Safety';
        if (isTcx) return 'TCX';
        return 'User';
    }, [isAdmin, isSafety, isTcx]);

    const setTestRole = useCallback((_role: TestRole) => {
        if (import.meta.env.DEV) {
            console.warn('[AuthContext] setTestRole — no-op (Keycloak).');
        }
    }, []);

    const cycleTestRole = useCallback(() => {
        if (import.meta.env.DEV) {
            console.warn('[AuthContext] cycleTestRole — no-op (Keycloak).');
        }
    }, []);

    // -------------------------------------------------------------------------
    // Инициализация Keycloak
    // -------------------------------------------------------------------------
    useEffect(() => {
        // Защита от StrictMode: не запускаем bootstrap дважды
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        let cleanupRefresh: (() => void) | undefined;

        const bootstrap = async () => {
            setLoading(true);

            // initKeycloak идемпотентна — можно вызывать сколько угодно раз
            const isAuth = await initKeycloak();
            setAuthenticated(isAuth);

            if (isAuth) {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
                cleanupRefresh = setupTokenRefresh();
            }

            setLoading(false);
        };

        bootstrap();

        // Обработчики событий Keycloak. Функции перезаписываются,
        // поэтому дублирования не будет.
        keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).catch(() => {
                console.warn('[AuthContext] Token expired, logging out');
                keycloak.logout().catch(() => keycloak.clearToken());
            });
        };

        keycloak.onAuthLogout = () => {
            setUser(null);
            setAuthenticated(false);
        };

        keycloak.onAuthSuccess = () => {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            setAuthenticated(true);
        };

        return () => {
            if (cleanupRefresh) cleanupRefresh();
        };
    }, []);

    // -------------------------------------------------------------------------
    // Публичные методы
    // -------------------------------------------------------------------------
    const login = useCallback(async () => {
        await authService.login();
    }, []);

    const register = useCallback(async () => {
        await authService.register();
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setAuthenticated(false);
    }, []);

    const refreshUser = useCallback(async () => {
        await keycloak.updateToken(30);
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const openAccountConsole = useCallback(async () => {
        await authService.openAccountConsole();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: authenticated && !!user,
        isAdmin,
        isAdminOrDiagnost,
        isAdminOrDiagnostOrService,
        isElectric,
        isAdminOrElectric,
        isTcx,
        isAdminOrTcx,
        isSafety,
        isAdminOrSafety,
        fullNameInitials,

        testRole,
        setTestRole,
        cycleTestRole,

        login,
        register,
        logout,
        refreshUser,
        openAccountConsole,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};