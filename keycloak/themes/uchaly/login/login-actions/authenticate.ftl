<#--
    Промежуточная страница, показывающаяся при переходах между шагами
    аутентификации. Просто отображает сообщение, если что-то пошло не так.
-->
<#import "../template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("loginTitle")}</h1>

    <#elseif section = "form">
        <#if message?? && message.summary??>
            <div class="uchaly-alert uchaly-alert--${message.type!'error'}">
                ${kcSanitize(message.summary)?no_esc}
            </div>
        </#if>
        <a href="${url.loginUrl}" class="uchaly-btn uchaly-btn--primary">
            ${msg("backToLogin")}
        </a>
    </#if>
</@layout.registrationLayout>