import { chromium } from 'playwright-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'

chromium.use(StealthPlugin())
chromium.use(RecaptchaPlugin({
    provider: {
        id: '2captcha',
        token: process.env.TWOCAPTCHA_TOKEN || 'YOUR_API_KEY'
    }
}))

// New way to overwrite the default options of stealth evasion plugins
// https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth/evasions
chromium.plugins.setDependencyDefaults('stealth/evasions/user-agent-override', {
    userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)',
    locale: 'de-DE,de'
})

export const patchedChromium = () => chromium
