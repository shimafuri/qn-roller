<template>
  <div id="app" style="position: relative;">
    <button style="position: absolute; left: 400px;" @click="collapse = !collapse">{{collapse}}</button>
    <template v-for="v in arr">
      <div :style="{
        'position': 'absolute',
        'top': (collapse ? Math.floor((v+1) / 2) * 16 : v * 16) + 'px',
        'width': '320px',
        'height': (((v % 2 === 1) && collapse) ? '0px' : '16px'),
        'background-color': ((v % 2 === 0) ? 'blue' : 'red'),
        'transition': 'height 3s ease-in-out, top 3s ease-in-out',
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
