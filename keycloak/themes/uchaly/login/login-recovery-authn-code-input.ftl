<#--
    Ввод одного из резервных кодов (recovery code).
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("auth-recovery-code-header")}</h1>

    <#elseif section = "form">
        <form id="kc-recovery-code-login-form" action="${url.loginAction}" method="post" class="uchaly-form">
            <p class="uchaly-text">${msg("auth-recovery-code-prompt", "")}</p>

            <div class="uchaly-field">
                <label for="recoveryCodeInput" class="uchaly-label">
                    ${msg("auth-recovery-code-label")}
                </label>
                <input
                    id="recoveryCodeInput"
                    name="recoveryCodeInput"
                    type="text"
                    class="uchaly-input uchaly-code-input"
                    autocomplete="off"
                    autofocus
                />
            </div>

            <button type="submit" class="uchaly-btn uchaly-btn--primary">
                ${msg("doLogIn")}
            </button>
        </form>
    </#if>
</@layout.registrationLayout>