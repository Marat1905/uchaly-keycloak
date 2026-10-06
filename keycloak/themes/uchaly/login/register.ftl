<#--
    Страница регистрации.
    Поля соответствуют user profile из uchaly-realm.json.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout
    displayMessage=true
    displayRequiredFields=true
; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("registerTitle")}</h1>

    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post" class="uchaly-form">

            <#if !realm.registrationEmailAsUsername>
                <div class="uchaly-field">
                    <label for="username" class="uchaly-label">
                        ${msg("username")} <span class="uchaly-required-asterisk">*</span>
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        class="uchaly-input"
                        value="${(register.formData.username!'')}"
                        autocomplete="username"
                        aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                    />
                    <#if messagesPerField.existsError('username')>
                        <span class="uchaly-field-error">
                            ${kcSanitize(messagesPerField.get('username'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <div class="uchaly-field">
                <label for="email" class="uchaly-label">
                    ${msg("email")} <span class="uchaly-required-asterisk">*</span>
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    class="uchaly-input"
                    value="${(register.formData.email!'')}"
                    autocomplete="email"
                    aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                />
                <#if messagesPerField.existsError('email')>
                    <span class="uchaly-field-error">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="uchaly-field">
                <label for="firstName" class="uchaly-label">
                    ${msg("firstName")} <span class="uchaly-required-asterisk">*</span>
                </label>
                <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    class="uchaly-input"
                    value="${(register.formData.firstName!'')}"
                    autocomplete="given-name"
                    aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                />
                <#if messagesPerField.existsError('firstName')>
                    <span class="uchaly-field-error">
                        ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="uchaly-field">
                <label for="lastName" class="uchaly-label">
                    ${msg("lastName")} <span class="uchaly-required-asterisk">*</span>
                </label>
                <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    class="uchaly-input"
                    value="${(register.formData.lastName!'')}"
                    autocomplete="family-name"
                    aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                />
                <#if messagesPerField.existsError('lastName')>
                    <span class="uchaly-field-error">
                        ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="uchaly-field">
                <label for="user.attributes.patronymic" class="uchaly-label">
                    ${msg("patronymic")!'Отчество'}
                </label>
                <input
                    id="user.attributes.patronymic"
                    name="user.attributes.patronymic"
                    type="text"
                    class="uchaly-input"
                    value="${(register.formData['user.attributes.patronymic']!'')}"
                    autocomplete="additional-name"
                />
            </div>

            <#if passwordRequired??>
                <div class="uchaly-field">
                    <label for="password" class="uchaly-label">
                        ${msg("password")} <span class="uchaly-required-asterisk">*</span>
                    </label>
                    <div class="uchaly-password-wrap">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            class="uchaly-input uchaly-input--password"
                            autocomplete="new-password"
                            aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                        />
                        <button type="button" class="uchaly-password-toggle"
                                onclick="uchalyTogglePassword('password', this)"
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
            </#if>

            <#if recaptchaRequired?? && recaptchaRequired>
                <div class="uchaly-field">
                    <div class="g-recaptcha" data-size="compact"
                         data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <button type="submit" class="uchaly-btn uchaly-btn--primary">
                ${msg("doRegister")}
            </button>
        </form>

    <#elseif section = "info">
        <#if realm.password>
            <div class="uchaly-footer-actions">
                <a href="${url.loginUrl}" class="uchaly-link">
                    « ${msg("backToLogin")}
                </a>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>