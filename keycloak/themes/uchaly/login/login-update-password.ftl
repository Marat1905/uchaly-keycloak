<#--
    Шаг 2 сброса пароля: ввод нового пароля.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <h1 class="uchaly-title">
            <#if requiredActions?? && requiredActions?seq_contains("UPDATE_PASSWORD")>
                ${msg("updatePasswordTitle")}
            <#else>
                ${msg("updatePasswordTitle")}
            </#if>
        </h1>

    <#elseif section = "form">
        <form id="kc-passwd-update-form" action="${url.loginAction}" method="post" class="uchaly-form">
            <div class="uchaly-field">
                <label for="password-new" class="uchaly-label">
                    ${msg("passwordNew")} <span class="uchaly-required-asterisk">*</span>
                </label>
                <div class="uchaly-password-wrap">
                    <input
                        id="password-new"
                        name="password-new"
                        type="password"
                        class="uchaly-input uchaly-input--password"
                        autocomplete="new-password"
                        autofocus
                    />
                    <button type="button" class="uchaly-password-toggle"
                            onclick="uchalyTogglePassword('password-new', this)"
                            tabindex="-1" aria-label="Показать/скрыть пароль">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" width="20" height="20">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="uchaly-field">
                <label for="password-confirm" class="uchaly-label">
                    ${msg("passwordConfirm")} <span class="uchaly-required-asterisk">*</span>
                </label>
                <div class="uchaly-password-wrap">
                    <input
                        id="password-confirm"
                        name="password-confirm"
                        type="password"
                        class="uchaly-input uchaly-input--password"
                        autocomplete="new-password"
                    />
                    <button type="button" class="uchaly-password-toggle"
                            onclick="uchalyTogglePassword('password-confirm', this)"
                            tabindex="-1" aria-label="Показать/скрыть пароль">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" width="20" height="20">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password','password-confirm')>
                    <span class="uchaly-field-error">
                        ${kcSanitize(messagesPerField.getFirstError('password','password-confirm'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="uchaly-row">
                <#if isAppInitiatedAction??>
                    <label class="uchaly-checkbox">
                        <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked>
                        <span>${msg("logoutOtherSessions")}</span>
                    </label>
                </#if>
            </div>

            <button type="submit" class="uchaly-btn uchaly-btn--primary">
                ${msg("doSubmit")}
            </button>

            <#if isAppInitiatedAction??>
                <button type="submit" name="cancel-aia" value="true"
                        class="uchaly-btn uchaly-btn--secondary">
                    ${msg("doCancel")}
                </button>
            </#if>
        </form>
    </#if>
</@layout.registrationLayout>