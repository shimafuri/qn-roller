<template>
  <div id="app">
    <button @click="collapse = !collapse">{{collapse}}</button>
    <template v-for="v in arr">
      <div :style="{
        'width': '320px',
        'height': (((v % 2 === 1) && collapse) ? '0px' : '16px'),
        'background-color': ((v % 2 === 0) ? 'blue' : 'red'),
        'transition': 'height 3s ease-in-out',
      }">
        {{v}}
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      collapse: false,
      arr: (() => {
        const arr = [];
        for (let i = 0 ; i < 10000 ; i++) {
          arr.push(i);
        }
        return arr;
      })(),
    };
  },
};
</script>

<style>
</style>
