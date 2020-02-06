/* eslint-env browser */

// Stop wordpress css from interfering with settings page style.
document.body.classList.remove('wp-core-ui')
document.body.classList.remove('wp-admin')

const IS_PROD = ARC_ENV === 'production'
const cl = console.log

const STATES = {
    REGISTER_QUICKSTART: 'REGISTER_QUICKSTART',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REFER_TO_PORTAL: 'REFER_TO_PORTAL',
}

Sentry.init({
    dsn: 'https://d7bc55b711aa478782f363fd6605431f@sentry.arc.io/2',
    enabled: IS_PROD,
    environment: ARC_ENV,
    blacklistUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /moz-extension:\/\//i,
        /safari-extension:\/\//i
    ],
})

// Copied from BucketMapping.vue
Vue.component('DomainsHelp', {
    template: `
        <div>
            <label class="label">Add domains to cache and accelerate</label>
            <p>
                Add all domains you want to accelerate with Arc's CDN
                below.
            </p>
            <p>
                For example, let's say your website
                is <code>https://www.example.com</code> First,
                add <code>example.com</code> so all static assets
                (JavaScript, CSS, images, video, etc) loaded from
                <code>example.com</code>, like
                <code>https://example.com/assets/foo.js</code>, are cached
                and accelerated.
            </p>
            <p>
                You don't need to add subdomains. When you
                add <code>example.com</code> below, static assets from all
                subdomains, like
                <code>www.example.com</code>, <code>i.example.com</code>,
                <code>cdn.example.com</code>, are also cached and
                accelerated automatically.
            </p>
            <p>
                Additionally, if any static content is loaded from other
                domains not under <code>example.com</code>, like an external
                AWS S3 bucket, add those domains, too. For example,
                <code>my-bucket.s3.us-west-2.amazonaws.com</code>. Arc will
                then cache and accelerate all static assets under
                <code>my-bucket.s3.us-west-2.amazonaws.com</code>, too, like
                <code>https://my-bucket.s3.us-west-2.amazonaws.com/kitty.png</code>.
            </p>
            <p>
                At minimum, be sure to add your website's root domain,
                without the <code>www.</code> e.g., <code>example.com</code>.
            </p>
        </div>
    `
})

Vue.component('RegistrationSuccess', {
    template: `
        <div>
            <h5 class="subtitle is-5">Registration Success!</h5>
            <p>Check for a confirmation email at {{ email }}</p>
            <p>Your temporary password is: {{ password }}</p>
            <p>
                After confirmation, please log into the
                <a :href="loginUrl" v-text="'portal'" target="_blank"/>
                and change it at your earliest convenience. This is the only
                time you'll be shown the password.
            </p>
            <p>
                Registration is complete once you click the confirmation link.
                Your website will be accelerated and start earning money.
            </p>
        </div>
    `,
    props: {
        email: String,
        password: String,
    },
    computed: {
        loginUrl () {
            return `${ACCOUNT_ORIGIN}/login?email=${this.email}&password=${this.password}`
        }
    }
})

Vue.component('ReferToPortal', {
    template: `
        <div>
            <p>
                Administer your Arc account at
                <a :href="portalUrl" v-text="portalUrl" target="_blank"/>.
            </p>
            <p>
                Update the Arc account email at
                <a :href="accountPageUrl" v-text="accountPageUrl" target="_blank"/>.
            </p>
            <p>
                Update the CDN domains at
                <a :href="cdnPageUrl" v-text="cdnPageUrl" target="_blank"/>.
            </p>
            <p>
                View earnings or update the PayPal account email at
                <a :href="earningsPageUrl" v-text="earningsPageUrl" target="_blank"/>.
            </p>
        </div>
    `,
    props: {
        portalUrl: String
    },
    computed: {
        accountPageUrl () { return `${this.portalUrl}/account` },
        earningsPageUrl () { return `${this.portalUrl}/publishers/earnings` },
        cdnPageUrl () { return `${this.portalUrl}/cloud/auto-cdn` },
    }
})

new Vue({
    el: '#arc-wp-admin-app',
    template: `
        <form @submit.prevent="submit" id="arc-wp-admin-app" class="container">
            <h1 class="title">Arc Admin</h1>
            <br>
            <ReferToPortal
                v-if="state === STATES.REFER_TO_PORTAL"
                :portalUrl="portalUrl" />
            <RegistrationSuccess
                v-else-if="state === STATES.REGISTER_SUCCESS"
                :email="arcEmail"
                :password="arcPassword"
                :portalUrl="portalUrl" />
            <template v-else>
                <h5 class="subtitle is-5">Registration Quickstart</h5>
                <p>
                    In order to use Arc's CDN and receive payouts, you need to create an Arc account.
                    This will only take a few minutes.
                </p>
                <p>
                    Once your account is created, you can update these fields at
                    <a :href="portalUrl" v-text="portalUrl" target="_blank"/>.
                </p>
                <div class="field">
                    <label class="label">Arc Account Email</label>
                    <div class="control">
                        <input
                            v-model="arcEmail"
                            class="input"
                            type="email"
                            required>
                    </div>
                    <p>
                        This email will be used to register your Arc account.
                    </p>
                </div>
                <div class="field">
                    <label class="label">PayPal Account Email</label>
                    <div class="control">
                        <input
                            v-model="paypalEmail"
                            class="input"
                            type="email">
                    </div>
                    <p>
                        Arc will send payouts to this
                        <a href="https://www.paypal.com/" target="_blank">PayPal</a>
                        email. If you don't have
                        a PayPal account, you can still enter an email.
                        If this PayPal email receives a payout, but no account exists,
                        it will receive an email from PayPal with instructions to register.
                    </p>
                </div>
                <DomainsHelp />
                <div v-for="domain in domains"
                    class="field has-addons" :key="domain.key">
                    <div class="control is-expanded">
                        <input
                            v-model="domain.val"
                            placeholder="Domain"
                            class="input"
                            ref="domainInput"
                            required>
                    </div>
                    <div class="control">
                        <button
                        @click="deleteDomain(domain.key)"
                        class="button has-text-danger"
                        :disabled="domains.length === 1">
                            <span class="icon">✖</span>
                        </button>
                    </div>
                </div>
                <button
                    @click="addDomain"
                    class="button"
                    type="button">
                    Add Domain
                </button>
                <br><br>
                <button
                    class="button"
                    :class="{ 'is-loading': isLoading }"
                    type="submit">
                    Submit
                </button>
                <p v-if="errMsg" class="has-text-danger">
                    An error occurred: {{ errMsg }}
                </p>
            </template>
        </form>
    `,
    data () {
        return {
            state: STATES.REGISTER_QUICKSTART,
            STATES,
            isLoading: false,
            portalUrl: PORTAL_VUE_ORIGIN,
            arcEmail: ARC_EMAIL || WP_ADMIN_EMAIL || '',
            paypalEmail: WP_ADMIN_EMAIL || '',
            arcPassword: this.createRandomString(16),
            propertyId: PROPERTY_ID,
            domains: [this.createBlankDomain()],
            errMsg: '',
        }
    },
    computed: {
        postBody () {
            return {
                ClientId: IS_PROD
                    ? '431634imeo45noat90ccl0lkep'
                    : '4plk06vpmpo1cdeh6mlpu1rj1i',
                Username: this.arcEmail,
                Password: this.arcPassword,
                UserAttributes: [{
                    Name: 'custom:quick_signup',
                    Value: JSON.stringify({
                        domains: this.domains.map(d => d.val),
                        paypalEmail: this.paypalEmail,
                        propertyId: this.propertyId,
                    })
                }]
            }
        }
    },
    created () {
        if (ARC_EMAIL) {
            // User completed registration
            this.transition(STATES.REFER_TO_PORTAL)
        } else {
            try {
                // Prefill the first domain
                const urlObj = new URL(WP_HOME_URL)
                this.domains[0].val = urlObj.hostname
            } catch (err) {
                cl(err)
            }
        }
    },
    methods: {
        transition (to) {
            this.state = to
        },
        async submit () {
            try {
                this.isLoading = true
                this.errMsg = ''

                const url = 'https://cognito-idp.us-east-2.amazonaws.com/'
                const res = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(this.postBody),
                    headers: {
                        'x-amz-target': 'AWSCognitoIdentityProviderService.SignUp',
                        'content-type': 'application/x-amz-json-1.1'
                    }
                })
                if (res.status >= 400) {
                    const err = await res.json()
                    this.errMsg = err.message
                    Sentry.captureException(err)
                    return
                }

                await this.saveArcUser()

                this.transition(STATES.REGISTER_SUCCESS)
            } finally {
                this.isLoading = false
            }
        },
        async saveArcUser () {
            const data = new FormData()
            data.append('action', 'update_arc_user')
            data.append('email', this.arcEmail)
            data.append('nonce', WP_AJAX_NONCE)

            const res = await fetch(WP_AJAX_URL, {
                method: 'POST',
                body: data,
            })
            cl(res)
        },
        // https://stackoverflow.com/a/1497512/2498782
        createRandomString (strLength = 8) {
            const bs58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
            let pw = ''
            for (var i = 0, n = bs58.length; i < strLength; ++i) {
                pw += bs58.charAt(Math.floor(Math.random() * n))
            }
            return pw
        },
        createBlankDomain: () => ({ val: '', key: Date.now() }),
        async addDomain () {
            this.domains.push(this.createBlankDomain())
            await this.$nextTick() // Wait for the new <input> element.

            const $lastInput = (
                this.$refs.domainInput[this.$refs.domainInput.length - 1])
            $lastInput.focus()
        },
        deleteDomain (key) {
            this.domains = this.domains.filter(d => d.key !== key)
        }
    }
})
