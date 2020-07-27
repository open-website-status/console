<template>
  <v-container class="console-api-clients-container console-container d-flex flex-column">
    <v-btn
      color="primary"
      class="mb-8 align-self-center"
      :loading="newApiClientLoading"
      @click="newApiClientClick"
    >
      Create new API client
    </v-btn>
    <v-alert
      class="mb-12"
      color="error"
      icon="mdi-alert-circle"
      :value="captchaError"
      transition="slide-x-transition"
    >
      Sorry, there was an error with reCAPTCHA
    </v-alert>
    <v-progress-circular
      v-if="apiClientItems === null"
      indeterminate
      color="primary"
      class="my-8 align-self-center"
      :size="64"
    />
    <v-expansion-panels
      v-else
      multiple
      hover
    >
      <v-expansion-panel
        v-for="apiClient in apiClientItems"
        :key="apiClient.id"
      >
        <v-expansion-panel-header>
          {{ apiClient.name }}
        </v-expansion-panel-header>
        <v-expansion-panel-content class="expansion-panel-content-remove-padding">
          <div class="px-4 px-sm-6 pb-4">
            <div class="d-flex">
              <div class="grow">
                <div class="text-overline">
                  Name
                </div>
                <div
                  class="text--secondary"
                  v-text="apiClient.name"
                />
              </div>
              <api-client-name-change-dialog
                :input="apiClient.name"
                :rename-api-client="getRenameApiClientFunction(apiClient.id)"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    class="align-self-end ml-1"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                </template>
              </api-client-name-change-dialog>
            </div>
            <div class="text-overline mt-2">
              Token
            </div>
            <div class="text-overline mt-2">
              Creation time
            </div>
            <div
              class="text--secondary"
              v-text="apiClient.creationTimestampString"
            />
            <div class="text-overline mt-2">
              Token
            </div>
            <v-sheet
              outlined
              rounded
              class="d-flex align-center"
            >
              <div
                class="token mx-3 text-no-wrap overflow-x-hidden text-truncate"
                :class="{
                  'blur': !apiClient.tokenRevealed,
                }"
                v-text="apiClient.tokenRevealed ? apiClient.token : apiClient.placeholderToken"
              />
              <v-spacer />
              <v-divider vertical />
              <v-btn
                v-if="!apiClient.tokenRevealed"
                icon
                class="ma-1"
                @click="revealToken(apiClient.id)"
              >
                <v-icon>
                  mdi-eye
                </v-icon>
              </v-btn>
              <v-btn
                v-else
                icon
                class="ma-1"
                @click="hideToken(apiClient.id)"
              >
                <v-icon>
                  mdi-eye-off
                </v-icon>
              </v-btn>
              <v-btn
                icon
                class="my-1 mr-1"
                @click="copy(apiClient.token)"
              >
                <v-icon>
                  mdi-content-copy
                </v-icon>
              </v-btn>
              <v-btn
                v-if="$vuetify.breakpoint.width < 700"
                class="my-1 mr-1"
                icon
                color="red"
                :loading="apiClient.regenerateLoading"
                @click="resetApiClientToken(apiClient.id)"
              >
                <v-icon>
                  mdi-refresh
                </v-icon>
              </v-btn>
              <template v-else>
                <v-divider vertical />
                <v-btn
                  class="ma-1"
                  text
                  color="red"
                  :loading="apiClient.regenerateLoading"
                  @click="resetApiClientToken(apiClient.id)"
                >
                  <v-icon left>
                    mdi-refresh
                  </v-icon>
                  Regenerate
                </v-btn>
              </template>
            </v-sheet>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <vue-recaptcha
      ref="recaptcha"
      :sitekey="recaptchaSiteKey"
      load-recaptcha-script
      size="invisible"
      @verify="onCaptchaVerify"
      @expired="onCaptchaExpired"
      @error="onCaptchaError"
    />
  </v-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import _ from 'lodash';
  import copy from 'clipboard-copy';
  import VueRecaptcha from 'vue-recaptcha';
  import ApiClientNameChangeDialog from '@/components/ApiClientNameChangeDialog.vue';

  @Component({
    components: {
      ApiClientNameChangeDialog,
      VueRecaptcha,
    },
  })
  export default class ApiClients extends Vue {
    $refs!: {
      recaptcha: VueRecaptcha;
    }

    revealedTokens = new Array<string>();

    regenerateLoading = new Array<string>();

    placeholderTokens = new Map<string, string>();

    get recaptchaSiteKey () {
      return process.env.VUE_APP_RECAPTCHA_SITEKEY;
    }

    get apiClientItems () {
      return this.$typedStore.state.apiClients?.map(apiClient => {
        let placeholderToken = this.placeholderTokens.get(apiClient.id);
        if (placeholderToken === undefined) {
          placeholderToken = this.generateObviouslyRandomString(32);
          this.placeholderTokens.set(apiClient.id, placeholderToken);
        }

        return {
          id: apiClient.id,
          name: apiClient.name,
          token: apiClient.token,
          placeholderToken,
          tokenRevealed: this.revealedTokens.includes(apiClient.id),
          regenerateLoading: this.regenerateLoading.includes(apiClient.id),
          creationTimestampString: new Date(apiClient.creationTimestamp).toLocaleString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
        };
      }) ?? null;
    }

    revealToken (id: string) {
      this.revealedTokens.push(id);
    }

    hideToken (id: string) {
      this.revealedTokens = _.difference(this.revealedTokens, [id]);
    }

    generateRandomString (len: number) {
      const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return [...Array(len)].reduce(a => a + p[~~(Math.random() * p.length)], '');
    }

    generateObviouslyRandomString (len: number) {
      const obviousString = '>Placeholder<';
      const randomStringLen = len - obviousString.length;
      const lengthBefore = _.random(2, randomStringLen - 2, false);
      const lengthAfter = randomStringLen - lengthBefore;
      return `${this.generateRandomString(lengthBefore)}${obviousString}${this.generateRandomString(lengthAfter)}`;
    }

    async copy (text: string) {
      try {
        await copy(text);
      } catch (error) {
        console.warn(error);
      }
    }

    newApiClientLoading = false;

    async newApiClientClick () {
      this.newApiClientLoading = true;

      if (this.recaptchaResponse === null) {
        this.$refs.recaptcha.execute();
      } else {
        await this.createApiClient();
      }
    }

    async createApiClient () {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      if (this.recaptchaResponse === null) {
        console.error('No captcha response');
        this.newApiClientLoading = false;
        return;
      }

      try {
        await this.$api.createAPIClient('New API client', this.recaptchaResponse);
      } catch (error) {
        console.error(error);
      }

      this.newApiClientLoading = false;
    }

    async resetApiClientToken (id: string) {
      if (this.regenerateLoading.includes(id)) return;
      this.regenerateLoading.push(id);

      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await this.$api.resetAPIClientToken(id);
        this.placeholderTokens.set(id, this.generateObviouslyRandomString(32));
      } catch (error) {
        console.error(error);
      }

      this.regenerateLoading = _.without(this.regenerateLoading, id);
    }

    getRenameApiClientFunction (id: string) {
      return async (name: string) => {
        await this.$api.renameAPIClient(id, name);
      };
    }

    recaptchaResponse: null | string = null;

    captchaError = false;

    async onCaptchaVerify (response: string) {
      this.recaptchaResponse = response;
      await this.createApiClient();
      this.captchaError = false;
    }

    onCaptchaExpired () {
      this.recaptchaResponse = null;
      this.newApiClientLoading = false;
    }

    onCaptchaError () {
      this.recaptchaResponse = null;
      this.newApiClientLoading = false;
      this.captchaError = true;
    }
  }
</script>

<style lang="scss">
  .console-api-clients-container {
    .expansion-panel-content-remove-padding > .v-expansion-panel-content__wrap {
      padding: 0;
    }

    .token {
      user-select: all;
      font-family: monospace;

      &.blur {
        filter: blur(3px);
        user-select: none;
      }
    }
  }
</style>
