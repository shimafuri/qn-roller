<template>
  <div id="app" style="width: 100%; height: 100%; display: flex; flex-flow: column nowrap;">
    <div style="height: 32px;">
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap;">
        <div style="width: 64px; background-color: red;">
        </div>
        <div style="flex: 1; background-color: blue;">
        </div>
      </div>
    </div>
    <div style="flex: 1;">
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap;">
        <div style="width: 64px; background-color: green;">
        </div>
        <div style="flex: 1;">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
    };
  },
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
