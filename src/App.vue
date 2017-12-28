<template>
  <div id="app" style="width: 100%; height: 100%; display: flex; flex-flow: column nowrap;">
    <div style="height: 32px;">
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap;">
        <div style="width: 64px; background-color: red;">
        </div>
        <div ref="headerPane" class="no-scrollbar-holizontal" style="margin-right: 17px; flex: 1; overflow: scroll; background-color: blue;"
            @scroll="onScroll_headerPane($event)">
          <div :style="{
              'display': 'flex',
              'flex-flow': 'row nowrap',
              'width': '2000px',
              'height': '32px',
              }">
            <template v-for="int in scaleIntervals">
              <div :style="{
                'visibility': (int.scale != null ? 'visible' : 'hidden'),
                'box-sizing': 'border-box',
                'width': ((int.duration / 1920.0) * global.barWidth) + 'px',
                'height': '16px',
                'background-color': 'white',
                'box-shadow': 'inset 0 0 2px black',
                'text-align': 'left',
                'font-size': '10px',
                }">
                {{JSON.stringify(int.scale)}}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div style="flex: 1; height: 0;">
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap; background-color: orange;">
        <div ref="pitchesPane" class="no-scrollbar" style="margin-bottom: 17px; width: 64px; background-color: green;"
             @scroll="onScroll_pitchesPane($event)">
          <div
             :style="{
              'width': '100%',
              'height': (pitches.length * pitchHeight) + 'px',
              }">
            <template v-for="pitch in pitches">
              <div :style="{
                'width': '100%',
                'height': pitchHeight + 'px',
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
              </div>
            </template>
          </div>
        </div>
        <div ref="notesPane"
             style="flex: 1; overflow: scroll; background-color: white;"
             @scroll="onScroll_notesPane($event)">
          <div :style="{
              'display': 'flex',
              'flex-flow': 'row nowrap',
              'position': 'relative',
              'width': '2000px',
              'height': (pitches.length * pitchHeight) + 'px',
              }">
            <template v-for="int in scaleIntervals">
              <div :style="{
                'display': 'flex',
                'flex-flow': 'row nowrap',
                'box-sizing': 'border-box',
                'width': ((int.duration / 1920.0) * global.barWidth) + 'px',
                'height': '100%',
                'box-shadow': 'inset 0 0 2px black',
                }">
                <template v-for="chd in int.chordIntervals">
                  <div :style="{
                    'display': 'flex',
                    'flex-flow': 'column nowrap',
                    'width': ((chd.duration / 1920.0) * global.barWidth) + 'px',
                    'height': '100%',
                    'box-shadow': 'inset 0 0 2px red',
                    }">
                    <template v-for="pitch in pitches">
                      <div :class="{
                        'scale-tone': int.scale && int.scale.includes(pitch % 12),
                        'non-scale-tone': int.scale && !int.scale.includes(pitch % 12),
                        }" :style="{
                        'width': '100%',
                        'height': pitchHeight + 'px',
                        }">
                      <template v-for="note in chd.notes">
                        <note v-if="note.pitch === pitch" :note="note" />
                      </template>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </template>
            <!--<template v-for="note in notes">
              <div :style="{
                'position': 'absolute',
                'left': '40px',
                'bottom': ((note.pitch - pitchMin) * pitchHeight) + 'px',
                'width': '20px',
                'height': pitchHeight + 'px',
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
const global = {
  barWidth: 128,
};

export default {
  name: 'app',
  data() {
    return {
      global: global,
      msg: 'Welcome to Your Vue.js App',
      pitchMax: 127,
      pitchMin: 0,
      pitchHeight: 6,
      granularity: 240, // 1 quarter note = 480 ticks (de-facto standard in MIDI)
      scaleIntervals: [
        {
          duration: 1920 * 4, // 4 bars
          scale: [9, 11, 0, 2, 4, 5, 7], // A minor
          chordIntervals: [
            {
              localOffset: 0,
              duration: 1920,
              notes: [
                {
                  localOffset: 0,
                  pitch: 12 + (4 + 4*12), // E4
                },
              ],
            },
            {
              localOffset: 1920,
              duration: 1920,
              notes: [
                {
                  localOffset: 0,
                  pitch: 12 + (2 + 4*12), // D4
                },
              ],
            },
            {
              localOffset: 1920 * 2,
              duration: 1920,
              notes: [
                {
                  localOffset: 0,
                  pitch: 12 + (2 + 4*12), // D4
                },
              ],
            },
            {
              localOffset: 1920 * 3,
              duration: 1920,
              notes: [
                {
                  localOffset: 0,
                  pitch: 12 + (0 + 4*12), // C4
                },
              ],
            },
          ],
        },
        {
          duration: 1920 * 7.5,
          scale: null,
          chordIntervals: [
            {
              localOffset: 0,
              notes: [],
            },
          ],
        },
        {
          duration: 1920 * 4,
          scale: [9, 11, 0, 2, 4, 5, 7], // A minor
          chordIntervals: [],
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
    onScroll_headerPane($event) {
      this.sentFrom_headerPane = true;
      if (this.sentFrom_notesPane) { // Prevent mutual dependency
        this.sentFrom_notesPane = false;
      } else {
        this.$refs.notesPane.scrollLeft = $event.target.scrollLeft;
      }
    },
    onScroll_pitchesPane($event) {
      this.sentFrom_pitchesPane = true;
      if (this.sentFrom_notesPane) { // Prevent mutual dependency (which causes performance degradation)
        this.sentFrom_notesPane = false;
      } else {
        this.$refs.notesPane.scrollTop = $event.target.scrollTop;
      }
    },
    onScroll_notesPane($event) {
      this.sentFrom_notesPane = true;
      if (this.sentFrom_headerPane) { // Prevent mutual dependency
        this.sentFrom_headerPane = false;
      } else if (this.sentFrom_pitchesPane) { // Prevent mutual dependency
        this.sentFrom_pitchesPane = false;
      } else {
        this.$refs.headerPane.scrollLeft = $event.target.scrollLeft;
        this.$refs.pitchesPane.scrollTop = $event.target.scrollTop;
      }
    },
  },
  components: {
    'note': {
      template: `
        <div
              :style="{
              'box-sizing': 'border-box',
              'width': ((note.duration / 1920.0) * global.barWidth) + 'px',
              'height': '100%',
              'background-color': 'blue',
          }">
        </div>
      `,
      data() {
        return {
          global: global,
        };
      },
      props: ['note'],
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
  display: none;
}

.no-scrollbar-holizontal {
  overflow-x: auto;
}

.no-scrollbar-holizontal::-webkit-scrollbar {
  display: none;
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
