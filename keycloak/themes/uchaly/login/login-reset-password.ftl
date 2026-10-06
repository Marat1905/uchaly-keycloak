<#--
    Шаг 1 сброса пароля: ввод username/email.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=true; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("emailForgotTitle")}</h1>
        <p class="uchaly-subtitle">${msg("emailInstruction")}</p>

    <#elseif section = "form">
        <form id="kc-reset-password-form" action="${url.loginAction}" method="post" class="uchaly-form">
            <div class="uchaly-field">
                <label for="username" class="uchaly-label">
                    <#if !realm.loginWithEmailAllowed>${msg("username")}
                    <#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}
                    <#else>${msg("email")}</#if>
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    class="uchaly-input"
                    value="${(auth.attemptedUsername!'')}"
                    autofocus
                    autocomplete="username"
                />
            </div>

            <button type="submit" class="uchaly-btn uchaly-btn--primary">
                ${msg("doSubmit")}
            </button>
        </form>

    <#elseif section = "info">
        <div class="uchaly-footer-actions">
            <a href="${url.loginUrl}" class="uchaly-link">
                « ${msg("backToLogin")}
            </a>
        </div>
    </#if>
</@layout.registrationLayout>