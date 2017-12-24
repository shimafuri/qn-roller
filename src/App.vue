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
    <div style="flex: 1; height: 0;">
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap;">
        <div class="no-scrollbar" ref="pitchesPane" style="width: 64px; background-color: green;"
             @scroll="onScroll_pitchesPane($event)">
          <div
             :style="{
              'width': '100%',
              'height': (pitches.length * 20) + 'px',
              }">
            <template v-for="pitch in pitches">
              <div :style="{
                'width': '100%',
                'height': '20px',
                'background-color': (
                  [0, 2, 4, 5, 7, 9, 11].includes(((pitch % 12)+12)%12)
                  ?
                  'white'
                  :
                  'gray'
                  ),
                }"
                :class="{
                  'non-scale-tone': !(
                    [0, 2, 4, 5, 7, 9, 11].includes(((pitch % 12)+12)%12)
                    ),
                }">
                {{pitch}}
              </div>
            </template>
          </div>
        </div>
        <div ref="notesPane"
             style="flex: 1; overflow: scroll;"
             @scroll="onScroll_notesPane($event)">
          <div :style="{
              'position': 'relative',
              'width': '2000px',
              'height': (pitches.length * 20) + 'px',
              }">
            <!--<template v-for="note in notes">
              <div :style="{
                'position': 'absolute',
                'left': '40px',
                'bottom': ((note.pitch - pitchMin) * 20) + 'px',
                'width': '20px',
                'height': '20px',
                'background-color': 'red',
                }">   
              </div>
            </template>-->
          </div>
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
      pitchMax: 9 * 12 - 1,
      pitchMin: (-2) * 12,
      notes: [
        {
          startAt: 1920,
          duration: 1920,
          pitch: 48,
        },
      ],
    };
  },
  computed: {
    pitches() {
      const pitches = [];
      for (let i = this.pitchMin ; i <= this.pitchMax ; i++) {
        pitches.unshift(i);
      }
      return pitches;
    }
  },
  methods: {
    onScroll_pitchesPane($event) {
      this.sentFrom_pitchesPane = true;
      if (this.sentFrom_notesPane) { // Prevent mutual dependency (which causes performance degradation)
        this.sentFrom_notesPane = false;
      } else {
        this.$refs.notesPane.scrollTop = $event.target.scrollTop
      }
    },
    onScroll_notesPane($event) {
      this.sentFrom_notesPane = true;
      if (this.sentFrom_pitchesPane) { // Prevent mutual dependency
        this.sentFrom_pitchesPane = false;
      } else {
        this.$refs.pitchesPane.scrollTop = $event.target.scrollTop
      }
    },
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

.no-scrollbar {
  overflow-y: auto;
}

.no-scrollbar::-webkit-scrollbar {
  display:none;
}

.non-scale-tone {
  transition: height 0.5s ease-in-out;
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
