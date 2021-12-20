<template>
  <div class="tabs-container">
    <div v-for="tab in tabs" @click="tabChanged(tab)" class="tab" :class="{ active: tab === currentTab }">
      <span class="tab-name">{{ tab }}</span>
    </div>
    <div v-if="!tabs || tabs.length < 1" class="tab active">
      <span class="tab-name">0</span>
    </div>
    <div v-if="totalTabCount > 5" class="total-count" @click="showTabSelector()">
      <span class="total-count-text">{{totalTabCount}}</span>
    </div>
    <div v-if="selectorVisible" class="tab-selector-box">
      <input type="number" v-model="tabInput" class="tab-selector-input">
      <button @click="goToTab(tabInput)" class="go-button">GO</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "TabContainer",
    props:{
      tabs: Array,
      currentTab: Number,
      totalTabCount: Number
    },
    data: function(){
      return {
        selectorVisible: false,
        tabInput: 0
      }
    },
    methods: {
      tabChanged(tab){
        this.$emit('tab-changed', tab);
      },
      showTabSelector(){
        this.tabInput = this.currentTab
        this.selectorVisible = !this.selectorVisible
      },
      goToTab(input){
        if(isNaN(input)) return
        input = parseInt(input.toString().replace(',','').replace('.','')) // 2019 style yo
        this.$emit('tab-changed', input);
        this.selectorVisible = false
      }
    }
  }
</script>

<style scoped>
  .max{
    width: 100%;
  }
  .tabs-container{
    background-color: #f1f3f4;
    width: 100%;
    text-decoration: none;
    padding: 0;
    height: 30px;
    color: rgba(0,0,0,.87);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-color: rgb(241, 243, 244);
  }
  .active{
    font-weight: bold;

  }
  .tab{
    width: 30%;
    align-content: flex-end;
    text-align: center;
    cursor:pointer;
    padding: 3px 3px;
  }
  .tab-name{

  }

  .tab:hover {
    cursor:pointer;
    border-bottom: 2px solid #696969;
  }

  .total-count{
    font-size: 11px;
    transform: rotate(-90deg);
    font-weight: bold;
    cursor: pointer;
  }
  .total-count-text{

  }

  .tab-selector-box{
    display: inline-flex;
  }

  .tab-selector-input{
    outline: none;
    border: none;
    padding: 2px 0px;
    text-align: right;
    width: 50px;
    border-radius: 10%;
  }

  .go-button{
    cursor: pointer;
    outline: none;
    border: none;
    background-color: #f1f3f4;
  }


</style>
