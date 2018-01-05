<template>
  <div id="app">
    <template v-for="v in arr">
      <div :style="{
        'width': '320px',
        'height': '16px',
        'background-color': ((v % 2 === 0) ? 'blue' : 'red'),
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
