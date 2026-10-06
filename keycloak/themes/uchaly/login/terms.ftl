<#--
    Страница с условиями использования (Terms & Conditions).
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("termsTitle")}</h1>

    <#elseif section = "form">
        <div class="uchaly-terms-text">
            ${kcSanitize(msg("termsText"))?no_esc}
        </div>

        <form action="${url.loginAction}" method="post" class="uchaly-form">
            <button type="submit" name="accept" class="uchaly-btn uchaly-btn--primary">
                ${msg("doAccept")}
            </button>

            <button type="submit" name="cancel" class="uchaly-btn uchaly-btn--secondary">
                ${msg("doDecline")}
            </button>
        </form>
    </#if>
</@layout.registrationLayout>