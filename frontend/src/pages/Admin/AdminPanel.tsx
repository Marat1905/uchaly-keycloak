// AdminPanel.tsx
// =============================================================================
// Панель администратора. Управление пользователями и ролями через Keycloak.
// =============================================================================

import React, { useState, useEffect } from 'react';
import type { AdminStats } from '../../types/auth';
// ВАЖНО: getAdminStats переехал из authService в adminService (Keycloak Admin API)
import adminService from '../../services/adminService';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import UserManagement from '../../components/Admin/UserManagement';
import RoleManagement from '../../components/Admin/RoleManagement';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Было: authService.getAdminStats()
            // Стало: adminService.getStats()
            const statsData = await adminService.getStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = () => {
        loadStats();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <PageMeta
                    title="Админ панель - Uchaly"
                    description="Панель управления пользователями и ролями системы"
                />

                <PageBreadcrumb pageTitle="Админ панель" />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Всего пользователей"
                        value={stats?.totalUsers || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        }
                        color="blue"
                    />
                    <StatCard
                        title="Активных пользователей"
                        value={stats?.activeUsers || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="green"
                    />
                    <StatCard
                        title="Новых за неделю"
                        value={stats?.newUsersThisWeek || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="purple"
                    />
                    <StatCard
                        title="Ролей в системе"
                        value={stats?.totalRoles || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        color="orange"
                    />
                </div>

                {/* Main Content */}
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-8 backdrop-blur-sm">
                    {/* Tabs */}
                    <div className="mb-8">
                        <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'users'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <span>Управление пользователями</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('roles')}
                                className={`flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'roles'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Управление ролями</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'roles' && <RoleManagement />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// StatCard Component
const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ title, value, icon, color }) => {
    const gradientClasses = {
        blue: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800',
        green: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800',
        purple: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-100 dark:border-purple-800',
        orange: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800'
    };

    const iconClasses = {
        blue: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        green: 'bg-gradient-to-br from-green-500 to-emerald-600',
        purple: 'bg-gradient-to-br from-purple-500 to-violet-600',
        orange: 'bg-gradient-to-br from-orange-500 to-amber-600'
    };

    return (
        <div className={`bg-gradient-to-br ${gradientClasses[color]} rounded-3xl shadow-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className={`p-4 rounded-2xl ${iconClasses[color]} shadow-lg`}>
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;