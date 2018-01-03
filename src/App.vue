<template>
  <div id="app"
    :class="{
      'flag-collapse': flagCollapse,
    }"
    style="width: 100%; height: 100%; display: flex; flex-flow: column nowrap;"
    @dragover="onDragOver($event)"
    @drop="onDrop($event)">
    <div style="height: 32px;">
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap;">
        <div style="width: 64px; background-color: rgb(39, 42, 45);">
          <button @click="flagCollapse = !flagCollapse">{{flagCollapse}}</button>
        </div>
        <div ref="headerPane" class="no-scrollbar-holizontal" style="margin-right: 17px; flex: 1; overflow: scroll; background-color: blue;"
            @scroll="onScroll_headerPane($event)">
          <div :style="{
              'display': 'flex',
              'flex-flow': 'row nowrap',
              'width': '2000px',
              'height': '32px',
              'background-color': 'rgb(42, 45, 49)',
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
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap; background-color: rgb(33, 35, 38);">
        <div style="position: relative; margin-bottom: 17px; width: 64px; background-color: green;">
          <div ref="pitchesPane" class="no-scrollbar" style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0;"
            @scroll="onScroll_pitchesPane($event)">
            <div
              :style="{
                'width': '100%',
                'height': (pitches.length * pitchHeight) + 'px',
                'background-color': 'rgb(240, 242, 243)',
                }">
              <template v-for="pitch in pitches">
                <div :style="{
                  'height': pitchHeight + 'px',
                  }"
                  :class="{
                    'piano-key': true,
                    'scale-tone': (
                      [0, 2, 4, 5, 7, 9, 11].includes(pitch % 12)
                      ),
                    'non-scale-tone': !(
                      [0, 2, 4, 5, 7, 9, 11].includes(pitch % 12)
                      ),
                  }">
                </div>
              </template>
            </div>
          </div>
          <div style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0; box-shadow: inset 0px 0px 0px 1px rgb(24, 24, 24); pointer-events: none;"></div>
        </div>
        <div ref="notesPane"
             style="flex: 1; overflow: scroll; background-color: rgb(50, 53, 56);"
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
                        'pianoroll-key': true,
                        'scale-tone': int.scale && int.scale.includes(pitch % 12),
                        'non-scale-tone': int.scale && !int.scale.includes(pitch % 12),
                        }" :style="{
                        'width': '100%',
                        'height': pitchHeight + 'px',
                        }">
                        <div :class="{
                          'pianoroll-key-inner': true,
                          }" :style="{
                          'position': 'relative',
                          'width': '100%',
                          'height': '100%',
                          }">
                          <template v-for="note in chd.notes">
                            <note v-if="note.pitch === pitch" :note="note" />
                          </template>
                        </div>
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
import * as MIDIFile from 'midifile';
import * as MIDIEvents from 'midievents';

const global = {
  barWidth: 128,
};

export default {
  name: 'app',
  data() {
    return {
      global: global,
      flagCollapse: false,
      msg: 'Welcome to Your Vue.js App',
      pitchMax: 127,
      pitchMin: 0,
      pitchHeight: 16,
      granularity: 240, // 1 quarter note = 480 ticks (de-facto standard in MIDI)
      scaleIntervals: [
        {
          duration: 1920 * 4, // 4 bars
          scale: [9, 11, 0, 2, 4, 5, 7], // A minor
          chordIntervals: (() => {
            let arr = [];
            for (let i = 0 ; i < 2 ; i++) {
              arr = arr.concat(
                [
                  {
                    localOffset: 0,
                    duration: 960,
                    notes: [
                      {
                        localOffset: 0,
                        duration: 240,
                        pitch: 12 + (9 + 1*12),
                      },
                      {
                        localOffset: 240,
                        duration: 240,
                        pitch: 12 + (4 + 2*12),
                      },
                      {
                        localOffset: 480,
                        duration: 480,
                        pitch: 12 + (7 + 2*12),
                      },
                    ],
                  },
                  {
                    localOffset: 960,
                    duration: 960,
                    notes: [
                      {
                        localOffset: 0,
                        duration: 240,
                        pitch: 12 + (5 + 1*12),
                      },
                      {
                        localOffset: 240,
                        duration: 240,
                        pitch: 12 + (0 + 2*12),
                      },
                      {
                        localOffset: 240,
                        duration: 240,
                        pitch: 12 + (1 + 2*12),
                      },
                      {
                        localOffset: 480,
                        duration: 480,
                        pitch: 12 + (4 + 2*12),
                      },
                    ],
                  },
                  {
                    localOffset: 960 * 2,
                    duration: 960,
                    notes: [
                      {
                        localOffset: 0,
                        duration: 240,
                        pitch: 12 + (7 + 1*12),
                      },
                      {
                        localOffset: 240,
                        duration: 240,
                        pitch: 12 + (2 + 2*12),
                      },
                      {
                        localOffset: 480,
                        duration: 480,
                        pitch: 12 + (5 + 2*12),
                      },
                    ],
                  },
                  {
                    localOffset: 960 * 3,
                    duration: 960,
                    notes: [
                      {
                        localOffset: 0,
                        duration: 240,
                        pitch: 12 + (0 + 2*12),
                      },
                      {
                        localOffset: 240,
                        duration: 240,
                        pitch: 12 + (7 + 2*12),
                      },
                      {
                        localOffset: 480,
                        duration: 480,
                        pitch: 12 + (11 + 2*12),
                      },
                    ],
                  },
                ]
              );
            }
            return arr;
          })(),
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
    onDragOver($event) {
      $event.stopPropagation();
      $event.preventDefault(); // default dragover event handler must be canceled to enable drop event
    },
    onDrop($event) {
      $event.stopPropagation();
      $event.preventDefault();

      const files = $event.dataTransfer.files;
      if (!files) {
        alert('Please drop a file.');
        return;
      }
      if (files.length !== 1) {
        alert('Please specify a single file.');
        return;
      }

      {
        const file = files[0];
        alert(`${file.name} (${file.type}) - ${file.size} bytes (${file.lastModifiedDate.toLocaleDateString()})`);

        const reader = new FileReader();
        reader.onloadstart = (event) => {
          console.log(event);
        };
        reader.onprogress = (event) => {
          console.log(event);
        };
        reader.onloadend = (event) => {
          console.log(event);
        };
        reader.onload = (event) => {
          console.log(event);
          const midiFile = new MIDIFile(reader.result);
          // console.log(midiFile);
          // console.log('getFormat: ' + midiFile.header.getFormat());
          // console.log('getSMPTEFrames: ' + midiFile.header.getSMPTEFrames());
          // console.log('getTickResolution: ' + midiFile.header.getTickResolution());
          // console.log('getTicksPerBeat: ' + midiFile.header.getTicksPerBeat());
          // console.log('getTicksPerFrame: ' + midiFile.header.getTicksPerFrame());
          // console.log('getTimeDivision: ' + midiFile.header.getTimeDivision());
          // console.log('getTracksCount: ' + midiFile.header.getTracksCount());
          switch (midiFile.header.getFormat()) {
            case 0:
              //console.log(midiFile.getMidiEvents());
              const trackEventsChunk = midiFile.tracks[0].getTrackContent();
              const midiEventIterator = MIDIEvents.createParser(trackEventsChunk); // 3rd argument enables strict mode

              // Clear the current scale intervals only if the runtime reach here
              this.scaleIntervals.length = 0;

              const midiNotes = [];
              // Temporary variables
              const noteStates = (new Array(16)).fill(new Array(128));
              for (let i = 0 ; i < noteStates.length ; i++) {
                for (let j = 0 ; j < noteStates[i].length ; j++) {
                  noteStates[i][j] = { isOn: false, onTime: null };
                }
              }
              // console.log(noteStates);
              let midiEvent;
              let tick = 0;
              while (midiEvent = midiEventIterator.next()) {
                // console.log(midiEvent);
                tick += midiEvent.delta;
                // console.log(`tick = ${tick}`);

                // Only accept specific MIDI events (Note Off and Note On)
                switch (midiEvent.type) {
                  case MIDIEvents.EVENT_MIDI:
                    switch (midiEvent.subtype) {
                      case MIDIEvents.EVENT_MIDI_NOTE_OFF: {
                        if (midiEvent.channel === 9) {
                          // console.info(`The note (Tick = ${tick}, Pitch = ${midiEvent.param1}) is in the drum channel. Ignored.`);
                          break;
                        }

                        const ns = noteStates[midiEvent.channel][midiEvent.param1];
                        if (ns.isOn === true) {
                          midiNotes.push(
                            {
                              channel: midiEvent.channel,
                              localOffset: ns.onTime,
                              duration: tick - ns.onTime,
                              pitch: midiEvent.param1,
                            },
                          );
                          ns.isOn = false;
                          ns.onTime = null;
                          // console.log(`The note (Channel = ${midiEvent.channel}, Pitch = ${midiEvent.param1}) was just set to OFF!`);
                        } else {
                          // console.warn(`The note (Channel = ${midiEvent.channel}, Pitch = ${midiEvent.param1}) is already OFF. Ignored.`);
                        }
                        break;
                      }
                      case MIDIEvents.EVENT_MIDI_NOTE_ON: {
                        if (midiEvent.channel === 9) {
                          // console.info(`The note (Tick = ${tick}, Pitch = ${midiEvent.param1}) is in the drum channel. Ignored.`);
                          break;
                        }

                        const ns = noteStates[midiEvent.channel][midiEvent.param1];
                        if (ns.isOn === false) {
                          ns.isOn = true;
                          ns.onTime = tick;
                          // console.log(`The note (Channel = ${midiEvent.channel}, Pitch = ${midiEvent.param1}) was just set to ON!`);
                        } else {
                          if (ns.onTime === tick) {
                            // console.warn(`Duplicate Note On detected (Tick = ${tick}, Channel = ${midiEvent.channel}, Pitch = ${midiEvent.param1}). Ignored.`);
                          } else {
                            midiNotes.push(
                              {
                                channel: midiEvent.channel,
                                localOffset: ns.onTime,
                                duration: tick - ns.onTime,
                                pitch: midiEvent.param1,
                              },
                            );
                            ns.onTime = tick;
                            // console.warn(`The note (Channel = ${midiEvent.channel}, Pitch = ${midiEvent.param1}) is already ON. Treated as OFF+ON.`);
                          }
                        }
                        break;
                      }
                      default:
                    }
                    break;
                  default:
                }
              }
              this.scaleIntervals.push(
                {
                  duration: tick,
                  scale: [9, 11, 0, 2, 4, 5, 7],
                  chordIntervals: [
                    {
                      localOffset: 0,
                      duration: tick,
                      notes: midiNotes,
                    },
                  ],
                }
              );
              // console.log(this.scaleIntervals);
              break;
            case 1:
              alert('Format 1 is not supported!');
              break;
            case 2:
              alert('Format 2 is not supported!');
              return;
            default:
          }
        };
        reader.onabort = (event) => {
          console.log(event);
        };
        reader.onerror = (event) => {
          console.log(event);
        };
        reader.readAsArrayBuffer(file);
      }
    },
    onScroll_headerPane($event) {
      $event.target.scrollLeftAtLatestScrollEvent = $event.target.scrollLeft; // Deal with delay of subsequent scroll event
      if (!this.$refs.notesPane.scrollLeftAtLatestScrollEvent
          ||
          this.$refs.notesPane.scrollLeftAtLatestScrollEvent !== $event.target.scrollLeft) {
        this.$refs.notesPane.scrollLeft = $event.target.scrollLeft;
      }
    },
    onScroll_pitchesPane($event) {
      $event.target.scrollTopAtLatestScrollEvent = $event.target.scrollTop; // Deal with delay of subsequent scroll event
      if (this.$refs.notesPane.scrollTopAtLatestScrollEvent == null
          ||
          this.$refs.notesPane.scrollTopAtLatestScrollEvent !== $event.target.scrollTop) {
        this.$refs.notesPane.scrollTop = $event.target.scrollTop;
      }
    },
    onScroll_notesPane($event) {
      $event.target.scrollLeftAtLatestScrollEvent = $event.target.scrollLeft; // Deal with delay of subsequent scroll event
      $event.target.scrollTopAtLatestScrollEvent = $event.target.scrollTop;
      if (this.$refs.headerPane.scrollLeftAtLatestScrollEvent == null
          ||
          this.$refs.headerPane.scrollLeftAtLatestScrollEvent !== $event.target.scrollLeft) {
        this.$refs.headerPane.scrollLeft = $event.target.scrollLeft;
      }
      if (this.$refs.pitchesPane.scrollTopAtLatestScrollEvent == null
          ||
          this.$refs.pitchesPane.scrollTopAtLatestScrollEvent !== $event.target.scrollTop) {
        this.$refs.pitchesPane.scrollTop = $event.target.scrollTop;
      }
    },
  },
  components: {
    'note': {
      template: `
        <div class="note"
              :style="{
              'position': 'absolute',
              'box-sizing': 'border-box',
              'border': '1px black solid',
              'left': ((note.localOffset / 1920.0) * global.barWidth) + 'px',
              'padding-left': '4px',
              'width': ((note.duration / 1920.0) * global.barWidth) + 'px',
              'height': '100%',
              'font-size': '10px',
              'overflow': 'hidden',
              'color': 'white',
              'text-align': 'left',
          }">
          <template v-if="true">
            {{['♭III', '♭III♯', 'IV', 'IV♯', 'V', '♭VI', '♭VI♯', '♭VII', '♭VII♯', 'I', 'I♯', 'II'][note.pitch % 12]}}
          </template>
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

.piano-key.scale-tone {
  width: 100%;
  background-color: rgb(240, 242, 243);
}

.piano-key.non-scale-tone {
  width: 41px;
  background-color: rgb(42, 47, 50);
}

.piano-key.non-scale-tone {
  transition: height 0.5s ease-in-out;
}
#app:not(.flag-collapse) .piano-key.non-scale-tone {
}
#app.flag-collapse .piano-key.non-scale-tone {
  height: 0 !important;
}

.pianoroll-key {
  overflow: visible;
}

.pianoroll-key > .pianoroll-key-inner {
  overflow: visible;
}

.pianoroll-key.scale-tone > .pianoroll-key-inner {
  background-color: rgb(42, 45, 49);
}

.pianoroll-key.non-scale-tone > .pianoroll-key-inner {
  background-color: rgb(35, 37, 39);
}

.pianoroll-key.scale-tone .note {
  background-color: rgb(62, 137, 155);
}

.pianoroll-key.non-scale-tone .note {
  background-color: rgb(247, 31, 31);
}

.pianoroll-key.non-scale-tone {
  transition: height 0.5s ease-in-out;
}
#app:not(.flag-collapse) .pianoroll-key.non-scale-tone {
}
#app.flag-collapse .pianoroll-key.non-scale-tone {
  height: 0 !important;
}
.pianoroll-key.non-scale-tone > .pianoroll-key-inner {
  position: relative;
  transition: top 0.5s ease-in-out, height 0.5s ease-in-out;
}
#app:not(.flag-collapse) .pianoroll-key.non-scale-tone > .pianoroll-key-inner {
  top: 0;
}
#app.flag-collapse .pianoroll-key.non-scale-tone > .pianoroll-key-inner {
  top: -2px;
  height: 4px !important;
}
.pianoroll-key.non-scale-tone .note {
  transition: border-radius 0.5s ease-in-out;
}
#app:not(.flag-collapse) .pianoroll-key.non-scale-tone .note {
  border-radius: 0px;
}
#app.flag-collapse .pianoroll-key.non-scale-tone .note {
  border-radius: 16px;
}

.pianoroll-key.scale-tone > .pianoroll-key-inner {
  background-color: rgb(42, 45, 49);
  transition: box-shadow 0.5s ease-in-out;
}
#app:not(.flag-collapse) .pianoroll-key.non-scale-tone +
.pianoroll-key.scale-tone +
.pianoroll-key.non-scale-tone +
.pianoroll-key.scale-tone +
.pianoroll-key.non-scale-tone +
.pianoroll-key.scale-tone +
.pianoroll-key.scale-tone > .pianoroll-key-inner {
  box-shadow: inset 0px 1px 0px rgb(35, 37, 39);
}
#app:not(.flag-collapse) .pianoroll-key.scale-tone +
.pianoroll-key.scale-tone +
.pianoroll-key.non-scale-tone +
.pianoroll-key.scale-tone +
.pianoroll-key.non-scale-tone +
.pianoroll-key.scale-tone +
.pianoroll-key.scale-tone > .pianoroll-key-inner {
  box-shadow: inset 0px 1px 0px rgb(24, 25, 27);
}
#app.flag-collapse 
.pianoroll-key.scale-tone +
.pianoroll-key.scale-tone > .pianoroll-key-inner {
  box-shadow: inset 0px 1px 0px rgb(35, 37, 39);
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
