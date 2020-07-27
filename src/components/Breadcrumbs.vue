<template>
  <v-breadcrumbs
    :items="breadcrumbs"
    class="align-self-center breadcrumbs pt-8"
  />
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import _ from 'lodash';
  import { RouteRecord } from 'vue-router';

  export interface BreadcrumbItemHref {
    text: string;
    href: string;
    exact: true;
  }

  export interface BreadcrumbItemTo {
    text: string;
    to: string;
    exact: true;
  }

  export interface BreadcrumbItemDisabled {
    text: string;
    disabled: true;
  }

  export type BreadcrumbItem = BreadcrumbItemHref | BreadcrumbItemTo | BreadcrumbItemDisabled;

  @Component
  export default class Breadcrumbs extends Vue {
    get breadcrumbs () {
      const items: BreadcrumbItem[] = [
        {
          text: 'Open Website Status',
          href: process.env.VUE_APP_WEBSITE_HREF,
          exact: true,
        },
      ];

      if (this.$typedStore.state.user === null) {
        items.push({
          text: 'Console',
          disabled: true,
        }, {
          text: 'Sign in',
          disabled: true,
        });
      } else {
        items.push({
          text: 'Console',
          to: '/',
          exact: true,
        });

        const route = _.findLast<RouteRecord>(this.$route.matched, (route) => route.meta?.breadcrumbs !== undefined);
        const breadcrumbs: BreadcrumbItem[] = route?.meta?.breadcrumbs ?? [];
        items.push(...breadcrumbs);
      }

      return items;
    }
  }
</script>

<style lang="scss">
  .breadcrumbs {
    width: 900px;
    max-width: 100%;
  }
</style>
