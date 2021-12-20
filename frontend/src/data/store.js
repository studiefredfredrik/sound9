import Vuex from "vuex";
import Vue from "vue";
import * as jwt from "jsonwebtoken"

Vue.use(Vuex)


let getCookieString = function(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export default new Vuex.Store({
  state: {
    playlists: [],
    currentPlaylist: {},
    files: [],
    currentFile: {
      url: '',
      index: 0
    },
    shufflePlay: false,
    player: {
      playing: false,
      audioelement: null
    },
    visualizer: {
      src: null,
      element: null,
      analyser: null,
      context: null,
      player: null
    },
    equalizer: {
      createEqualizer(audioCtx){
        this.low = audioCtx.createBiquadFilter();
        this.low.type = "lowshelf";
        this.low.frequency.value = 320
        this.low.gain.value = 1
        this.low.connect(audioCtx.destination);

        this.mid = audioCtx.createBiquadFilter();
        this.mid.type = "peaking";
        this.mid.frequency.value = 1000
        this.mid.Q.value = 0.5;
        this.mid.gain.value = 1
        this.mid.connect( this.low );

        this.high = audioCtx.createBiquadFilter();
        this.high.type = "highshelf";
        this.high.frequency.value = 3200
        this.high.gain.value = 1
        this.high.connect( this.mid );

        return this.high
      },
    },
    favorites: [],
    library: [],
    user: null
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload
      try {
        let cookieString = getCookieString('authcookie_client')
        state.user = jwt.decode(cookieString)
      } catch (ex) {
        state.user = null
      }
    }
  }
})
