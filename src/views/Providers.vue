<template>
  <v-container class="console-providers-container console-container d-flex flex-column">
    <v-btn
      color="primary"
      class="mb-8 align-self-center"
      :loading="newProviderLoading"
      @click="newProviderClick"
    >
      Create new provider
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
      v-if="providerItems === null"
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
        v-for="provider in providerItems"
        :key="provider.id"
      >
        <v-expansion-panel-header>
          {{ provider.name }}
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
                  v-text="provider.name"
                />
              </div>
              <provider-name-change-dialog
                :input="provider.name"
                :rename-provider="getRenameProviderFunction(provider.id)"
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
              </provider-name-change-dialog>
            </div>
            <div class="text-overline mt-2">
              Creation time
            </div>
            <div
              class="text--secondary"
              v-text="provider.creationTimestampString"
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
                  'blur': !provider.tokenRevealed,
                }"
                v-text="provider.tokenRevealed ? provider.token : provider.placeholderToken"
              />
              <v-spacer />
              <v-divider vertical />
              <v-btn
                v-if="!provider.tokenRevealed"
                icon
                class="ma-1"
                @click="revealToken(provider.id)"
              >
                <v-icon>
                  mdi-eye
                </v-icon>
              </v-btn>
              <v-btn
                v-else
                icon
                class="ma-1"
                @click="hideToken(provider.id)"
              >
                <v-icon>
                  mdi-eye-off
                </v-icon>
              </v-btn>
              <v-btn
                icon
                class="my-1 mr-1"
                @click="copy(provider.token)"
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
                :loading="provider.regenerateLoading"
                @click="resetProviderToken(provider.id)"
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
                  :loading="provider.regenerateLoading"
                  @click="resetProviderToken(provider.id)"
                >
                  <v-icon left>
                    mdi-refresh
                  </v-icon>
                  Regenerate
                </v-btn>
              </template>
            </v-sheet>
          </div>
          <!--          <v-divider />-->
          <!--          <div class="px-4 px-sm-6 py-4 d-flex align-sm-center flex-column flex-sm-row">-->
          <!--            <div class="text&#45;&#45;secondary">-->
          <!--              You can delete this provider, because it hasn't been assigned job yet-->
          <!--            </div>-->
          <!--            <div class="d-flex grow">-->
          <!--              <v-spacer />-->
          <!--              <v-btn-->
          <!--                text-->
          <!--                color="red"-->
          <!--                outlined-->
          <!--                class="mt-4 ml-sm-4 mt-sm-4"-->
          <!--              >-->
          <!--                <v-icon left>-->
          <!--                  mdi-delete-->
          <!--                </v-icon>-->
          <!--                Delete-->
          <!--              </v-btn>-->
          <!--            </div>-->
          <!--          </div>-->
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <vue-recaptcha
      ref="recaptcha"
      sitekey="6LcZia0ZAAAAAJIfAAU6gZ_y3NuN3dTwWe_ZtZ_3"
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
  import ProviderNameChangeDialog from '@/components/ProviderNameChangeDialog.vue';
  import VueRecaptcha from 'vue-recaptcha';

  @Component({
    components: {
      ProviderNameChangeDialog,
      VueRecaptcha,
    },
  })
  export default class Providers extends Vue {
    $refs!: {
      recaptcha: VueRecaptcha;
    }

    revealedTokens = new Array<string>();

    regenerateLoading = new Array<string>();

    placeholderTokens = new Map<string, string>();

    get providerItems () {
      return this.$typedStore.state.providers?.map(provider => {
        let placeholderToken = this.placeholderTokens.get(provider.id);
        if (placeholderToken === undefined) {
          placeholderToken = this.generateObviouslyRandomString(32);
          this.placeholderTokens.set(provider.id, placeholderToken);
        }

        return {
          id: provider.id,
          name: provider.name,
          token: provider.token,
          placeholderToken,
          tokenRevealed: this.revealedTokens.includes(provider.id),
          regenerateLoading: this.regenerateLoading.includes(provider.id),
          creationTimestampString: new Date(provider.creationTimestamp).toLocaleString(undefined, {
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

    newProviderLoading = false;

    async newProviderClick () {
      this.newProviderLoading = true;

      if (this.recaptchaResponse === null) {
        this.$refs.recaptcha.execute();
      } else {
        await this.createProvider();
      }
    }

    async createProvider () {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      if (this.recaptchaResponse === null) {
        console.error('No captcha response');
        this.newProviderLoading = false;
        return;
      }

      try {
        await this.$api.createProvider('New provider', this.recaptchaResponse);
      } catch (error) {
        console.error(error);
      }

      this.newProviderLoading = false;
    }

    async resetProviderToken (id: string) {
      if (this.regenerateLoading.includes(id)) return;
      this.regenerateLoading.push(id);

      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await this.$api.resetProviderToken(id);
        this.placeholderTokens.set(id, this.generateObviouslyRandomString(32));
      } catch (error) {
        console.error(error);
      }

      this.regenerateLoading = _.without(this.regenerateLoading, id);
    }

    getRenameProviderFunction (id: string) {
      return async (name: string) => {
        await this.$api.renameProvider(id, name);
      };
    }

    recaptchaResponse: null | string = null;

    captchaError = false;

    async onCaptchaVerify (response: string) {
      this.recaptchaResponse = response;
      await this.createProvider();
      this.captchaError = false;
    }

    onCaptchaExpired () {
      this.recaptchaResponse = null;
      this.newProviderLoading = false;
    }

    onCaptchaError () {
      this.recaptchaResponse = null;
      this.newProviderLoading = false;
      this.captchaError = true;
    }
  }
</script>

<style lang="scss">
  .console-providers-container {
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
