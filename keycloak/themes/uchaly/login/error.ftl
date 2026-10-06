<#--
    Страница ошибки (неверные данные, истёкшие токены, и т.п.).
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <div class="uchaly-error-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" width="48" height="48">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        </div>
        <h1 class="uchaly-title uchaly-title--center">${msg("errorTitle")}</h1>

    <#elseif section = "form">
        <div class="uchaly-alert uchaly-alert--error">
            ${kcSanitize(message.summary)?no_esc}
        </div>

        <#if skipLink??>
            <#-- оставляем пустым -->
        <#else>
            <#if pageRedirectUri?has_content>
                <a href="${pageRedirectUri}" class="uchaly-btn uchaly-btn--primary">
                    « ${msg("backToApplication")}
                </a>
            <#elseif actionUri?has_content>
                <a href="${actionUri}" class="uchaly-btn uchaly-btn--primary">
                    ${msg("proceedWithAction")}
                </a>
            <#elseif (client.baseUrl)?has_content>
                <a href="${client.baseUrl}" class="uchaly-btn uchaly-btn--primary">
                    « ${msg("backToApplication")}
                </a>
            </#if>
        </#if>
    </#if>
</@layout.registrationLayout>