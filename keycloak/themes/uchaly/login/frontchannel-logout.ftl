<#--
    Служебная страница для frontchannel-logout через iframe.
    Она пустая — Keycloak сам подгружает нужные iframe'ы.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("frontchannelLogout")}</h1>

    <#elseif section = "form">
        <#if logout??>
            <iframe id="kc-iframe" src="${url.logoutConfirmAction}"
                    style="width:0;height:0;border:0;display:none;"
                    sandbox="allow-scripts allow-same-origin">
            </iframe>
        </#if>
    </#if>
</@layout.registrationLayout>