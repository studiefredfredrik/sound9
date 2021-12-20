<template>
  <div class="shuffle-button-container" :class="shuffleStatus ? 'shuffle-on' : 'shuffle-off'" @click="toggleShuffle" >
    <div class="content-holder">
      <div class="top-text">
        <span>Shuffle</span>
        <span class="state-holder">
          <span v-if="shuffleStatus" class="state-on">On</span>
          <span v-if="!shuffleStatus" class="state-off">Off</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/data/store'

export default {
name: "ShuffleButton",
  data: function (){
    return{
      boosting: false,
    }
  },
  computed: {
    shuffleStatus () {
      return store.state.shufflePlay
    }
  },
  mounted() {
    if (localStorage.getItem('shuffle_status') === 'true') {
      store.state.shufflePlay = true
    }
  },
  methods: {
    toggleShuffle(){
      store.state.shufflePlay = !store.state.shufflePlay
      localStorage.setItem('shuffle_status', store.state.shufflePlay.toString())
    },
  }
}
</script>

<style scoped>
.shuffle-button-container{
  padding: 2px 10px;
  width: 90px;
  border-radius: 3px;
  border: 1px solid #696969;
  background-color: #f1f3f4;
  position: absolute;
  bottom: 240px;
  right: -65px;
  z-index: 1500;
  cursor: pointer;
  transform: rotate(-90deg);
}
.shuffle-button-container.shuffle-on {
  border: 1px solid green;
}
.content-holder{
}
.state-holder{
  margin-left: 5px;
  font-size: 16px;
  /*font-weight: bolder;*/
}
.state-on{
  color: green;
}
.state-off{
  color: red;
}
.top-text{
  font-size: 12px;
  font-style: italic;
}

@media only screen and (max-width: 992px) {
  .shuffle-button-container{
    right: -55px;
    padding: 5px 12px;
  }
}
</style>
