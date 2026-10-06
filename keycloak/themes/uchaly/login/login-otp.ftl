<#--
    Страница ввода OTP-кода (двухфакторная аутентификация).
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("loginOtpTitle")}</h1>
        <p class="uchaly-subtitle">${msg("loginOtpInstruction")}</p>

    <#elseif section = "form">
        <form id="kc-otp-login-form" action="${url.loginAction}" method="post" class="uchaly-form">

            <#if otpLogin.userOtpCredentials?size gt 1>
                <div class="uchaly-field">
                    <label class="uchaly-label">${msg("loginChooseAuthenticator")}</label>
                    <div class="uchaly-otp-list">
                        <#list otpLogin.userOtpCredentials as otpCredential>
                            <label class="uchaly-otp-item">
                                <input
                                    type="radio"
                                    name="selectedCredentialId"
                                    value="${otpCredential.id}"
                                    <#if otpCredential.id == otpLogin.selectedCredentialId>checked</#if>
                                />
                                <span>${otpCredential.userLabel}</span>
                            </label>
                        </#list>
                    </div>
                </div>
            </#if>

            <div class="uchaly-field">
                <label for="otp" class="uchaly-label">
                    ${msg("loginOtpOneTime")}
                </label>
                <input
                    id="otp"
                    name="otp"
                    type="text"
                    class="uchaly-input uchaly-code-input"
                    autocomplete="one-time-code"
                    inputmode="numeric"
                    autofocus
                    value=""
                />
            </div>

            <button type="submit" name="login" class="uchaly-btn uchaly-btn--primary">
                ${msg("doLogIn")}
            </button>
        </form>

        <#if auth.showTryAnotherWayLink && auth.showTryAnotherWayLink == true>
            <div class="uchaly-footer-actions">
                <form id="kc-select-try-another-way-form"
                      action="${url.loginAction}" method="post">
                    <input type="hidden" name="tryAnotherWay" value="on"/>
                    <button type="submit" class="uchaly-link">
                        ${msg("doTryAnotherWay")}
                    </button>
                </form>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>