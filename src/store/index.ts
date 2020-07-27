import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import Firebase from 'firebase/app';
import { APIClient, Provider } from '@/plugins/console/types';

Vue.use(Vuex);

Object.defineProperty(Vue.prototype, '$typedStore', {
  get (): Store<State> {
    return this.$store;
  },
});

export interface State {
  user: Firebase.User | null;
  userLoaded: boolean;
  connected: boolean;
  providers: Provider[] | null;
  apiClients: APIClient[] | null;
}

export default new Vuex.Store<State>({
  state: {
    user: null,
    userLoaded: false,
    connected: false,
    providers: null,
    apiClients: null,
  },
  mutations: {
    setUser (state, user: Firebase.User | null): void {
      state.user = user === null ? null : { ...user };
      state.userLoaded = true;
    },
    setConnected (state, connected: boolean): void {
      state.connected = connected;
    },
    setProviders (state, providers: Provider[] | null): void {
      state.providers = providers;
    },
    setAPIClients (state, apiClients: APIClient[] | null): void {
      state.apiClients = apiClients;
    },
  },
  actions: {
  },
  modules: {
  },
});
