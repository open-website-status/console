import Firebase from 'firebase/app';
import 'firebase/auth';
import _Vue from 'vue';
import store from '../store';

const config = {
  apiKey: 'AIzaSyBg3iWpAQcNNAcwstqj571w5V3zPnWpZAw',
  authDomain: 'open-website-status-9e70b.firebaseapp.com',
  databaseURL: 'https://open-website-status-9e70b.firebaseio.com',
  projectId: 'open-website-status-9e70b',
  storageBucket: 'open-website-status-9e70b.appspot.com',
  messagingSenderId: '989017010954',
  appId: '1:989017010954:web:781520a1f02d0adefb80f3',
};

export class Auth {
  private readonly firebase: Firebase.app.App;
  private readonly auth: Firebase.auth.Auth;
  private readonly googleProvider = new Firebase.auth.GoogleAuthProvider();
  private readonly githubProvider = new Firebase.auth.GithubAuthProvider();

  public constructor (firebase: Firebase.app.App) {
    this.firebase = firebase;
    this.auth = firebase.auth();

    this.auth.onAuthStateChanged((user) => {
      store.commit('setUser', user);
    });
  }

  public signInWithGooglePopup () {
    return this.auth.signInWithPopup(this.googleProvider);
  }

  public signInWithGitHubPopup () {
    return this.auth.signInWithPopup(this.githubProvider);
  }

  public signOut () {
    return this.auth.signOut();
  }

  public getIdToken () {
    if (this.auth.currentUser === null) throw new Error('User not signed in');
    return this.auth.currentUser.getIdToken(true);
  }

  public fetchSignInMethodsForEmail (email: string) {
    return this.auth.fetchSignInMethodsForEmail(email);
  };

  public async linkWithCredential (credential: Firebase.auth.AuthCredential) {
    if (this.auth.currentUser === null) throw new Error('User not signed in');
    const newCredential = await this.auth.currentUser.linkWithCredential(credential);
    store.commit('setUser', this.auth.currentUser);
    return newCredential;
  }

  public async linkGoogle () {
    if (this.auth.currentUser === null) throw new Error('User not signed in');
    const credential = await this.auth.currentUser.linkWithPopup(this.googleProvider);
    store.commit('setUser', this.auth.currentUser);
    return credential;
  }

  public async linkGithub () {
    if (this.auth.currentUser === null) throw new Error('User not signed in');
    const credential = await this.auth.currentUser.linkWithPopup(this.githubProvider);
    store.commit('setUser', this.auth.currentUser);
    return credential;
  }

  public async unlink (providerId: string) {
    if (this.auth.currentUser === null) throw new Error('User not signed in');
    await this.auth.currentUser.unlink(providerId);
    store.commit('setUser', this.auth.currentUser);
  }
}

export default {
  install (Vue: typeof _Vue) {
    const firebase = Firebase.initializeApp(config);
    Vue.prototype.$auth = new Auth(firebase);
  },
};
