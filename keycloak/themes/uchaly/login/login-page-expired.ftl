<#--
    Страница "сессия истекла".
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("pageExpiredTitle")}</h1>

    <#elseif section = "form">
        <p class="uchaly-text">${msg("pageExpiredMsg1")}</p>
        <p class="uchaly-text">
            <a href="${url.loginRestartFlowUrl}" class="uchaly-link">
                ${msg("doClickHere")} ${msg("pageExpiredMsg2")?replace(" {0}", "")?lower_case?cap_first}
            </a>
        </p>

        <a href="${url.loginUrl}" class="uchaly-btn uchaly-btn--primary">
            ${msg("backToLogin")}
        </a>
    </#if>
</@layout.registrationLayout>