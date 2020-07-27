import _Vue from 'vue';
import {
  APIClient,
  APIClientListMessage,
  Provider,
  ProviderListMessage,
} from '@/plugins/console/types';
import io from 'socket.io-client';
import store from '@/store';

export class ConsoleAPI {
  private socket: SocketIOClient.Socket | null = null;

  connect (token: string) {
    this.close();
    this.socket = io(process.env.VUE_APP_SERVER_URL, {
      query: {
        token,
      },
      path: '/console-socket',
    });

    this.socket.on('provider-list', (message: ProviderListMessage) => ConsoleAPI.onProviderList(message.data));
    this.socket.on('api-client-list', (message: APIClientListMessage) => ConsoleAPI.onAPIClientList(message.data));

    this.socket.on('connect', () => ConsoleAPI.onConnect());
    this.socket.on('disconnect', () => ConsoleAPI.onDisconnect());
  }

  public close () {
    ConsoleAPI.onDisconnect();
    this.socket?.removeAllListeners();
    this.socket?.close();
    this.socket = null;
  }

  private static onProviderList (providers: Provider[]) {
    store.commit('setProviders', providers);
  }

  private static onAPIClientList (apiClients: APIClient[]) {
    store.commit('setAPIClients', apiClients);
  }

  private static onConnect () {
    store.commit('setConnected', true);
  }

  private static onDisconnect () {
    store.commit('setConnected', false);
    store.commit('setProviders', null);
    store.commit('setAPIClients', null);
  }

  public createProvider (name: string, reCaptchaResponse: string) {
    return new Promise<Provider>((resolve, reject) => {
      if (this.socket?.connected !== true) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('create-provider', {
        name,
        reCaptchaResponse,
      }, (error: string, provider: Provider) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(provider);
        }
      });
    });
  }

  public renameProvider (id: string, name: string) {
    return new Promise<Provider>((resolve, reject) => {
      if (this.socket?.connected !== true) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('rename-provider', {
        id,
        name,
      }, (error: string, provider: Provider) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(provider);
        }
      });
    });
  }

  public resetProviderToken (id: string) {
    return new Promise<Provider>((resolve, reject) => {
      if (this.socket?.connected !== true) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('reset-provider-token', {
        id,
      }, (error: string, provider: Provider) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(provider);
        }
      });
    });
  }

  public createAPIClient (name: string, reCaptchaResponse: string) {
    return new Promise<APIClient>((resolve, reject) => {
      if (this.socket?.connected !== true) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('create-api-client', {
        name,
        reCaptchaResponse,
      }, (error: string, apiClient: APIClient) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(apiClient);
        }
      });
    });
  }

  public renameAPIClient (id: string, name: string) {
    return new Promise<APIClient>((resolve, reject) => {
      if (this.socket?.connected !== true) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('rename-api-client', {
        id,
        name,
      }, (error: string, apiClient: APIClient) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(apiClient);
        }
      });
    });
  }

  public resetAPIClientToken (id: string) {
    return new Promise<APIClient>((resolve, reject) => {
      if (this.socket?.connected !== true) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('reset-api-client-token', {
        id,
      }, (error: string, apiClient: APIClient) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(apiClient);
        }
      });
    });
  }
}

const api = new ConsoleAPI();

export default {
  install (Vue: typeof _Vue) {
    Vue.prototype.$api = api;
  },
};
