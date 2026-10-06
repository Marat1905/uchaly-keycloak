// src/pages/Auth/Register.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';

const Register: React.FC = () => {
    const { isAuthenticated, register, loading } = useAuth();
    const navigate = useNavigate();

    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (loading) return;

        if (isAuthenticated) {
            navigate('/', { replace: true });
            return;
        }

        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        register().catch((err) => {
            console.error('[Register] Ошибка запуска Keycloak register:', err);
            hasStartedRef.current = false;
        });
    }, [isAuthenticated, loading, register, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <PageMeta
                title="Регистрация - Uchaly"
                description="Перенаправление на страницу регистрации Keycloak"
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
                        Перенаправление на страницу регистрации…
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Сейчас вы будете перенаправлены на защищённую страницу регистрации Keycloak.
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
                        onClick={() => {
                            hasStartedRef.current = false;
                            register().catch((err) => console.error('[Register] Ошибка:', err));
                        }}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                        Зарегистрироваться через Keycloak
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

export default Register;