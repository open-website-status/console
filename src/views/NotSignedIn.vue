<template>
  <v-container class="console-container console-not-signed-in-container fill-height d-flex flex-column">
    <v-spacer />
    <v-card
      width="420"
      outlined
    >
      <div class="d-flex justify-center avatar-wrapper">
        <v-avatar
          :size="128"
          class="avatar elevation-8"
          color="primary"
        >
          <v-icon :size="80">
            mdi-login
          </v-icon>
        </v-avatar>
      </div>
      <v-card-title class="d-block text-center text-h5">
        Sign in
      </v-card-title>
      <v-alert
        color="error"
        class="mx-4"
        text
        border="left"
        :value="error !== null"
        icon="mdi-alert-circle"
      >
        {{ error }}
      </v-alert>
      <v-card
        v-if="linking !== null"
        outlined
        class="mx-4 mb-6"
      >
        <v-card-text class="pb-0">
          There already exists an account for the email {{ linking.email }}, but a different provider. Sign in using the existing provider to link the accounts.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="linking = null"
          >
            Cancel linking
          </v-btn>
        </v-card-actions>
      </v-card>
      <div class="pb-2 px-5">
        <v-progress-linear
          v-if="loading"
          indeterminate
          color="primary"
          class="my-13"
        />
        <template v-else>
          <v-btn
            rounded
            :large="$vuetify.breakpoint.smAndUp"
            block
            class="mb-3"
            color="#4285F4"
            :disabled="linking !== null && !linking.providers.includes('google.com')"
            @click="signInWithGoogle"
          >
            <v-icon
              v-if="$vuetify.breakpoint.smAndUp"
              left
            >
              mdi-google
            </v-icon>
            <v-spacer />
            {{ $vuetify.breakpoint.xsOnly ? 'With Google' : 'Sign in with Google' }}
            <v-spacer />
          </v-btn>
          <v-btn
            rounded
            :large="$vuetify.breakpoint.smAndUp"
            block
            class="mb-3"
            :disabled="linking !== null && !linking.providers.includes('github.com')"
            :light="!loading && (linking === null || linking.providers.includes('github.com'))"
            @click="signInWithGithub"
          >
            <v-icon
              v-if="$vuetify.breakpoint.smAndUp"
              left
            >
              mdi-github
            </v-icon>
            <v-spacer />
            {{ $vuetify.breakpoint.xsOnly ? 'With GitHub' : 'Sign in with GitHub' }}
            <v-spacer />
          </v-btn>
        </template>
        <v-btn
          text
          block
          rounded
          :href="websiteHref"
        >
          Go back
        </v-btn>
      </div>
    </v-card>
    <v-spacer />
  </v-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import * as firebase from 'firebase/app';
  import 'firebase/auth';

  @Component
  export default class NotSignedIn extends Vue {
    linking: {
      providers: string[];
      email: string;
      credential: firebase.auth.AuthCredential;
    } | null = null;

    loading = false;

    error: string | null = null;

    get websiteHref () {
      return process.env.VUE_APP_WEBSITE_HREF;
    }

    async signInWithGoogle () {
      this.loading = true;
      this.error = null;
      try {
        await this.$auth.signInWithGooglePopup();
        if (this.linking !== null) {
          await this.$auth.linkWithCredential(this.linking.credential);
          this.linking = null;
        }
      } catch (error) {
        await this.dispatchError(error);
      }
      this.loading = false;
    }

    async signInWithGithub () {
      this.loading = true;
      this.error = null;
      try {
        await this.$auth.signInWithGitHubPopup();
        if (this.linking !== null) {
          await this.$auth.linkWithCredential(this.linking.credential);
          this.linking = null;
        }
      } catch (error) {
        await this.dispatchError(error);
      }
      this.loading = false;
    }

    async dispatchError (error: unknown) {
      console.error(error);
      let message: string;
      if (typeof error !== 'object' || error === null || !('code' in error)) {
        message = 'An unexpected error occurred';
      } else {
        const firebaseError = error as firebase.auth.AuthError;

        if (firebaseError.code === 'auth/account-exists-with-different-credential') {
          try {
            const providers = await this.$auth.fetchSignInMethodsForEmail(firebaseError.email!);
            this.linking = {
              providers,
              credential: firebaseError.credential!,
              email: firebaseError.email!,
            };
          } catch (error) {
            console.error(error);
            this.error = 'An unexpected error occurred';
          }
          return;
        }

        if (firebaseError.code === 'auth/auth/popup-closed-by-user') {
          message = 'The popup was closed';
        } else if (firebaseError.code === 'auth/popup-blocked') {
          message = 'The popup has been blocked';
        } else {
          message = 'An unexpected error occurred';
        }
      }

      this.error = message;
    }
  }
</script>

<style lang="scss">
  .console-not-signed-in-container {
    .avatar-wrapper {
      margin-top: -64px;
    }
  }
</style>
