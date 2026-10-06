<#--
    Подтверждение выхода.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("logoutConfirmTitle")}</h1>
        <p class="uchaly-subtitle">${msg("logoutConfirmHeader")}</p>

    <#elseif section = "form">
        <form action="${url.logoutConfirmAction}" method="post" class="uchaly-form">
            <input type="hidden" name="session_code" value="${logoutConfirm.code}"/>

            <button type="submit" name="confirmLogout" class="uchaly-btn uchaly-btn--primary">
                ${msg("doLogout")}
            </button>

            <#if !logoutConfirm.skipLink>
                <#if (client.baseUrl)?has_content>
                    <a href="${client.baseUrl}" class="uchaly-btn uchaly-btn--secondary">
                        ${msg("doCancel")}
                    </a>
                <#else>
                    <a href="${url.loginUrl}" class="uchaly-btn uchaly-btn--secondary">
                        ${msg("doCancel")}
                    </a>
                </#if>
            </#if>
        </form>
    </#if>
</@layout.registrationLayout>