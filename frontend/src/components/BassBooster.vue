<template>
  <div class="bass-boos-container" :class="boosting ? 'boost-on' : 'boost-off'" @click="toggleBoost" >
    <div class="content-holder">
      <div class="top-text">
        <span>Bass boost</span>
        <span class="state-holder">
          <span v-if="boosting" class="state-on">On</span>
          <span v-if="!boosting" class="state-off">Off</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/data/store'

export default {
name: "BassBooster",
  data: function (){
    return{
      boosting: false,
    }
  },
  methods: {
    toggleBoost(){
      this.boosting = !this.boosting
      if(!store.state.equalizer.low) return;
      if(this.boosting){
        store.state.equalizer.low.gain.value = 10
        store.state.equalizer.mid.gain.value = 1
        store.state.equalizer.high.gain.value = 1
      } else {
        store.state.equalizer.low.gain.value = 1
        store.state.equalizer.mid.gain.value = 1
        store.state.equalizer.high.gain.value = 1
      }
    },
  }
}
</script>

<style scoped>
.bass-boos-container{
  padding: 2px 10px;
  width: 90px;
  border-radius: 3px;
  border: 1px solid #696969;
  background-color: #f1f3f4;
  position: absolute;
  bottom: 125px;
  right: -65px;
  z-index: 1500;
  cursor: pointer;
  transform: rotate(-90deg);
}
.bass-boos-container.boost-on {
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
  .bass-boos-container{
    right: -55px;
    padding: 5px 12px;
  }
}
</style>
