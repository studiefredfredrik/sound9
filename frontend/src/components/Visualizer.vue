<template>
  <div id="vcontainer" @click="click()">
    <canvas id="canvas" ref="vcanvas"></canvas>
  </div>
</template>

<script>
  import store from '@/data/store'
  export default {
    name: "Visualizer",
    data() {
      return {
        camera: null,
        scene: null,
        renderer: null,
        dataArray: null,
        line: null,
        fftSize: 256,
        canvasCtx: null,
        barWidth: null,
        barHeight: null,
        bufferLength: null,
        canvasWidth: 0,
        canvasHeight: 0,
        animator: 1
      }
    },
    computed: {
      player(){
        return store.state.player.audioelement
      },
      playing(){
        return store.state.player.playing
      }
    },
    methods: {
      reconnectToPlayer(){
        if(!this.player) return

        if(this.canvasWidth < 1000) this.fftSize = 64
        else this.fftSize = 128

        let state = store.state.visualizer
        if(!state.context)
        {
          // Create audio source from AUDIO element
          state.context = new AudioContext()
          state.src = state.context.createMediaElementSource(this.player)

          // Connect every audio plugin to each other in series
          let equalizer = store.state.equalizer.createEqualizer(state.context)

          // Create analyser and connect audio source to the analyser in same context
          state.analyser = state.context.createAnalyser()
          state.src.connect(state.analyser)

          // Connect the analyser to the audio context
          state.analyser.connect(equalizer)
        }
        this.analyser = state.analyser
        this.analyser.fftSize = this.fftSize
        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)
      },

      init: function() {
        window.addEventListener( 'resize', this.resize, false )

        let comStyle = window.getComputedStyle(document.getElementById('vcontainer'), null)
        let width = parseInt(comStyle.getPropertyValue("width"), 10)
        let height = parseInt(comStyle.getPropertyValue("height"), 10)

        let canvas = this.$refs.vcanvas
        canvas.width = width
        canvas.height = height
        this.canvasHeight = height
        this.canvasWidth = width
        this.canvasCtx = canvas.getContext('2d')
        this.barWidth = (this.canvasWidth / this.bufferLength) * 2.5
      },
      animateBox(){
        if(!this.analyser) return
        let counter = 0
        let volume = 0.7
        this.analyser.getByteFrequencyData(this.dataArray)
        this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

        for (let i = 0; i < this.bufferLength; i++) {
          this.barHeight = this.dataArray[i] * volume
          // 2e6f77
          let r = 46
          let g = 255 - (this.barHeight * 0.9)
          let b = 119

          this.canvasCtx.fillStyle = "rgb(" + r + "," + g + "," + b + ")"
          this.canvasCtx.fillRect(counter, this.canvasHeight - this.barHeight, this.barWidth, this.barHeight)

          counter += this.barWidth + 1
        }
      },
      generateSine: function(){
        let volume = 50
        let level = 50
        let sampleFreq = 50
        let sineSpeed = 200
        let seed = Date.now() / sineSpeed
        let counter = 0

        function sineWaveAt(sampleNumber) {
          return Math.sin(sampleNumber / (sampleFreq / (Math.PI*2))) * volume + level
        }
        this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        for (let i = 0; i < this.bufferLength; i++) {
          this.barHeight = sineWaveAt(i + seed) + volume

          let r = 46
          let g = 255 - (this.barHeight * 0.9)
          let b = 119

          this.canvasCtx.fillStyle = "rgb(" + r + "," + g + "," + b + ")"
          this.canvasCtx.fillRect(counter, this.canvasHeight - this.barHeight, this.barWidth, this.barHeight)

          counter += this.barWidth + 1
        }
      },
      animate: function() {
        if(this.animator === 0) this.animateBox()
        if(this.animator === 1) this.generateSine()
        requestAnimationFrame(this.animate)
      },
      resize: function(){
        let comStyle = window.getComputedStyle(document.getElementById('vcontainer'), null)
        let width = parseInt(comStyle.getPropertyValue("width"), 10)
        let height = parseInt(comStyle.getPropertyValue("height"), 10)

       let canvas = this.$refs.vcanvas
        canvas.width = width
        this.canvasWidth = width
        this.canvasHeight = height
        this.barWidth = (this.canvasWidth / this.bufferLength)

      },
      click(){
        this.animator++
        if(this.animator > 1) this.animator = 0
      }
    },
    watch: {
      player:{
        handler(newVal)
        {
          if (!newVal) return
          this.reconnectToPlayer()
        }
      },
      playing:{
        handler(newVal)
        {
          if(newVal)this.animator = 0
          else this.animator = 1
        }
      }
    },
    mounted() {
      this.init()
      setTimeout(()=>{this.resize()})
      this.animate()
      this.reconnectToPlayer()
    }
  }
</script>

<style scoped>
  #canvas{
    width: 100%;
    height: 100%;
  }
</style>
