import { State } from '@/store';
import { Store } from 'vuex';
import { ConsoleAPI } from '@/plugins/console';
import { Auth } from '@/plugins/firebase';

declare module 'vue/types/vue' {

  interface Vue {
    $typedStore: Store<State>;
    $auth: Auth;
    $api: ConsoleAPI;
  }
}
