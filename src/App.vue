<template>
  <div id="app"
    :class="{
      'flag-collapse': flagCollapse,
    }"
    style="width: 100%; height: 100%; display: flex; flex-flow: column nowrap;"
    @dragover="onDragOver($event)"
    @drop="onDrop($event)"
    @wheel="onWheel">
    <!-- Top part -->
    <div style="height: 48px;">
      <!-- Left/Right divider -->
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap;">
        <!-- Left side -->
        <div style="width: 64px; background-color: rgb(39, 42, 45);">
          <button @click="flagCollapse = !flagCollapse">{{flagCollapse}}</button>
        </div>
        <!-- Right side (horizontally scrollable) -->
        <div ref="headerPane" class="no-scrollbar-holizontal" style="margin-right: 17px; flex: 1; overflow: scroll; background-color: blue;"
            @scroll="onScroll_headerPane($event)">
          <!-- Content -->
          <div :style="{
              'display': 'flex',
              'flex-flow': 'row nowrap',
              'width': ((totalDuration / 1920.0) * global.barWidth) + 'px',
              'height': '48px',
              'background-color': 'rgb(42, 45, 49)',
              'transform': 'translate3d(0, 0, 0)',
              }">
            <!-- Scale interval indicators -->
            <template v-for="int in scaleIntervals">
              <scale-interval-indicator :scale-interval="int" @new-scale-interval="onNewScaleInterval" />
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- Bottom part -->
    <div style="flex: 1; height: 0;">
      <!-- Left/Right divider -->
      <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap; background-color: rgb(33, 35, 38);">
        <!-- Left side -->
        <div style="position: relative; margin-bottom: 17px; width: 64px; background-color: green;">
          <!-- Content viewport (vertically scrollable) -->
          <div ref="pitchesPane" class="no-scrollbar" style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0;"
            @scroll="onScroll_pitchesPane($event)">
            <!-- Content -->
            <div
              :style="{
                'width': '100%',
                'height': (pitches.length * pitchHeight) + 'px',
                'background-color': 'rgb(240, 242, 243)',
                'transform': 'translate3d(0, 0, 0)',
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
          <!-- Content viewport border -->
          <div style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0; box-shadow: inset 0px 0px 0px 1px rgb(24, 24, 24); pointer-events: none;"></div>
        </div>
        <!-- Right side -->
        <div ref="notesPane"
             style="flex: 1; overflow: scroll; background-color: rgb(50, 53, 56);"
             @scroll="onScroll_notesPane($event)">
          <!-- Content -->
          <div :style="{
              'display': 'flex',
              'flex-flow': 'row nowrap',
              'position': 'relative',
              'width': ((totalDuration / 1920.0) * global.barWidth) + 'px',
              'height': (pitches.length * pitchHeight) + 'px',
              'transform': 'translate3d(0, 0, 0)',
              'transform-style': 'preserve-3d',
              }">
            <!-- Scale intervals -->
            <template v-for="int in scaleIntervals">
              <div :style="{
                'display': 'flex',
                'flex-flow': 'row nowrap',
                'box-sizing': 'border-box',
                'width': ((int.duration / 1920.0) * global.barWidth) + 'px',
                'height': '100%',
                'box-shadow': 'inset 0 0 2px black',
                }">
                <!-- Chord intervals -->
                <template v-for="chd in int.chordIntervals">
                  <div :style="{
                    'position': 'relative',
                    'display': 'flex',
                    'flex-flow': 'column nowrap',
                    'width': ((chd.duration / 1920.0) * global.barWidth) + 'px',
                    'height': '100%',
                    'box-shadow': 'inset 0 0 2px red',
                    'transform-style': 'preserve-3d',
                    }">
                    <!-- Pitch row wrappers -->
                    <template v-for="pitch in pitches">
                      <div :class="{
                        'pitch-row-wrapper': true,
                        'scale-tone': (int.scale == null ? true : int.scale.includes(pitch % 12)),
                        'non-scale-tone': (int.scale == null ? false : !int.scale.includes(pitch % 12)),
                        'root-tone': (int.scale == null ? false : (chd.chord == null ? false : pitch % 12 === chd.chord[0])),
                        }" :style="{
                        'position': 'absolute',
                        'width': '100%',
                        'height': pitchHeight + 'px',
                        'transform': `translate3d(0, ${(pitchMax - pitch) * pitchHeight}px, 0)`,
                        'transform-style': 'preserve-3d',
                        }">
                        <!-- Pitch row -->
                        <div :class="{
                          'pitch-row': true,
                          }" :style="{
                          'position': 'relative',
                          'width': '100%',
                          'height': '100%',
                          'transform-style': 'preserve-3d',
                          }">
                          <!-- Notes -->
                          <template v-for="note in chd.notes">
                            <note v-if="note.pitch === pitch" :scale-interval="int" :chord-interval="chd" :note="note" />
                          </template>
                        </div>
                      </div>
                    </template>
                    <!-- Beat indicators -->
                    <template v-for="beat in divideDuration(chd.duration, 480)">
                      <div :style="{
                        'position': 'absolute',
                        'top': '0',
                        'left': ((beat.localOffset / 1920.0) * global.barWidth) + 'px',
                        'width': ((beat.duration / 1920.0) * global.barWidth) + 'px',
                        'height': '100%',
                        'background-image': `linear-gradient(to right, ${int.scale == null ? 'rgb(56, 58, 60)' : 'rgb(46, 48, 50)'} 0, ${int.scale == null ? 'rgb(56, 58, 60)' : 'rgb(46, 48, 50)'} 1px, transparent 1px, transparent 100%)`,
                        'pointer-events': `none`,
                      }">
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </template>
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
  barWidthMin: 4,
  barWidthMax: 2048,
  granularity: 240, // 1 quarter note = 480 ticks (de-facto standard in MIDI)
  getNormalizedScale(originalScale) {
    let normalizedScale;
    normalizedScale = JSON.parse(JSON.stringify(originalScale)); // Prevent destructive updating
    normalizedScale = normalizedScale.map(v => ((v - originalScale[0])+12)%12); // [9, 11, 0, 2, 4, 5, 7] -> [0, 2, 3, 5, 7, 8, 10]

    return normalizedScale;
  },
  getScaleNames(originalScale) {
    if (originalScale == null) { throw new Error(`Invalid scale: ${JSON.stringify(originalScale)}`); }

    const normalizedScale = global.getNormalizedScale(originalScale);

    switch (JSON.stringify(normalizedScale)) {
      case JSON.stringify([0, 2, 4, 5, 7, 9, 11]): // Major scale
        return global.getNoteNames(originalScale[0]).map(v => `${v} major`);
      case JSON.stringify([0, 2, 3, 5, 7, 8, 10]): // Natural minor scale
        return global.getNoteNames(originalScale[0]).map(v => `${v} minor`);
      default:
        return `Unknown scale (${originalScale.map(v => v.join('/')).join(', ')})`;
    }
  },
  // This app always shows degree labels if a scale is given.
  // So there is no need to support all enharmonics of each note, but black keys are supported for absolute note notation.
  getNoteNames(pitchClass) {
    switch (pitchClass) {
      case 0: return ['C'];
      case 1: return ['C#', 'Db'];
      case 2: return ['D'];
      case 3: return ['D#', 'Eb'];
      case 4: return ['E'];
      case 5: return ['F'];
      case 6: return ['F#', 'Gb'];
      case 7: return ['G'];
      case 8: return ['G#', 'Ab'];
      case 9: return ['A'];
      case 10: return ['A#', 'Bb'];
      case 11: return ['B'];
      default: throw new Error('Valid range of pitch class is 0-11.');
    }
  },
  getDegreeLabels(originalScale, pitchClass) {
    if (originalScale == null) { throw new Error(`Invalid scale: ${JSON.stringify(originalScale)}`); }

    const normalizedScale = global.getNormalizedScale(originalScale);
    const normalizedPitchClass = ((pitchClass - originalScale[0])+12)%12;

    switch (JSON.stringify(normalizedScale)) {
      case JSON.stringify([0, 2, 4, 5, 7, 9, 11]): // Major scale
        return [['I'], ['♯I', '♭II'], ['II'], ['♭III'], ['III'], ['IV'], ['♯IV', '♭V'], ['V'], ['♭VI'], ['VI'], ['♭VII'], ['VII']][normalizedPitchClass];
      case JSON.stringify([0, 2, 3, 5, 7, 8, 10]): // Natural minor scale
        return [['I'], ['♯I', '♭II'], ['II'], ['♭III'], ['III'], ['IV'], ['♯IV', '♭V'], ['V'], ['♭VI'], ['VI'], ['♭VII'], ['VII']][normalizedPitchClass];
      default:
        return [['I'], ['♯I', '♭II'], ['II'], ['♯II', '♭III'], ['III'], ['IV'], ['♯IV', '♭V'], ['V'], ['♯V', '♭VI'], ['VI'], ['♯VI', '♭VII'], ['VII']][normalizedPitchClass];
    }
  },
  getIntervalsFromRoot(originalScale, rootPitchClass, targetPitchClass) {
    // console.log(`(originalScale=${originalScale}, rootPitchClass=${rootPitchClass}, targetPitchClass=${targetPitchClass}`);
    if (originalScale == null) { throw new Error(`Invalid scale: ${JSON.stringify(originalScale)}`); }

    let retval;

    // Example:
    //  Original scale = [9, 11, 0, 2, 4, 5, 7]
    //  Original root pitch = 7
    //  Original target pitch = 11
    //
    //  Normalized scale = [0, 2, 3, 5, 7, 8, 10]
    //  Normalized root pitch = 10
    //  Normalized target pitch = 2
    //
    //  Chromatic interval = 4
    //  Interval = major 3rd
    const normalizedScale = global.getNormalizedScale(originalScale);
    const normalizedRootPitchClass = ((rootPitchClass - originalScale[0])+12)%12;
    const normalizedTargetPitchClass = ((targetPitchClass - originalScale[0])+12)%12;
    const chromaticInterval = ((normalizedTargetPitchClass - normalizedRootPitchClass)+12)%12;

    switch (JSON.stringify(normalizedScale)) {
      case JSON.stringify([0, 2, 4, 5, 7, 9, 11]): // Major scale
        throw new Error('The major scale is not supported yet.');
      case JSON.stringify([0, 2, 3, 5, 7, 8, 10]): // Natural minor scale
        switch (normalizedRootPitchClass) {
          // [I, 2nd, 3rd, 4th, 5th, 6th, 7th] = [0, 2, 3, 5, 7, 8, 10]
          case 0:
            retval = [
              ['Root'], // I
              ['♭2'], // ♯I, ♭II
              ['2'], // II
              ['3'], // ♭III
              ['♯3', '♭4'], // III
              ['4'], // IV
              ['♯4', '♭5'], // ♯IV, ♭V
              ['5'], // V
              ['6'], // ♭VI
              ['♯6', '♭7'], // VI
              ['7'], // ♭VII
              ['♯7'], // VII
            ][chromaticInterval];
            break;

          // [#I, 2nd, 3rd, 4th, 5th, 6th, 7th] = [1, 2, 3, 5, 7, 8, 10] <---- Using this here
          // [bII, 2nd, 3rd, 4th, 5th, 6th, 7th] = [1, 3, 5, 7, 8, 10, 0]
          case 1:
            retval = [
              ['Root'], // ♯I
              ['2'], // II
              ['3'], // ♭III
              ['♯3', '♭4'], // III
              ['4'], // IV
              ['♯4', '♭5'], // ♯IV, ♭V
              ['5'], // V
              ['6'], // ♭VI
              ['♯6', '♭7'], // VI
              ['7'], // ♭VII
              ['♯7'], // VII
              ['Orig 1st'], // I
            ][chromaticInterval];
            break;

          // [II, 2nd, 3rd, 4th, 5th, 6th, 7th] = [2, 3, 5, 7, 8, 10, 0]
          case 2:
            retval = [
              ['Root'], // II
              ['2'], // ♭III
              ['♯2', '♭3'], // III
              ['3'], // IV
              ['♯3', '♭4'], // ♯IV, ♭V
              ['4'], // V
              ['5'], // ♭VI
              ['♯5', '♭6'], // VI
              ['6'], // ♭VII
              ['♯6', '♭7'], // VII
              ['7'], // I
              ['♯7'], // ♯I, ♭II
            ][chromaticInterval];
            break;

          // [bIII, 2nd, 3rd, 4th, 5th, 6th, 7th] = [3, 5, 7, 8, 10, 0, 2]
          case 3:
            retval = [
              ['Root'], // ♭III
              ['♭2'], // III
              ['2'], // IV
              ['♯2', '♭3'], // ♯IV, ♭V
              ['3'], // V
              ['4'], // ♭VI
              ['♯4', '♭5'], // VI
              ['5'], // ♭VII
              ['♯5', '♭6'], // VII
              ['6'], // I
              ['♯6', '♭7'], // ♯I, ♭II
              ['7'], // II
            ][chromaticInterval];
            break;

          // [III, 2nd, 3rd, 4th, 5th, 6th, 7th] = [4, 5, 7, 8, 10, 0, 2]
          case 4:
            retval = [
              ['Root'], // III
              ['2'], // IV
              ['♯2', '♭3'], // ♯IV, ♭V
              ['3'], // V
              ['4'], // ♭VI
              ['♯4', '♭5'], // VI
              ['5'], // ♭VII
              ['♯5', '♭6'], // VII
              ['6'], // I
              ['♯6', '♭7'], // ♯I, ♭II
              ['7'], // II
              ['Orig 1st'], // ♭III
            ][chromaticInterval];
            break;

          // [IV, 2nd, 3rd, 4th, 5th, 6th, 7th] = [5, 7, 8, 10, 0, 2, 3]
          case 5:
            retval = [
              ['Root'], // IV
              ['♭2'], // ♯IV, ♭V
              ['2'], // V
              ['3'], // ♭VI
              ['♯3', '♭4'], // VI
              ['4'], // ♭VII
              ['♯4', '♭5'], // VII
              ['5'], // I
              ['♯5', '♭6'], // ♯I, ♭II
              ['6'], // II
              ['7'], // ♭III
              ['♯7'], // III
            ][chromaticInterval];
            break;

          // [#IV, 2nd, 3rd, 4th, 5th, 6th, 7th] = [6, 7, 8, 10, 0, 2, 3] <---- Using this here
          // [bV, 2nd, 3rd, 4th, 5th, 6th, 7th] = [6, 8, 10, 0, 2, 3, 5]
          case 6:
            retval = [
              ['Root'], // ♯IV, ♭V
              ['2'], // V
              ['3'], // ♭VI
              ['♯3', '♭4'], // VI
              ['4'], // ♭VII
              ['♯4', '♭5'], // VII
              ['5'], // I
              ['♯5', '♭6'], // ♯I, ♭II
              ['6'], // II
              ['7'], // ♭III
              ['♯7'], // III
              ['Orig 1st'], // IV
            ][chromaticInterval];
            break;

          // [V, 2nd, 3rd, 4th, 5th, 6th, 7th] = [7, 8, 10, 0, 2, 3, 5]
          case 7:
            retval = [
              ['Root'], // V
              ['2'], // ♭VI
              ['♯2', '♭3'], // VI
              ['3'], // ♭VII
              ['♯3', '♭4'], // VII
              ['4'], // I
              ['♯4', '♭5'], // ♯I, ♭II
              ['5'], // II
              ['6'], // ♭III
              ['♯6', '♭7'], // III
              ['7'], // IV
              ['♯7'], // ♯IV, ♭V
            ][chromaticInterval];
            break;

          // [bVI, 2nd, 3rd, 4th, 5th, 6th, 7th] = [8, 10, 0, 2, 3, 5, 7]
          case 8:
            retval = [
              ['Root'], // ♭VI
              ['♭2'], // VI
              ['2'], // ♭VII
              ['♯2', '♭3'], // VII
              ['3'], // I
              ['♯3', '♭4'], // ♯I, ♭II
              ['4'], // II
              ['5'], // ♭III
              ['♯5', '♭6'], // III
              ['6'], // IV
              ['♯6', '♭7'], // ♯IV, ♭V
              ['7'], // V
            ][chromaticInterval];
            break;

          // [VI, 2nd, 3rd, 4th, 5th, 6th, 7th] = [9, 10, 0, 2, 3, 5, 7]
          case 9:
            retval = [
              ['Root'], // VI
              ['2'], // ♭VII
              ['♯2', '♭3'], // VII
              ['3'], // I
              ['♯3', '♭4'], // ♯I, ♭II
              ['4'], // II
              ['5'], // ♭III
              ['♯5', '♭6'], // III
              ['6'], // IV
              ['♯6', '♭7'], // ♯IV, ♭V
              ['7'], // V
              ['Orig 1st'], // ♭VI
            ][chromaticInterval];
            break;

          // [bVII, 2nd, 3rd, 4th, 5th, 6th, 7th] = [10, 0, 2, 3, 5, 7, 8]
          case 10:
            retval = [
              ['Root'], // ♭VII
              ['♭2'], // VII
              ['2'], // I
              ['♯2', '♭3'], // ♯I, ♭II
              ['3'], // II
              ['4'], // ♭III
              ['♯4', '♭5'], // III
              ['5'], // IV
              ['♯5', '♭6'], // ♯IV, ♭V
              ['6'], // V
              ['7'], // ♭VI
              ['♯7'], // VI
            ][chromaticInterval];
            break;

          // [VII, 2nd, 3rd, 4th, 5th, 6th, 7th] = [11, 0, 2, 3, 5, 7, 8]
          case 11:
            retval = [
              ['Root'], // VII
              ['2'], // I
              ['♯2', '♭3'], // ♯I, ♭II
              ['3'], // II
              ['4'], // ♭III
              ['♯4', '♭5'], // III
              ['5'], // IV
              ['♯5', '♭6'], // ♯IV, ♭V
              ['6'], // V
              ['7'], // ♭VI
              ['♯7'], // VI
              ['Orig 1st'], // ♭VII
            ][chromaticInterval];
            break;

          default: throw new Error('Valid range of pitch class is 0-11.');
        }
        break;
      default:
        throw new Error('This scale is not supported: ' + normalizedScale);
    }

    // console.log(retval);
    return retval;
  },
};
const getPageXY = (element) => {
  let xPosition = 0;
  let yPosition = 0;

  while (element) {
    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
    element = element.offsetParent;
  }

  return { x: xPosition, y: yPosition };
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
      pitchHeightMin: 2,
      pitchHeightMax: 21,
      scaleIntervals: [
        {
          duration: 1920 * 4, // 4 bars
          scale: null, // empty interval
          chordIntervals: (() => {
            let arr = [];
            for (let i = 0 ; i < 2 ; i++) {
              arr = arr.concat(
                [
                  {
                    localOffset: 3840*i + 0,
                    duration: 960,
                    chord: [9, 0, 4, 7], // Am7
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
                    localOffset: 3840*i + 960,
                    duration: 960,
                    chord: [5, 9, 0, 4], // FM7
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
                    localOffset: 3840*i + 960 * 2,
                    duration: 960,
                    chord: [7, 11, 2, 5], // G7
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
                    localOffset: 3840*i + 960 * 3,
                    duration: 960,
                    chord: [0, 4, 7, 11], // CM7
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
                ],
              );
            }
            return arr;
          })(),
        },
        {
          duration: 1920 * 4,
          scale: [9, 11, 0, 2, 4, 5, 7], // A minor
          chordIntervals: [
            {
              localOffset: 0,
              duration: 1920 * 4,
              chord: null,
              notes: [],
            },
          ],
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
    },
    totalDuration() {
      let totalDuration = 0;
      for (const int of this.scaleIntervals) {
        totalDuration += int.duration;
      }
      return totalDuration;
    },
  },
  methods: {
    rerender() {
      const rec = (component) => {
        component.$forceUpdate();
        if (component.$children.length > 0) {
          for (let i = 0 ; i < component.$children.length ; i++) {
            rec(component.$children[i]);
          }
        }
      };
      rec(this);
    },
    /**
     * Divides the specified duration into several durations based on the specified unit.
     *
     * Example
     *   Input: duration=840, unit=200
     *   Output: [
     *     { localOffset: 0, duration: 200 },
     *     { localOffset: 200, duration: 200 },
     *     { localOffset: 400, duration: 200 },
     *     { localOffset: 600, duration: 200 },
     *     { localOffset: 800, duration: 40 },
     *   ]
     *
     *   Input: duration=800, unit=200
     *   Output: [
     *     { localOffset: 0, duration: 200 },
     *     { localOffset: 200, duration: 200 },
     *     { localOffset: 400, duration: 200 },
     *     { localOffset: 600, duration: 200 },
     *   ]
     */
    divideDuration(duration, unit) {
      // console.log(`divideDuration(duration=${duration}, unit=${unit})`);
      const retval = [];
      let tempOffset = 0;
      for ( ; tempOffset + unit < duration ; tempOffset += unit) {
        retval.push({
          localOffset: tempOffset,
          duration: unit,
        });
      }
      retval.push({
        localOffset: tempOffset,
        duration: duration - tempOffset,
      });

      // console.log(retval);
      return retval;
    },
    onWheel($event) {
      // console.log($event);
      if ($event.ctrlKey) {
        if ($event.shiftKey) {
          if ($event.deltaY !== 0) { // Horizontal zoom
            if ($event.deltaY < 0) {
              if (global.barWidth * 2 <= global.barWidthMax) { // Higher boundary clipping
                global.barWidth *= 2;
              }
            } else if ($event.deltaY > 0) {
              if (global.barWidth / 2 >= global.barWidthMin) { // Lower boundary clipping
                global.barWidth /= 2;
              }
            }
          }
          $event.stopPropagation();
          $event.preventDefault();
        } else {
          if ($event.deltaY !== 0) { // Vertical zoom
            if ($event.deltaY < 0) {
              if (this.pitchHeight + 2 <= this.pitchHeightMax) { // Higher boundary clipping
                this.pitchHeight += 2;
              }
            } else if ($event.deltaY > 0) {
              if (this.pitchHeight - 2 >= this.pitchHeightMin) { // Lower boundary clipping
                this.pitchHeight -= 2;
              }
            }
          }
          $event.stopPropagation();
          $event.preventDefault();
        }
      }
    },
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
            case 0: {
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
                  scale: null,
                  chordIntervals: [
                    {
                      localOffset: 0,
                      duration: tick,
                      chord: null,
                      notes: midiNotes,
                    },
                  ],
                },
              );
              // console.log(this.scaleIntervals);
              break;
            }
            case 1: {
              alert('Format 1 is not supported!');
              break;
            }
            case 2: {
              alert('Format 2 is not supported!');
              return;
            }
            default: {
            }
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
    onNewScaleInterval(baseScaleInterval, localOffset, duration) {
      // console.log(`onNewScaleInterval`);
      // console.log(`scale duration: ${baseScaleInterval.duration} - localOffset: ${localOffset} - duration: ${duration}`);
      let baseScaleIntervalIndex = this.scaleIntervals.findIndex(v => v === baseScaleInterval);

      Array.prototype.splice.apply(
        this.scaleIntervals,
        [
          baseScaleIntervalIndex,
          1,
          ...this.divideScaleInterval(this.scaleIntervals[baseScaleIntervalIndex], localOffset + duration, [9, 11, 0, 2, 4, 5, 7], null),
        ],
      );
      Array.prototype.splice.apply(
        this.scaleIntervals,
        [
          baseScaleIntervalIndex,
          1,
          ...this.divideScaleInterval(this.scaleIntervals[baseScaleIntervalIndex], localOffset, null, [9, 11, 0, 2, 4, 5, 7]),
        ],
      );
      this.rerender();
    },
    /**
     * Divides the specified scale interval into the two intervals, A and B, based on the specified boundary.
     * Allocates the chord intervals among the two scale intervals as needed.
     *
     * @return The two intervals
     */
    divideScaleInterval(baseScaleInterval, boundaryOffset, scaleA, scaleB) {
      // console.log(`divideScaleInterval`);
      // console.log(`scale duration: ${baseScaleInterval.duration} - boundaryOffset: ${boundaryOffset}`);
      if (boundaryOffset === baseScaleInterval.duration) {
        return [
          {
            duration: baseScaleInterval.duration,
            scale: scaleA,
            chordIntervals: baseScaleInterval.chordIntervals,
          },
        ];
      }
      if (boundaryOffset === 0) {
        return [
          {
            duration: baseScaleInterval.duration,
            scale: scaleB,
            chordIntervals: baseScaleInterval.chordIntervals,
          },
        ];
      }

      const newScaleIntervalA = {
        duration: boundaryOffset, // Range: [0, boundaryOffset]
        scale: scaleA,
        chordIntervals: [], // to be assigned
      };
      const newScaleIntervalB = {
        duration: baseScaleInterval.duration - boundaryOffset, // Range: [boundaryOffset, duration]
        scale: scaleB,
        chordIntervals: [], // to be assigned
      };

      // Search for a chord interval which should be divided
      let needsDivision = false;
      let targetIndex = null;
      for (let i = 0 ; i < baseScaleInterval.chordIntervals.length ; i++) {
        const currenttChordInterval = baseScaleInterval.chordIntervals[i];

        if (i === baseScaleInterval.chordIntervals.length-1) {
          // If no chord intervals start after boundaryOffset, the final chord interval should be divided
          needsDivision = true;
          targetIndex = i;
          break;
        } else if (i < baseScaleInterval.chordIntervals.length-1) {
          const nextChordInterval = baseScaleInterval.chordIntervals[i+1];
          if (nextChordInterval.localOffset === boundaryOffset) {
            // If the next chord interval starts at boundaryOffset, there is no chord interval which should be divided
            needsDivision = false;
            targetIndex = i; // first chord interval of the scale interval A
            break;
          } else if (nextChordInterval.localOffset > boundaryOffset) {
            // If the next chord interval start after boundaryOffset, the current chord interval should be divided
            needsDivision = true;
            targetIndex = i;
            break;
          }
        }
      }

      // Allocate (and modify) the chord intervals among the two scale intervals
      for (let i = 0 ; i <= targetIndex-1 ; i++) {
        newScaleIntervalA.chordIntervals.push(baseScaleInterval.chordIntervals[i]);
      }
      {
        const targetChordInterval = baseScaleInterval.chordIntervals[targetIndex];
        if (needsDivision) {
          const [newChordIntervalA, newChordIntervalB] = this.divideChordInterval(
            baseScaleInterval.chordIntervals[targetIndex],
            boundaryOffset - targetChordInterval.localOffset, // Calcurate inner boundaryOffset for the target chord interval
            targetChordInterval.chord,
            targetChordInterval.chord,
          );
          newChordIntervalB.localOffset -= boundaryOffset; // Update the origin of localOffset to the scale interval B
          newScaleIntervalA.chordIntervals.push(newChordIntervalA);
          newScaleIntervalB.chordIntervals.push(newChordIntervalB);
        } else {
          // If no division is needed, targetIndex points to the first chord interval of the scale interval A
          newScaleIntervalA.chordIntervals.push(targetChordInterval);
        }
      }
      for (let i = targetIndex+1 ; i < baseScaleInterval.chordIntervals.length ; i++) {
        baseScaleInterval.chordIntervals[i].localOffset -= boundaryOffset; // Update the origin of localOffset to the scale interval B
        newScaleIntervalB.chordIntervals.push(baseScaleInterval.chordIntervals[i]);
      }

      return [newScaleIntervalA, newScaleIntervalB];
    },
    /**
     * Divides the specified scale interval into the two intervals, A and B, based on the specified boundary.
     * Splits the chord intervals as needed.
     */
    divideChordInterval(oldChordInterval, boundaryOffset, chordA, chordB) {
      // console.log(`divideChordInterval`);
      // console.log(`chord localOffset: ${oldChordInterval.localOffset} - chord duration: ${oldChordInterval.duration} - boundaryOffset: ${boundaryOffset}`);
      const newChordIntervalA = {
        localOffset: oldChordInterval.localOffset,
        duration: boundaryOffset, // Range: [0, boundaryOffset]
        chord: chordA,
        notes: [], // to be assigned
      };
      const newChordIntervalB = {
        localOffset: oldChordInterval.localOffset + boundaryOffset,
        duration: oldChordInterval.duration - boundaryOffset, // Range: [boundaryOffset, duration]
        chord: chordB,
        notes: [], // to be assigned
      };

      // Allocate (and modify) the notes among the two chord intervals
      for (let i = 0 ; i < oldChordInterval.notes.length ; i++) {
        const note = oldChordInterval.notes[i];
        if (note.localOffset < boundaryOffset) {
          newChordIntervalA.notes.push(note);
        } else {
          note.localOffset -= boundaryOffset;
          newChordIntervalB.notes.push(note);
        }
      }

      return [newChordIntervalA, newChordIntervalB];
    },
  },
  components: {
    'note': {
      template: `
        <div class="note"
              :style="{
              'display': 'flex',
              'align-items': 'center',
              'white-space': 'nowrap',
              'position': 'absolute',
              'box-sizing': 'border-box',
              'border': ((this.scaleInterval.scale == null ? false : (this.chordInterval.chord == null ? false : this.note.pitch % 12 === this.chordInterval.chord[0])) ? '1px white solid' : '1px black solid'),
              'top': '0',
              'left': ((note.localOffset / 1920.0) * global.barWidth) + 'px',
              'padding-left': '4px',
              'width': ((note.duration / 1920.0) * global.barWidth) + 'px',
              'height': '100%',
              'font-size': '10px',
              'overflow': 'hidden',
              'color': 'white',
              'text-align': 'left',
              'transform': 'translateZ(100px)',
          }">
          <template v-if="scaleInterval.scale != null">
            <template v-if="chordInterval.chord != null">
              <template v-if="chordInterval.chord[0] !== note.pitch % 12"><!-- Show the degree label if it is a root tone -->
                {{global.getIntervalsFromRoot(scaleInterval.scale, chordInterval.chord[0], note.pitch % 12).join(' or ')}}
              </template>
              <template v-else>
                {{global.getDegreeLabels(scaleInterval.scale, note.pitch % 12).join(' or ')}}
              </template>
            </template>
            <template v-else>
              {{global.getDegreeLabels(scaleInterval.scale, note.pitch % 12).join(' or ')}}
            </template>
          </template>
          <template v-else>
            {{global.getNoteNames(note.pitch % 12).join(' or ')}}
          </template>
        </div>
      `,
      data() {
        return {
          global: global,
        };
      },
      props: ['scaleInterval', 'chordInterval', 'note'],
    },
    'scale-interval-indicator': {
      template: `
        <!-- Wrapper -->
        <div :style="{
                'position': 'relative',
                'width': ((scaleInterval.duration / 1920.0) * global.barWidth) + 'px',
                'height': '100%',
              }">
          <!-- Mouse down detector -->
          <div :style="{
                  'position': 'absolute',
                  'top': '0',
                  'left': '0',
                  'width': '100%',
                  'height': '24px',
                }"
                @mousedown="onMouseDown">
          </div>
          <!-- Indicator -->
          <div v-show="scaleInterval.scale != null"
               :style="{
                  'display': 'flex',
                  'align-items': 'center',
                  'position': 'absolute',
                  'top': '0',
                  'left': '0',
                  'box-sizing': 'border-box',
                  'padding-left': '6px',
                  'width': '100%',
                  'height': '24px',
                  'background-color': 'white',
                  'box-shadow': 'inset 0 0 2px black',
                  'font-size': '14px',
                  'font-weight': 'bold',
                }"
                @wheel="onWheel">
            <template v-if="scaleInterval.scale != null">
              {{global.getScaleNames(scaleInterval.scale).join(' / ')}}
            </template>
          </div>
          <!-- Input indicator -->
          <div v-show="inputting"
               :style="{
                  'position': 'absolute',
                  'top': '0',
                  'left': ((newIntervalLocalOffset / 1920.0) * global.barWidth) + 'px',
                  'width': ((newIntervalDuration / 1920.0) * global.barWidth) + 'px',
                  'height': '24px',
                  'background-color': 'white',
                  'box-shadow': 'inset 0 0 2px black',
                  'pointer-events': 'none',
                  }">
          </div>
          <!-- Child chord intervals -->
          <template v-for="chd in scaleInterval.chordIntervals">
            <div :style="{
                    'position': 'absolute',
                    'top': '24px',
                    'left': ((chd.localOffset / 1920.0) * global.barWidth) + 'px',
                    'width': ((chd.duration / 1920.0) * global.barWidth) + 'px',
                    'height': '24px',
                  }">
              <chord-interval-indicator :chordInterval="chd"/>
            </div>
          </template>
        </div>
      `,
      data() {
        return {
          global: global,
          headerPane: null, // to be assigned
          inputting: false,
          newIntervalLocalOffset: null,
          newIntervalDuration: null,
        };
      },
      props: ['scaleInterval'],
      methods: {
        onMouseDown: function ($event) {
          if (this.scaleInterval.scale != null) { return; } // Able to add a new scale interval only if this scale interval is empty

          // console.log('mousedown');
          // console.log(this.headerPane.scrollLeft);
          // console.log($event.pageX);
          // console.log(getPageXY(this.$el).x);
          this.inputting = true;

          const updateNewIntervalDuration = (eventPageX) => {
            this.newIntervalDuration = Math.round(((((this.headerPane.scrollLeft + eventPageX) - getPageXY(this.$el).x)+1) / this.$el.offsetWidth) * this.scaleInterval.duration) - this.newIntervalLocalOffset;
            // console.log(this.newIntervalDuration);
            if (this.newIntervalDuration < (true ? global.granularity : 0)) { // Lower boundary clipping
              this.newIntervalDuration = (true ? global.granularity : 0);
            } else if (this.newIntervalLocalOffset + this.newIntervalDuration > this.scaleInterval.duration) { // Higher boundary clipping
              this.newIntervalDuration = this.scaleInterval.duration - this.newIntervalLocalOffset;
            }
            // console.log(this.newIntervalDuration);
            if (true) { // Align the duration based on the granularity
              if ((this.newIntervalDuration % global.granularity) !== 0) {
                this.newIntervalDuration = this.newIntervalDuration - (this.newIntervalDuration % global.granularity) + global.granularity;
              }
            }
            // console.log(this.newIntervalDuration);
          };
          this.newIntervalLocalOffset = Math.round((((this.headerPane.scrollLeft + $event.pageX) - getPageXY(this.$el).x) / this.$el.offsetWidth) * this.scaleInterval.duration);
          // console.log(this.newIntervalLocalOffset);
          if (true) { // Align the local offset based on the granularity
            this.newIntervalLocalOffset = this.newIntervalLocalOffset - (this.newIntervalLocalOffset % global.granularity);
          }
          // console.log(this.newIntervalLocalOffset);
          updateNewIntervalDuration($event.pageX);

          // console.log(this.newIntervalLocalOffset);
          // console.log(this.newIntervalDuration);

          let onMouseMove;
          let onMouseUp;
          onMouseMove = (event) => {
            // console.log('mousemove');
            // console.log(event.pageX);
            // console.log(getPageXY(this.$el).x);
            updateNewIntervalDuration(event.pageX);
          };
          onMouseUp = (event) => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            this.$emit('new-scale-interval', this.scaleInterval, this.newIntervalLocalOffset, this.newIntervalDuration);
            this.inputting = false;
            this.newIntervalLocalOffset = null;
            this.newIntervalDuration = null;
          };
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        },
        onWheel: function ($event) {
          if ($event.deltaY > 0) {
            this.scaleInterval.scale = this.scaleInterval.scale.map(v => (v+11) % 12);
          } else if ($event.deltaY < 0) {
            this.scaleInterval.scale = this.scaleInterval.scale.map(v => (v+1) % 12);
          } else {
            return; // Horizontal wheel input is not supported
          }
          (this.$parent.rerender || this.$parent.$parent.rerender || this.$parent.$parent.$parent.rerender)();
        },
      },
      mounted() {
        try {
          // Note: :header-pane="$refs.headerPane" did not work
          this.headerPane = this.$parent.$refs.headerPane || this.$parent.$parent.$refs.headerPane || this.$parent.$parent.$parent.$refs.headerPane;
        } catch (e) {
          console.error('Header pane is not found!');
          throw e;
        }
      },
      components: {
        'chord-interval-indicator': {
          template: `
            <!-- Indicator -->
            <div v-show="chordInterval.chord != null"
                :style="{
                    'display': 'flex',
                    'align-items': 'center',
                    'position': 'static',
                    'box-sizing': 'border-box',
                    'padding-left': '6px',
                    'width': '100%',
                    'height': '100%',
                    'background-color': 'white',
                    'box-shadow': 'inset 0 0 2px black',
                    'font-size': '14px',
                    'font-weight': 'bold',
                  }"
                  @wheel="onWheel">
              {{chordInterval.chord === void 0 ? 'undefined' : JSON.stringify(chordInterval.chord)}}
            </div>
          `,
          data() {
            return {
              global: global,
            };
          },
          props: ['chordInterval'],
          methods: {
            onWheel: function ($event) {
              if ($event.deltaY > 0) {
                this.chordInterval.chord[0] = (this.chordInterval.chord[0]+11) % 12;
              } else if ($event.deltaY < 0) {
                this.chordInterval.chord[0] = (this.chordInterval.chord[0]+1) % 12;
              } else {
                return; // Horizontal wheel input is not supported
              }
              // Remove duplicate root tone
              this.chordInterval.chord = this.chordInterval.chord.filter((v, i, a) => {
                if (i === 0) { return true; } // [0] is always a root tone, unremovable
                if (v === a[0]) { return false; } // Remove another root tone if it is found
                return true;
              });

              (this.$parent.rerender || this.$parent.$parent.rerender || this.$parent.$parent.$parent.rerender)();
            },
          },
        },
      },
    },
  },
};
</script>

<style lang="scss">
  @import './App.scss';
</style>
