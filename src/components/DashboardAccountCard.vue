<template>
  <v-card
    outlined
    width="480"
  >
    <div class="d-flex justify-center avatar-wrapper">
      <v-avatar
        :size="128"
        class="avatar elevation-8"
      >
        <v-img :src="$typedStore.state.user.photoURL">
          <template v-slot:placeholder>
            <v-sheet
              color="grey darken-4"
              class="fill-height"
            >
              <v-icon :size="80">
                mdi-account-circle
              </v-icon>
            </v-sheet>
          </template>
        </v-img>
      </v-avatar>
    </div>
    <v-card-title
      class="d-block text-center"
      v-text="$typedStore.state.user.displayName"
    />
    <v-card-subtitle
      class="pb-0 text-center"
      v-text="$typedStore.state.user.email"
    />
    <v-card-actions class="my-2 mx-4">
      <v-btn
        outlined
        rounded
        large
        block
        @click="$auth.signOut()"
      >
        Sign out
      </v-btn>
    </v-card-actions>
    <v-divider />
    <v-subheader class="mt-2">
      Sign in methods
    </v-subheader>
    <v-list
      subheader
      dense
    >
      <v-list-item
        v-for="provider in providerItems"
        :key="provider.id"
      >
        <v-list-item-icon>
          <v-badge
            icon="mdi-check"
            color="green black--text"
            overlap
            bordered
            :value="provider.linked"
          >
            <v-icon>{{ provider.icon }}</v-icon>
          </v-badge>
        </v-list-item-icon>
        <v-list-item-title>{{ provider.name }}</v-list-item-title>
        <v-list-item-action-text>
          <v-btn
            v-if="provider.linked"
            outlined
            rounded
            small
            class="ml-2"
            :disabled="linkedProviders.length <= 1"
            @click="unlinkConfirm = provider.id"
          >
            <v-icon left>
              mdi-link-off
            </v-icon>
            Unlink
          </v-btn>
          <v-btn
            v-else
            outlined
            rounded
            small
            :disabled="linkLoading"
            @click="provider.link"
          >
            <v-icon left>
              mdi-link
            </v-icon>
            Link
          </v-btn>
        </v-list-item-action-text>
      </v-list-item>
    </v-list>

    <v-dialog
      max-width="400"
      :value="unlinkConfirm"
      :persistent="unlinkLoading"
      @input="unlinkConfirmDialogChange"
    >
      <v-card color="grey darken-3">
        <v-card-title>
          Unlink account?
        </v-card-title>
        <v-card-text>
          You will no longer be able to sign in using this method
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            :disabled="unlinkLoading"
            @click="unlinkConfirm = null"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="unlinkLoading"
            autofocus
            @click="unlink()"
          >
            <v-icon left>
              mdi-link-off
            </v-icon>
            Unlink
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import * as firebase from 'firebase/app';

  @Component
  export default class DashboardAccountCard extends Vue {
    linkLoading = false;
    unlinkLoading = false;
    unlinkConfirm: string | null = null;

    get providerItems () {
      if (this.$typedStore.state.user === null) return [];
      return [
        {
          id: 'google.com',
          icon: 'mdi-google',
          name: 'Google',
          linked: this.linkedProviders.includes('google.com'),
          link: this.linkGoogle,
        },
        {
          id: 'github.com',
          icon: 'mdi-github',
          name: 'GitHub',
          linked: this.linkedProviders.includes('github.com'),
          link: this.linkGithub,
        },
      ];
    }

    get linkedProviders () {
      if (this.$typedStore.state.user === null) return [];
      const providerData = this.$typedStore.state.user.providerData
        .filter((e) => e !== null) as firebase.UserInfo[];
      return providerData.map(provider => provider.providerId);
    }

    async linkGoogle () {
      this.linkLoading = true;
      try {
        await this.$auth.linkGoogle();
      } catch (error) {
        console.error(error);
      }
      this.linkLoading = false;
    }

    async linkGithub () {
      this.linkLoading = true;
      try {
        await this.$auth.linkGithub();
      } catch (error) {
        console.error(error);
      }
      this.linkLoading = false;
    }

    async unlink () {
      if (!this.unlinkConfirm) return;
      this.unlinkLoading = true;
      try {
        await this.$auth.unlink(this.unlinkConfirm);
        this.unlinkConfirm = null;
      } catch (error) {
        console.error(error);
      }
      this.unlinkLoading = false;
    }

    unlinkConfirmDialogChange (value: boolean) {
      if (!value) {
        this.unlinkConfirm = null;
      }
    }
  }
</script>
