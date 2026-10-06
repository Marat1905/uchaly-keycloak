<#--
    keycloak/themes/uchaly/login/template.ftl
    ============================================================================
    Базовый шаблон темы Uchaly.

    ИЗМЕНЕНИЯ:
      - Кнопка-переключатель темы убрана. Тема синхронизируется из cookie
        'uchaly_theme', которую пишет React-приложение (см. ThemeContext.tsx).
      - Класс 'dark' ставится на <html> ДО первого рендера страницы,
        чтобы избежать «мигания» светлой темы.
      - Если cookie отсутствует — работает системная тема через
        @media (prefers-color-scheme: dark) в CSS.
    ============================================================================
-->
<#macro registrationLayout displayMessage=true displayInfo=false displayRequiredFields=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html lang="${.lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("loginTitle", (realm.displayName!'Uchaly'))}</title>
    <link rel="stylesheet" href="${url.resourcesPath}/css/uchaly.css">

    <#--
        Скрипт синхронизации темы. Должен выполниться до отрисовки <body>,
        иначе пользователь на мгновение увидит светлую тему и потом — резкое
        переключение на тёмную (FOUC — Flash of Unstyled Content).

        Логика:
          1. Читаем cookie 'uchaly_theme' (её пишет React-приложение).
          2. Если 'dark' — ставим класс .dark на <html>.
             Если 'light' — ничего не делаем (светлая — дефолт).
             Если cookie нет — оставляем как есть, CSS применит системную
             тему через @media (prefers-color-scheme: dark).
    -->
    <script>
        (function () {
            try {
                var match = document.cookie.match(
                    new RegExp('(?:^|;\\s*)uchaly_theme=([^;]*)')
                );
                var theme = match ? decodeURIComponent(match[1]) : null;
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                }
                // theme === null → оставляем дефолт; CSS решит по системной теме.
            } catch (e) {
                // Не критично — просто останемся на дефолтной (светлой) теме.
            }
        })();
    </script>
</head>
<body>
    <div class="uchaly-page">
        <div class="uchaly-container">

            <#-- Логотип-ссылка на форму логина -->
            <a href="${url.loginUrl}" class="uchaly-brand" aria-label="${realm.displayName!'Uchaly'}">
                <img src="${url.resourcesPath}/img/logo.svg"
                     alt="${realm.displayName!'Uchaly'}"
                     class="uchaly-brand__logo uchaly-brand__logo--light">
                <img src="${url.resourcesPath}/img/logo-dark.svg"
                     alt="${realm.displayName!'Uchaly'}"
                     class="uchaly-brand__logo uchaly-brand__logo--dark">
            </a>

            <div class="uchaly-card">

                <#-- Секция "header": заголовок страницы -->
                <#if displayRequiredFields>
                    <div class="uchaly-header-row">
                        <#nested "header">
                        <div class="uchaly-required-note">
                            <span class="uchaly-required-asterisk">*</span>
                            <span>${msg("requiredFields")}</span>
                        </div>
                    </div>
                <#else>
                    <#nested "header">
                </#if>

                <#-- Сообщение (ошибка/успех/предупреждение) -->
                <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="uchaly-alert uchaly-alert--${message.type}">
                        ${kcSanitize(message.summary)?no_esc}
                    </div>
                </#if>

                <#-- Секция "form": основная форма -->
                <#nested "form">

                <#-- Секция "info": ссылки "Нет аккаунта? Зарегистрироваться" -->
                <#if displayInfo>
                    <#nested "info">
                </#if>

                <#-- Секция "socialProviders": кнопки соц. входа -->
                <#if social?? && social.providers?? && social.providers?has_content>
                    <#nested "socialProviders">
                </#if>

            </div>

            <div class="uchaly-copyright">
                <p>© 2025 Uchaly. Все права защищены.</p>
            </div>

        </div>
    </div>

    <script>
        // Переключатель видимости пароля. Работает для любого input с id.
        function uchalyTogglePassword(fieldId, button) {
            var input = document.getElementById(fieldId);
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                button.classList.add('is-visible');
            } else {
                input.type = 'password';
                button.classList.remove('is-visible');
            }
        }
    </script>
</body>
</html>
</#macro>