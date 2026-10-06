<#--
    Подтверждение удаления аккаунта.
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("deleteAccountConfirm")}</h1>

    <#elseif section = "form">
        <div class="uchaly-alert uchaly-alert--warning">
            ${msg("irreversibleAction")}
        </div>

        <p class="uchaly-text">${msg("deletingImplies")}</p>
        <ul class="uchaly-info-list">
            <li>${msg("loggingInImpossible")}</li>
            <li>${msg("errasingData")}</li>
            <li>${msg("deletingYourUser")}</li>
        </ul>

        <form action="${url.loginAction}" method="post" class="uchaly-form">
            <button type="submit" name="delete" class="uchaly-btn uchaly-btn--danger">
                ${msg("doConfirmDelete")}
            </button>

            <#if triggered_from_aia?? && triggered_from_aia == true>
                <button type="submit" name="cancel-aia" value="true"
                        class="uchaly-btn uchaly-btn--secondary">
                    ${msg("doCancel")}
                </button>
            </#if>
        </form>
    </#if>
</@layout.registrationLayout>