// src/pages/Auth/Login.tsx
// =============================================================================
// Страница входа.
// После перехода на Keycloak реальная форма входа находится на стороне
// Keycloak. Эта страница просто редиректит пользователя в Keycloak,
// если он ещё не аутентифицирован.
//
// ВАЖНО: login теперь стабильна (useCallback в AuthContext), а в
// зависимостях useEffect мы читаем только location.state (через ref),
// чтобы эффект не перезапускался при смене location.pathname.
// =============================================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';

const Login: React.FC = () => {
    const { isAuthenticated, login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Запоминаем "откуда пришли" один раз при монтировании — это защищает
    // от повторного запуска эффекта при смене location между рендерами.
    const fromRef = useRef<string>(
        (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/',
    );

    useEffect(() => {
        // Пока идёт инициализация Keycloak — ничего не делаем.
        if (loading) return;

        // Если уже аутентифицирован — уходим на главную (или на исходную страницу)
        if (isAuthenticated) {
            navigate(fromRef.current, { replace: true });
            return;
        }

        // Иначе запускаем Authorization Code Flow + PKCE
        login().catch((err) => {
            console.error('[Login] Ошибка запуска Keycloak login:', err);
        });
    }, [isAuthenticated, loading, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <PageMeta
                title="Вход в систему - Uchaly"
                description="Перенаправление на страницу входа Keycloak"
            />

            <div className="max-w-md w-full space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-25 animate-pulse"></div>
                            <img
                                className="h-14 w-auto dark:hidden relative"
                                src="/images/logo/logo.svg"
                                alt="Uchaly"
                            />
                            <img
                                className="h-14 w-auto hidden dark:block relative"
                                src="/images/logo/logo-dark.svg"
                                alt="Uchaly"
                            />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Перенаправление на страницу входа…
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Сейчас вы будете перенаправлены на защищённую страницу входа Keycloak.
                    </p>

                    <div className="flex justify-center">
                        <svg
                            className="animate-spin h-10 w-10 text-brand-600"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>

                    <button
                        onClick={() => login()}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                        Войти через Keycloak
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © 2025 Uchaly. Все права защищены.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;