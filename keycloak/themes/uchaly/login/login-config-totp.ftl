<#--
    Страница настройки TOTP (Google Authenticator и т.п.).
-->
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <h1 class="uchaly-title">${msg("loginTotpTitle")}</h1>

    <#elseif section = "form">
        <form id="kc-totp-settings-form" action="${url.loginAction}" method="post" class="uchaly-form">

            <#if totp.otpCredentials?size == 0 && totp.totpSecretQrCode??>
                <ol class="uchaly-info-list">
                    <#if !totp.enableManualMode??>
                        <li>
                            <p>${msg("loginTotpStep1")}</p>
                            <ul>
                                <li>${msg("loginTotpGoogle")}</li>
                                <li>${msg("loginTotpMicrosoft")}</li>
                                <li>${msg("loginTotpFreeotp")}</li>
                            </ul>
                        </li>
                        <li>
                            <p>${msg("loginTotpScanBarcode")}</p>
                            <div class="uchaly-qr-wrapper">
                                <img id="kc-totp-secret-qr-code"
                                     src="data:image/png;base64, ${totp.totpSecretQrCode}"
                                     alt="QR-код для TOTP">
                            </div>
                            <p>
                                <a href="${totp.manualUrl}" class="uchaly-link" id="mode-manual">
                                    ${msg("loginTotpUnableToScan")}
                                </a>
                            </p>
                        </li>
                    <#else>
                        <li>
                            <p>${msg("loginTotpStep1")}</p>
                            <p>${msg("loginTotpManualStep2")}</p>
                            <p class="uchaly-code-block">${totp.totpSecretEncoded}</p>
                            <p>
                                <a href="${totp.qrUrl}" class="uchaly-link" id="mode-barcode">
                                    ${msg("loginTotpScanBarcode")}
                                </a>
                            </p>
                        </li>
                    </#if>
                    <li>
                        <p>${msg("loginTotpStep3")}</p>
                        <p>${msg("loginTotpStep3DeviceName")}</p>
                    </li>
                </ol>
            <#else>
                <p>${msg("loginTotpType")}: ${totp.totpSecretEncoded!"—"}</p>
            </#if>

            <input type="hidden" id="totpSecret" name="totpSecret" value="${totp.totpSecret}"/>
            <#if totp.enableManualMode??>
                <input type="hidden" id="mode" name="mode"
                       value="<#if totp.manualMode>manual<#else>qr</#if>"/>
            </#if>

            <div class="uchaly-field">
                <label for="totp" class="uchaly-label">
                    ${msg("authenticatorCode")} <span class="uchaly-required-asterisk">*</span>
                </label>
                <input
                    id="totp"
                    name="totp"
                    type="text"
                    class="uchaly-input uchaly-code-input"
                    autocomplete="off"
                    inputmode="numeric"
                    autofocus
                />
            </div>

            <div class="uchaly-field">
                <label for="userLabel" class="uchaly-label">
                    ${msg("loginTotpDeviceName")}
                </label>
                <input
                    id="userLabel"
                    name="userLabel"
                    type="text"
                    class="uchaly-input"
                    autocomplete="off"
                />
            </div>

            <button type="submit" class="uchaly-btn uchaly-btn--primary">
                ${msg("doSubmit")}
            </button>

            <#if isAppInitiatedAction??>
                <button type="submit" name="cancel-aia" value="true"
                        class="uchaly-btn uchaly-btn--secondary">
                    ${msg("doCancel")}
                </button>
            </#if>
        </form>
    </#if>
</@layout.registrationLayout>