<#--
    Экран согласия OAuth2 (пользователь подтверждает доступ приложению).
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">
            ${msg("oauthGrantTitle", (realm.displayName!'Uchaly'))}
        </h1>

    <#elseif section = "form">
        <form id="kc-oauth" action="${url.oauthAction}" method="post" class="uchaly-form">

            <p class="uchaly-text">
                ${msg("oauthGrantRequest")}
            </p>

            <ul class="uchaly-info-list uchaly-scopes-list">
                <#list oauth.scopes as scope>
                    <li>
                        <span class="uchaly-scope-name">${scope.name}</span>
                        <#if scope.displayName??>
                            — <span class="uchaly-scope-desc">${scope.displayName}</span>
                        </#if>
                    </li>
                </#list>
            </ul>

            <input type="hidden" name="code" value="${oauth.code}"/>

            <button type="submit" class="uchaly-btn uchaly-btn--primary">
                ${msg("doYes")}
            </button>

            <button type="submit" name="cancel" value="true"
                    class="uchaly-btn uchaly-btn--secondary">
                ${msg("doNo")}
            </button>
        </form>
    </#if>
</@layout.registrationLayout>