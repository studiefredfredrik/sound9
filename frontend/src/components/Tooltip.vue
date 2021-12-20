<template>
  <div class="tooltip">
    <slot></slot>
    <span class="tooltiptext">{{tip}}</span>
  </div>
</template>

<script>
  export default {
    name: "Tooltip",
    props: ['tip']
  }
</script>

<style scoped>
  .tooltip {
    position: relative;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    background-color: black;
    color: #fff;
    text-align: center;
    padding: 5px;
    margin: 5px;

    /* Position the tooltip */
    position: absolute;
    z-index: 1;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }
</style>
