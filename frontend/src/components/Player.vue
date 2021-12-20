<template>
  <div>
    <audio controls ref="audioelement" class="player" preload="none" crossorigin="anonymous"></audio>

    <div class="new-player">

      <div class="progress-slider tab">
        <input type="range" ref="progress" min="0" max="100" step="0.01" >
      </div>
      <div class="volumes-slider tab">
        <input type="range" ref="volumeslider" min="0" max="100" step="0.01" >
      </div>
      <div class=" play-button tab">
        <i v-if="!playing" @click="unpause()"  class="fas fa-play pointer padded"
           :class="{ disabled: !playerReady}">
        </i>
        <i v-if="playing" @click="pause()"  class="fas fa-pause pointer padded"></i>
      </div>

    </div>
  </div>
</template>

<script>
  import store from '@/data/store'
  export default {
    name: "Player",
    props:{
      file: Object
    },
    data: function () {
      return {
        playerReady: false,
        seekInProgress: Date.now()
      }
    },
    computed: {
      currentFile () {
        return store.state.currentFile
      },
      playing(){
        return store.state.player.playing
      },
    },
    watch: {

    },
    mounted: function () {
      store.state.player.audioelement = this.$refs.audioelement
      this.$refs.audioelement.crossOrigin = 'anonymous'

      if(localStorage.getItem('player_volume')){
        // Facebook cant do this
        this.$refs.audioelement.volume = parseFloat(localStorage.getItem('player_volume'))
      }

      this.$refs.audioelement.onended = () => {
        this.playNext()
      }

      this.$refs.audioelement.onvolumechange = () => {
        localStorage.setItem('player_volume', this.$refs.audioelement.volume);
      }

      this.$refs.audioelement.onpause = () => {
        store.state.player.playing = false
      }
      this.$refs.audioelement.onplay = () => {
        store.state.player.playing = true
      }
      this.$refs.volumeslider.oninput = () => {
        this.$refs.audioelement.volume = this.$refs.volumeslider.value / 100
      }
      this.$refs.progress.onchange = () => {
        if(!this.$refs.audioelement) return
        this.$refs.audioelement.currentTime = (this.$refs.progress.value / 100) * this.$refs.audioelement.duration
      }

      this.$refs.progress.oninput = () => {
        this.seekInProgress = Date.now()
      }

      this.$refs.audioelement.addEventListener('timeupdate', ()=>{
        if(Date.now() - this.seekInProgress < 1000) return
        if(!this.$refs.audioelement) return
        this.$refs.progress.value = (this.$refs.audioelement.currentTime / this.$refs.audioelement.duration) * 100
      });

      this.$refs.audioelement.addEventListener('volumechange', ()=>{
        if(!this.$refs.audioelement) return
        this.$refs.volumeslider.value = this.$refs.audioelement.volume * 100
      });

      this.$refs.audioelement.addEventListener('loadeddata', ()=>{
          if(this.$refs.audioelement && this.$refs.audioelement.readyState > 0) this.playerReady =  true
          else this.playerReady =  false
      });

      this.setupMediaState()
      this.$bus.$on('request_playFile', (payload) => {
        this.play(payload.file, payload.paused)
      });
    },
    methods:{
      play(file, paused = false){
        if(!this.$refs.audioelement) {
          console.log('Error in fetching audioelement')
          location.reload() // This is a bug that i haven't found a good fix for :/
          return
        }

        store.state.currentFile = {
          url: file.url,
          index: store.state.files.findIndex(x => x.url === file.url)
        }
        localStorage.setItem('last_played', JSON.stringify(store.state.currentFile));

        if(store.state.visualizer.context){ // Audio context has to be created by user action on mobile
          store.state.visualizer.context.resume()
        }

        this.$refs.audioelement.src = file.url //encodeURI(file.url)
        this.$refs.audioelement.load()
        console.log('play', file.url)

        this.setMediaStateTitle(file.url, file.artist, file.title)

        if(!paused && this.playerReady) {
          this.$refs.audioelement.play()
          store.state.player.playing = true
        }
      },
      shufflePlay(){
        let min = 0
        let max = store.state.files.length
        let random = Math.floor((Math.random() * max) + min)
        this.play(store.state.files[random])
      },
      playNext(){
        if(store.state.shufflePlay) {
          this.shufflePlay()
          return
        }
        let currentIndex = store.state.files.findIndex(x => x.url === store.state.currentFile.url)
        if(currentIndex+1 >= store.state.files.length) return
        this.play(store.state.files[currentIndex+1])
        this.$emit('play-file', store.state.files[currentIndex+1]);
      },
      playPrevious(){
        let currentIndex = store.state.files.findIndex(x => x.url === store.state.currentFile.url)
        if(currentIndex < 1) return
        this.play(store.state.files[currentIndex-1])
        this.$emit('play-file', store.state.files[currentIndex-1]);
      },
      pause(){
        this.$refs.audioelement.pause()
      },
      unpause(){
        if(!this.playerReady) return
        this.$refs.audioelement.play()
      },
      setupMediaState(){
        if ('mediaSession' in navigator) {
          // This provides the next / previous buttons when playing in the background on android
          navigator.mediaSession.setActionHandler('play', this.unpause);
          navigator.mediaSession.setActionHandler('pause', this.pause);
          navigator.mediaSession.setActionHandler('previoustrack', this.playPrevious);
          navigator.mediaSession.setActionHandler('nexttrack', this.playNext);
        }
      },
      setMediaStateTitle(url, artist, title){
        let displayTitle = 'sound9'
        if(artist && title) displayTitle = `${artist} - ${title}`
        else if (url) displayTitle = url.split('/').slice(-1)[0]

        if ('mediaSession' in navigator) {
          // There are more options available here, like artwork, artist etc. But title will do for now
          // https://developer.mozilla.org/en-US/docs/Web/API/MediaSession
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: displayTitle
          });
        }
      }
    }
  }
</script>

<style scoped>
  .download-link{
    color: rgba(0,0,0,.87);
  }


  .player{
    width: 100%;
    display: none;
  }
  .new-player{
    width: 100%;
    text-decoration: none;
    padding: 10px 0;
    height: 30px;
    color: rgba(0,0,0,.87);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-color: rgb(241, 243, 244);
    box-shadow: 0 -2px 2px -1px rgba(0,0,0,0.4);
  }
  .progress-slider{
    width: 70%;
  }
  .volume-slider{
    width: 20%;
  }
  .play-button{
    width: 10%;
  }
  .active{
    font-weight: bold;
  }
  .tab{
    align-content: flex-end;
    text-align: center;
    padding: 3px 3px;
  }
  .pointer{
    cursor: pointer
  }
  .disabled{
    color: grey;
    cursor: default;
  }
  /*unholy*/
  input[type=range] {
    -webkit-appearance: none;
    margin: 18px 0;
    width: 100%;
    background: transparent;
  }
  input[type=range]:focus {
    outline: none;
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    animate: 0.2s;
    /*box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;*/
    background: #767676;
    border-radius: 3px;
    /*border: 0.2px solid #010101;*/
  }
  input[type=range]::-webkit-slider-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 12px;
    width: 12px;
    border-radius: 100%;
    background: #232323;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -5px;

  }
  input[type=range]:hover::-webkit-slider-runnable-track {
    background: #367ebd;
    transition: all 2s ease;
  }
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    background: #3071a9;
    border-radius: 1.3px;
    border: 0.2px solid #010101;
  }
  input[type=range]::-moz-range-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
  }
  input[type=range]::-ms-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    border-width: 16px 0;
    color: transparent;
    padding: 5px 0px;
  }
  input[type=range]::-ms-fill-lower {
    background: #2a6495;
    border: 0.2px solid #010101;
    border-radius: 2.6px;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  }
  input[type=range]::-ms-fill-upper {
    background: #3071a9;
    border: 0.2px solid #010101;
    border-radius: 2.6px;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  }
  input[type=range]::-ms-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
  }
  input[type=range]:focus::-ms-fill-lower {
    background: #3071a9;
  }
  input[type=range]:focus::-ms-fill-upper {
    background: #367ebd;
  }
  .padded{
    padding: 7px;
  }

</style>
