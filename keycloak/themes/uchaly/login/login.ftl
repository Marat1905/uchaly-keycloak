<#--
    Страница входа.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout
    displayMessage=!messagesPerField.existsError('username','password')
    displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??
; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("loginAccountTitle")}</h1>

    <#elseif section = "form">
        <form id="kc-form-login" action="${url.loginAction}" method="post" class="uchaly-form">

            <#-- Username / Email -->
            <div class="uchaly-field">
                <label for="username" class="uchaly-label">
                    <#if !realm.loginWithEmailAllowed>
                        ${msg("username")}
                    <#elseif !realm.registrationEmailAsUsername>
                        ${msg("usernameOrEmail")}
                    <#else>
                        ${msg("email")}
                    </#if>
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    autofocus
                    class="uchaly-input"
                    value="${(login.username!'')}"
                    aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                />
                <#if messagesPerField.existsError('username','password')>
                    <span class="uchaly-field-error">
                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                    </span>
                </#if>
            </div>

            <#-- Password -->
            <div class="uchaly-field">
                <label for="password" class="uchaly-label">${msg("password")}</label>
                <div class="uchaly-password-wrap">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autocomplete="current-password"
                        class="uchaly-input uchaly-input--password"
                    />
                    <button
                        type="button"
                        class="uchaly-password-toggle"
                        onclick="uchalyTogglePassword('password', this)"
                        aria-label="Показать/скрыть пароль"
                        tabindex="-1"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" width="20" height="20">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="uchaly-row">
                <#if realm.rememberMe && !usernameEditDisabled??>
                    <label class="uchaly-checkbox">
                        <input
                            id="rememberMe"
                            name="rememberMe"
                            type="checkbox"
                            <#if login.rememberMe??>checked</#if>
                        />
                        <span>${msg("rememberMe")}</span>
                    </label>
                <#else>
                    <span></span>
                </#if>

                <#if realm.resetPasswordAllowed>
                    <a href="${url.loginResetCredentialsUrl}" class="uchaly-link">
                        ${msg("doForgotPassword")}
                    </a>
                </#if>
            </div>

            <input type="hidden" id="id" name="id" value="${(login.id!'')}"/>

            <button
                type="submit"
                name="login"
                id="kc-login"
                class="uchaly-btn uchaly-btn--primary"
            >
                ${msg("doLogIn")}
            </button>
        </form>

    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div class="uchaly-footer-actions">
                <span>${msg("noAccount")!'Нет аккаунта?'}</span>
                <a href="${url.registrationUrl}" class="uchaly-link uchaly-link--strong">
                    ${msg("doRegister")}
                </a>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>