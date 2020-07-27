<template>
  <v-app>
    <breadcrumbs />
    <v-main>
      <div
        v-if="!$typedStore.state.userLoaded || ($typedStore.state.user !== null && !$typedStore.state.connected)"
        class="d-flex fill-height align-center justify-center"
      >
        <v-progress-circular
          :size="96"
          indeterminate
          color="primary"
          class="d-block mx-auto my-16"
        />
      </div>
      <v-fade-transition
        v-else
        mode="out-in"
      >
        <not-signed-in
          v-if="$typedStore.state.user === null"
        />
        <router-view
          v-else
        />
      </v-fade-transition>
    </v-main>
  </v-app>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import NotSignedIn from '@/views/NotSignedIn.vue';
  import Breadcrumbs from '@/components/Breadcrumbs.vue';

  @Component({
    components: {
      Breadcrumbs,
      NotSignedIn,
    },
  })
  export default class App extends Vue {

  }
</script>

<style lang="scss">
  .console-container {
    max-width: 900px;
  }
</style>
