import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue');
const Providers = () => import(/* webpackChunkName: "providers" */ '../views/Providers.vue');
const ApiClients = () => import(/* webpackChunkName: "api-clients" */ '../views/ApiClients.vue');

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
      path: '/',
      component: Dashboard,
    },
    {
      path: '/api-clients',
      component: ApiClients,
      meta: {
        breadcrumbs: [{
          text: 'API clients',
          to: '/api-clients',
          exact: true,
        }],
      },
    },
    {
      path: '/providers',
      component: Providers,
      meta: {
        breadcrumbs: [{
          text: 'Providers',
          to: '/providers',
          exact: true,
        }],
      },
    },
    {
      path: '*',
      redirect: '/',
    },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
