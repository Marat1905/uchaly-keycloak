<#--
    Страница конфигурации резервных кодов.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("recovery-code-config-header")}</h1>
        <p class="uchaly-subtitle">${msg("recovery-code-config-warning-title")}</p>

    <#elseif section = "form">
        <div class="uchaly-alert uchaly-alert--warning">
            ${msg("recovery-code-config-warning-message")}
        </div>

        <form action="${url.loginAction}" method="post" class="uchaly-form">
            <div class="uchaly-recovery-codes">
                <#list recoveryAuthnCodesConfigBean.generatedRecoveryAuthnCodesList as code>
                    <div class="uchaly-recovery-code">${code}</div>
                </#list>
            </div>

            <input type="hidden" id="generatedRecoveryAuthnCodes"
                   name="generatedRecoveryAuthnCodes"
                   value="${recoveryAuthnCodesConfigBean.generatedRecoveryAuthnCodesAsString}">
            <input type="hidden" id="generatedAt"
                   name="generatedAt"
                   value="${recoveryAuthnCodesConfigBean.generatedAt}">
            <input type="hidden" id="userLabel" name="userLabel"
                   value="${recoveryAuthnCodesConfigBean.userLabel}"/>

            <div class="uchaly-row">
                <label class="uchaly-checkbox">
                    <input type="checkbox" id="kcRecoveryCodesConfirmationCheck"
                           name="kcRecoveryCodesConfirmationCheck"
                           onchange="document.getElementById('saveRecoveryAuthnCodesBtn').disabled = !this.checked;">
                    <span>${msg("recovery-codes-confirmation-message")}</span>
                </label>
            </div>

            <button type="submit" id="saveRecoveryAuthnCodesBtn"
                    class="uchaly-btn uchaly-btn--primary" disabled>
                ${msg("doSave")}
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