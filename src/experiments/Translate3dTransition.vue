<template>
  <div id="app" style="position: relative;"
       :style="{
         'height': (arr.length * 16) + 'px',
       }">
    <button style="position: absolute; left: 400px;" @click="collapse = !collapse">{{collapse}}</button>
    <template v-for="v in arr">
      <div :style="{
        'position': 'absolute',
        'top': '0px',
        'width': '320px',
        'height': '16px',
        'background-color': ((v % 2 === 0) ? 'blue' : 'red'),
        'transition': 'transform 0.5s ease-in-out',
        'transform': `translate3d(0, ${(collapse ? Math.floor((v+1) / 2) * 16 : v * 16)}px, 0) scaleY(${(((v % 2 === 1) && collapse) ? '0' : '1')})`,
        'transform-origin': `top left`,
      }">
        {{v}}
      </div>
    </template>
    <!-- translate is fast but translateZ(0) is even faster. 
         translate makes no composite layer but translateZ(0) makes a composite layer.
         will-change: transform; also makes a composite layer but will-change needs few microseconds. No need to use it.  -->
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
        for (let i = 0 ; i < 4000 ; i++) {
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
