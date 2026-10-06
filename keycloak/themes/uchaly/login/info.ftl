<#--
    Информационная страница (например, "письмо отправлено").
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">${kcSanitize(msg("infoTitle"))?no_esc}</h1>

    <#elseif section = "form">
        <div class="uchaly-alert uchaly-alert--info">
            ${kcSanitize(message.summary)?no_esc}
        </div>

        <#if requiredActions??>
            <p class="uchaly-text">${msg("infoRequiredActions")}</p>
            <ul class="uchaly-info-list">
                <#list requiredActions as reqActionItem>
                    <li>${msg("requiredAction.${reqActionItem}")}</li>
                </#list>
            </ul>
        </#if>

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