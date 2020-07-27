import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import firebase from './plugins/firebase';
import consoleAPI from './plugins/console';
import store from './store';

Vue.config.productionTip = false;

Vue.use(firebase);
Vue.use(consoleAPI);

new Vue({
  router,
  vuetify,
  store,
  watch: {
    '$store.state.user.uid': {
      async handler (value: string | undefined) {
        if (value) {
          const token = await this.$auth.getIdToken();
          this.$api.connect(token);
        } else {
          this.$api.close();
        }
      },
      immediate: true,
    },
  },
  render: (h) => h(App),
}).$mount('#app');
