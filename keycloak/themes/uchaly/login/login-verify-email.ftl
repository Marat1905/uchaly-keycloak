<#--
    Страница "проверьте почту" после регистрации или смены email.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("emailVerifyTitle")}</h1>

    <#elseif section = "form">
        <p class="uchaly-text">
            ${msg("emailVerifyInstruction1", user.email!'')}
        </p>

        <#if user.email??>
            <p class="uchaly-text uchaly-text--muted">
                ${msg("emailVerifyInstruction2")}
                <a href="${url.loginAction}" class="uchaly-link">
                    ${msg("doClickHere")}
                </a>
                ${msg("emailVerifyInstruction3")}
            </p>
        </#if>
    </#if>
</@layout.registrationLayout>