<template>
  <div id="app"
    :class="{
      'flag-collapse': flagCollapse,
    }"
    style="width: 100%; height: 100%; background-color: rgb(28, 28, 28); display: flex; flex-flow: column nowrap;"
    @dragover="onDragOver($event)"
    @drop="onDrop($event)"
    @wheel="onWheel">
    <!-- Logo and Menu part -->
    <div style="height: 32px; position: relative;">
      <!-- Content wrapper -->
      <div style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0; background-color: rgb(58, 58, 58); display: flex; flex-flow: row nowrap;">
        <!-- Logo part -->
        <div style="width: 100px; background-color: rgb(40, 40, 40);"></div>
        <!-- Menu part -->
        <div style="flex: 1; width: 0; background-color: transparent;"></div>
      </div>
      <!-- Content wrapper border -->
      <div style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0; background-image: linear-gradient(to top, black 0px, black 1px, transparent 1px, transparent 100%); pointer-events: none;"></div>
    </div>
    <!-- Tool bar part -->
    <div style="height: 32px; position: relative;">
      <!-- Content wrapper -->
      <div style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0; background-color: rgb(94, 101, 108); display: flex; flex-flow: row nowrap;">
        <div style="flex: 1; width: 0; background-color: transparent; display: flex; flex-flow: row nowrap; align-items: center; color: white; font-size: 12px;">
          <span style="display: inline-block; width: 10px;"></span>
          <span style="display: inline-block;">MIDI Input:</span>          
          <span style="display: inline-block; width: 10px;"></span>
          <template v-if="midiAccess != null">
            <template v-if="selectedMidiInputs != null && selectedMidiInputs.length > 0">
              <template v-for="input in selectedMidiInputs">
                {{input.ref.name}}
                ({{input.channels.map(v => `CH${v}`).join(', ')}})
              </template>
            </template>
            <template v-else>
              &lt;Connected (No device is selected)&gt;
            </template>
          </template>
          <template v-else>
            &lt;Not connected&gt;
          </template>
          <span style="display: inline-block; width: 10px;"></span>
          <span style="display: inline-block; height: 20px; padding: 0 4px; background-color: rgba(255, 255, 255, 0.3);"
                @click="startMidiInputConfiguration">
            <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap; align-items: center;">
              Configure
            </div>
          </span>
          <template v-if="midiAccess != null">
            <span style="display: inline-block; width: 10px;"></span>
            <span style="display: inline-block; height: 20px; padding: 0 4px; background-color: rgba(255, 255, 255, 0.3);"
                  @click="disconnectMidiInput">
              <div style="width: 100%; height: 100%; display: flex; flex-flow: row nowrap; align-items: center;">
                Disconnect
              </div>
            </span>
          </template>
        </div>
      </div>
      <!-- Content wrapper border -->
      <div style="position: absolute; width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0; background-image: linear-gradient(to top, black 0px, black 1px, transparent 1px, transparent 100%); pointer-events: none;"></div>
    </div>
    <!-- Main part -->
    <div style="flex: 1; height: 0; margin: 2px; border: 1px solid black; display: flex; flex-flow: column nowrap;">
      <div style="height: 36px; background-color: rgb(94, 101, 108); border-bottom: 1px solid black; display: flex; flex-flow: row nowrap;">
        <div style="height: 24px; width: 159px; background-color: transparent;"></div>
        <div style="height: 100%; width: 32px; background-color: rgb(63, 140, 191); display: flex; flex-flow: row nowrap; align-items: center; justify-content: center; font-size: 7px; color: white;">
          Select
        </div>
        <div style="height: 100%; width: 32px; background-color: rgb(94, 101, 108); display: flex; flex-flow: row nowrap; align-items: center; justify-content: center; font-size: 7px; color: white;">
          Edit
        </div>
      </div>
      <div style="flex: 1; height: 0; display: flex; flex-flow: row nowrap;">
        <!-- Track List (Left) -->
        <div style="width: 192px; background-color: rgb(29, 30, 32); display: flex; flex-flow: column nowrap;">
          <div style="flex: 1; height: 0; background-color: rgb(94, 101, 108); margin-right: 1px;"></div>
        </div>
        <!-- Track Editor (Right) -->
        <div style="flex: 1; width: 0; background-color: rgb(29, 30, 32); display: flex; flex-flow: column nowrap;">
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
                  <scale-interval-indicator v-for="int in scaleIntervals" :key="int.id" :scale-interval="int" @new-scale-interval="onNewScaleInterval" @new-chord-interval="onNewChordInterval" />
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
                    <div v-for="pitch in pitches" :key="pitch" :style="{
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
                        'note-on': isNoteOn[pitch],
                      }">
                    </div>
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
                  <div v-for="int in scaleIntervals" :key="int.id" :style="{
                    'display': 'flex',
                    'flex-flow': 'row nowrap',
                    'box-sizing': 'border-box',
                    'width': ((int.duration / 1920.0) * global.barWidth) + 'px',
                    'height': '100%',
                    'box-shadow': 'inset 0 0 2px black',
                    }">
                    <!-- Chord intervals -->
                    <div v-for="chd in int.chordIntervals" :key="chd.id" :style="{
                      'position': 'relative',
                      'display': 'flex',
                      'flex-flow': 'column nowrap',
                      'width': ((chd.duration / 1920.0) * global.barWidth) + 'px',
                      'height': '100%',
                      'box-shadow': 'inset 0 0 2px red',
                      'transform-style': 'preserve-3d',
                      }">
                      <!-- Pitch row wrappers -->
                      <div v-for="pitch in pitches" :key="pitch" :class="{
                        'pitch-row-wrapper': true,
                        'scale-tone': (int.scale == null ? true : int.scale.includes(pitch % 12)),
                        'non-scale-tone': (int.scale == null ? false : !int.scale.includes(pitch % 12)),
                        'central-tone': (int.scale == null ? false : pitch % 12 === int.scale[0]),
                        'root-tone': (int.scale == null ? false : (chd.chord == null ? false : pitch % 12 === chd.chord[0])),
                        'note-on': isNoteOn[pitch],
                        }" :style="{
                        'position': 'absolute',
                        'width': '100%',
                        'height': pitchHeight + 'px',
                        'transform': `translate3d(0, ${(pitchMax - pitch) * pitchHeight}px, 0)`,
                        'transform-style': 'preserve-3d',
                        }">
                        <!-- Pitch row -->
                        <pitch-row :scale-interval="int" :chord-interval="chd" :pitch="pitch" :selected-notes="selectedNotes" @new-note="onNewNote" />
                      </div>
                      <!-- Beat indicators -->
                      <div v-for="(beat, index) in divideDuration(chd.duration, 480)" :key="beat.localOffset" :style="{
                        'position': 'absolute',
                        'top': '0',
                        'left': ((beat.localOffset / 1920.0) * global.barWidth) + 'px',
                        'width': ((beat.duration / 1920.0) * global.barWidth) + 'px',
                        'height': '100%',
                        'background-image': `linear-gradient(to right, ${int.scale == null ? 'rgb(56, 58, 60)' : (index === 0 && chd.chord != null ? 'black' : 'rgb(46, 48, 50)')} 0, ${int.scale == null ? 'rgb(56, 58, 60)' : (index === 0 && chd.chord != null ? 'black' : 'rgb(46, 48, 50)')} 1px, transparent 1px, transparent 100%)`,
                        'pointer-events': `none`,
                      }">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <modal name="midi-input-configuration" height="auto">
      <div style="padding: 14px 16px; font-size: 14px;">
        <template v-if="midiAccess != null">
          <template v-if="midiInputs != null">
            <div v-for="(input, index) in midiInputs" :key="input.name"
                 :style="{
                   'margin-top': (index === 0 ? '0' : '12px'),
                 }">
              <!-- TODO: Implement "Select all" -->
              <!-- <input type="checkbox" /> -->
              {{input.name}}
              <div v-for="ch in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]" :key="ch"
                  style="margin-left: 16px;">
                <!-- TODO: Restore check state if this modal window is shown again -->
                <input type="checkbox" @change="onMidiInputChannelToggled(input, ch, $event.target.checked)" />
                CH{{ch}}
              </div>
            </div>
          </template>
          <template v-else>
            <div>MIDI inputs are not available!</div>
          </template>
        </template>
      </div>
    </modal>
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
          id: Math.random(),
          duration: 1920 * 16,
          scale: null,
          chordIntervals: [
            {
              id: Math.random(),
              localOffset: 0,
              duration: 1920 * 16,
              chord: null,
              notes: [],
            },
          ],
        },
      ],
      selectedNotes: [],
      midiAccess: null,
      midiInputs: null,
      midiOutputs: null,
      selectedMidiInputs: [],
      isNoteOn: {},
    };
  },
  watch: {
    isNoteOn: {
      handler: function (val, oldVal) {
        console.log('new: %s, old: %s', val, oldVal);
      },
      deep: true,
    },
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
                              id: Math.random(),
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
                                id: Math.random(),
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
                  id: Math.random(),
                  duration: tick,
                  scale: null,
                  chordIntervals: [
                    {
                      id: Math.random(),
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

      const targetArray = this.scaleIntervals;
      Array.prototype.splice.apply(
        targetArray,
        [
          baseScaleIntervalIndex,
          1,
          ...this.divideScaleInterval(targetArray[baseScaleIntervalIndex], localOffset + duration, [9, 11, 0, 2, 4, 5, 7], null),
        ],
      );
      Array.prototype.splice.apply(
        targetArray,
        [
          baseScaleIntervalIndex,
          1,
          ...this.divideScaleInterval(targetArray[baseScaleIntervalIndex], localOffset, null, [9, 11, 0, 2, 4, 5, 7]),
        ],
      );
      this.rerender();
    },
    onNewChordInterval(baseScaleInterval, baseChordInterval, localOffset, duration) {
      // console.log('onNewChordInterval');
      // console.log(`chord duration: ${baseChordInterval.duration} - localOffset: ${localOffset} - duration: ${duration}`);
      let baseChordIntervalIndex = baseScaleInterval.chordIntervals.findIndex(v => v === baseChordInterval);

      const centralTone = (baseScaleInterval != null ? baseScaleInterval.scale[0] : 0);
      const targetArray = baseScaleInterval.chordIntervals;
      Array.prototype.splice.apply(
        targetArray,
        [
          baseChordIntervalIndex,
          1,
          ...this.divideChordInterval(targetArray[baseChordIntervalIndex], localOffset + duration, [centralTone], null),
        ],
      );
      Array.prototype.splice.apply(
        targetArray,
        [
          baseChordIntervalIndex,
          1,
          ...this.divideChordInterval(targetArray[baseChordIntervalIndex], localOffset, null, [centralTone]),
        ],
      );
      this.rerender();
    },
    onNewNote(parentChordInterval, localOffset, duration, pitch) {
      // console.log('onNewNote');
      // console.log(`localOffset: ${localOffset} - duration: ${duration} - pitch: ${pitch}`);
      const newNote = {
        id: Math.random(),
        localOffset: localOffset,
        duration: duration,
        pitch: pitch,
      };
      parentChordInterval.notes.push(newNote);

      this.selectedNotes.length = 0;
      this.selectedNotes.push(newNote);
      console.log(this.selectedNotes);
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
            id: Math.random(),
            duration: baseScaleInterval.duration,
            scale: scaleA,
            chordIntervals: baseScaleInterval.chordIntervals,
          },
        ];
      }
      if (boundaryOffset === 0) {
        return [
          {
            id: Math.random(),
            duration: baseScaleInterval.duration,
            scale: scaleB,
            chordIntervals: baseScaleInterval.chordIntervals,
          },
        ];
      }

      const newScaleIntervalA = {
        id: Math.random(),
        duration: boundaryOffset, // Range: [0, boundaryOffset]
        scale: scaleA,
        chordIntervals: [], // to be assigned
      };
      const newScaleIntervalB = {
        id: Math.random(),
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
        id: Math.random(),
        localOffset: oldChordInterval.localOffset,
        duration: boundaryOffset, // Range: [0, boundaryOffset]
        chord: chordA,
        notes: [], // to be assigned
      };
      const newChordIntervalB = {
        id: Math.random(),
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
    startMidiInputConfiguration() {
      // Show alert dialog if it is a first attempt to get MIDI access
      if (this.midiAccess == null && !window.confirm('All Input/Output MIDI devices will be locked after configuring input MIDI devices. Are you sure?')) {
        return;
      }

      // show static modal
      this.$modal.show('midi-input-configuration');

      // requestMIDIAccess
      if (this.midiAccess == null) {
        setTimeout(() => {
          navigator.requestMIDIAccess({ sysex: false, software: false })
          .then((ma) => {
            console.log(ma);
            this.midiAccess = ma;
            this.midiAccess.onstatechange = (e) => {
              console.log(e);
              console.log('MIDI access state is changed. Updating MIDI inputs/outputs array...');
              this.midiInputs = Array.from(ma.inputs.values());
              this.midiOutputs = Array.from(ma.outputs.values());
            };

            console.log('MIDI access is established. Updating MIDI inputs/outputs array...');

            this.midiInputs = Array.from(ma.inputs.values());
            this.midiOutputs = Array.from(ma.outputs.values());
            console.log(this.midiInputs);
            console.log(this.midiOutputs);
          })
          .catch((e) => {
            console.error('Failed to get MIDI access.');
            throw e;
          })
          .then(() => { // = finally
          });
        }, 500);
      }
    },
    disconnectMidiInput() {
      if (window.confirm('You need to reload the page to disconnect MIDI devices and make them available for other DAW applications. Are you sure?')) {
        location.reload();
      }
    },
    onMidiInputChannelToggled(input, channel, checked) {
      console.log(`${input}, ${channel}, ${checked}`);
      const targetMidiInput = this.selectedMidiInputs.find(v => v.ref === input);

      if (targetMidiInput == null) {
        if (checked) {
          // Add new entry
          const newVal = {
            ref: input,
            channels: [channel],
            midiMessageListener: (event) => {
              console.log(`[${input.name}]`);
              let str = "MIDI message received at timestamp " + event.timestamp + "[" + event.data.length + " bytes]: ";

              // Ignore MIDI events from not selected channels
              if (false) {
                return;
              }

              for (let i=0; i<event.data.length; i++) {
                str += "0x" + event.data[i].toString(16) + " ";
              }
              console.log( str );

              switch (event.data[0]) {
                case 0x80: // Note Off
                  this.isNoteOn[event.data[1]] = false;
                  MIDI.noteOff(0, event.data[1], 0);
                  break;
                case 0x90: // Note On
                  this.isNoteOn[event.data[1]] = true;
                  MIDI.noteOn(0, event.data[1], 100, 0);
                  break;
                default:
                  console.error(`Unsupported MIDI message type: ${event.data[0]}`);
              }
              console.log(this.isNoteOn);
              //this.rerender();
            },
          };
          this.selectedMidiInputs.push(newVal);

          input.onmidimessage = newVal.midiMessageListener; // Start listening
        }
      } else {
        if (checked) {
          // Add channel
          targetMidiInput.channels.push(channel);
        } else {
          // Remove channel
          targetMidiInput.channels.splice(targetMidiInput.channels.findIndex(v => v === channel), 1);

          // Remove entry
          if (targetMidiInput.channels.length === 0) {
            targetMidiInput.ref.onmidimessage = null; // Stop listening to MIDI messages to this MIDI input
            this.selectedMidiInputs.splice(this.selectedMidiInputs.findIndex(v => v === targetMidiInput), 1);
          }
        }
      }
    },
  },
  components: {
    'pitch-row': {
      template: `
        <div :class="{
          'pitch-row': true,
          }" :style="{
          'position': 'relative',
          'width': '100%',
          'height': '100%',
          'transform-style': 'preserve-3d',
          }">
          <!-- Mouse down detector -->
          <div :style="{
                  'position': 'absolute',
                  'top': '0',
                  'left': '0',
                  'width': '100%',
                  'height': '100%',
                }"
                @mousedown="onMouseDown">
          </div>
          <!-- Notes -->
          <note v-for="note in chordInterval.notes" :key="note.id" v-if="note.pitch == pitch" :scale-interval="scaleInterval" :chord-interval="chordInterval" :note="note"
            :class="{
              'selected': selectedNotes.includes(note),
            }"
            :style="{
              'position': 'absolute',
              'top': '0',
              'left': ((note.localOffset / 1920.0) * global.barWidth) + 'px',
              'width': ((note.duration / 1920.0) * global.barWidth) + 'px',
              'height': '100%',
          }" />
          <!-- Input indicator -->
          <note :scale-interval="scaleInterval" :chord-interval="chordInterval" :note="{pitch: pitch}"
            :style="{
              'position': 'absolute',
              'top': '0',
              'left': ((newNoteLocalOffset / 1920.0) * global.barWidth) + 'px',
              'width': ((newNoteDuration / 1920.0) * global.barWidth) + 'px',
              'height': '100%',
              'display': inputting ? 'flex !important' : 'none !important',
              'background-color': 'white !important',
              'color': 'black !important',
          }" />
          </div>
        </div>
      `,
      data() {
        return {
          global: global,
          notesPane: null, // to be assigned
          inputting: false,
          newNoteLocalOffset: null,
          newNoteDuration: null,
        };
      },
      props: ['scaleInterval', 'chordInterval', 'pitch', 'selectedNotes'],
      methods: {
        onMouseDown: function ($event) {
          this.inputting = true;
          MIDI.noteOn(0, this.pitch, 100, 0);

          const updateNewNoteDuration = (eventPageX) => {
            this.newNoteDuration = Math.round(((((this.notesPane.scrollLeft + eventPageX) - getPageXY(this.$el).x)+1) / this.$el.offsetWidth) * this.chordInterval.duration) - this.newNoteLocalOffset;
            // console.log(this.newNoteDuration);
            if (this.newNoteDuration < (true ? global.granularity : 0)) { // Lower boundary clipping
              this.newNoteDuration = (true ? global.granularity : 0);
            }
            // console.log(this.newNoteDuration);
            if (true) { // Align the duration based on the granularity
              if ((this.newNoteDuration % global.granularity) !== 0) {
                this.newNoteDuration = this.newNoteDuration - (this.newNoteDuration % global.granularity) + global.granularity;
              }
            }
            // console.log(this.newNoteDuration);
          };
          this.newNoteLocalOffset = Math.round((((this.notesPane.scrollLeft + $event.pageX) - getPageXY(this.$el).x) / this.$el.offsetWidth) * this.chordInterval.duration);
          // console.log(this.newNoteLocalOffset);
          if (true) { // Align the local offset based on the granularity
            this.newNoteLocalOffset = this.newNoteLocalOffset - (this.newNoteLocalOffset % global.granularity);
          }
          // console.log(this.newNoteLocalOffset);
          updateNewNoteDuration($event.pageX);

          let onMouseMove;
          let onMouseUp;
          onMouseMove = (event) => {
            // console.log('mousemove');
            // console.log(event.pageX);
            // console.log(getPageXY(this.$el).x);
            updateNewNoteDuration(event.pageX);
          };
          onMouseUp = (event) => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            MIDI.noteOff(0, this.pitch, 0);

            this.$emit('new-note', this.chordInterval, this.newNoteLocalOffset, this.newNoteDuration, this.pitch);
            this.inputting = false;
            this.newNoteLocalOffset = null;
            this.newNoteDuration = null;
          };
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        },
      },
      mounted() {
        try {
          this.notesPane = this.$parent.$refs.notesPane || this.$parent.$parent.$refs.notesPane || this.$parent.$parent.$parent.$refs.notesPane;
        } catch (e) {
          console.error('Notes pane is not found!');
          throw e;
        }
      },
      components: {
        'note': {
          template: `
            <div class="note"
                  :style="{
                  'display': 'flex',
                  'align-items': 'center',
                  'white-space': 'nowrap',
                  'box-sizing': 'border-box',
                  'border': ((this.scaleInterval.scale == null ? false : (this.chordInterval.chord == null ? false : this.note.pitch % 12 === this.chordInterval.chord[0])) ? '1px white solid' : '1px black solid'),
                  'padding-left': '4px',
                  'font-size': '10px',
                  'overflow': 'hidden',
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
      },
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
              <chord-interval-indicator :scaleInterval="scaleInterval" :chordInterval="chd" @new-chord-interval="onNewChordInterval" />
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
        onNewChordInterval(...args) {
          this.$emit.apply(this, ['new-chord-interval', ...args]); // Redirect
        },
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
            <!-- Wrapper -->
            <div :style="{
                    'position': 'relative',
                    'width': '100%',
                    'height': '100%',
                  }">
              <!-- Mouse down detector -->
              <div :style="{
                      'position': 'absolute',
                      'top': '0',
                      'left': '0',
                      'width': '100%',
                      'height': '100%',
                    }"
                    @mousedown="onMouseDown">
              </div>
              <!-- Indicator -->
              <div v-show="chordInterval.chord != null"
                  :style="{
                      'display': 'flex',
                      'align-items': 'center',
                      'position': 'absolute',
                      'top': '0',
                      'left': '0',
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
              <!-- Input indicator -->
              <div v-show="inputting"
                  :style="{
                      'position': 'absolute',
                      'top': '0',
                      'left': ((newIntervalLocalOffset / 1920.0) * global.barWidth) + 'px',
                      'width': ((newIntervalDuration / 1920.0) * global.barWidth) + 'px',
                      'height': '100%',
                      'background-color': 'white',
                      'box-shadow': 'inset 0 0 2px black',
                      'pointer-events': 'none',
                      }">
              </div>
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
          props: ['scaleInterval', 'chordInterval'],
          methods: {
            onMouseDown: function ($event) {
              if (this.chordInterval.chord != null) { return; } // Able to add a new chord interval only if this chord interval is empty

              this.inputting = true;

              const updateNewIntervalDuration = (eventPageX) => {
                this.newIntervalDuration = Math.round(((((this.headerPane.scrollLeft + eventPageX) - getPageXY(this.$el).x)+1) / this.$el.offsetWidth) * this.chordInterval.duration) - this.newIntervalLocalOffset;
                // console.log(this.newIntervalDuration);
                if (this.newIntervalDuration < (true ? global.granularity : 0)) { // Lower boundary clipping
                  this.newIntervalDuration = (true ? global.granularity : 0);
                } else if (this.newIntervalLocalOffset + this.newIntervalDuration > this.chordInterval.duration) { // Higher boundary clipping
                  this.newIntervalDuration = this.chordInterval.duration - this.newIntervalLocalOffset;
                }
                // console.log(this.newIntervalDuration);
                if (true) { // Align the duration based on the granularity
                  if ((this.newIntervalDuration % global.granularity) !== 0) {
                    this.newIntervalDuration = this.newIntervalDuration - (this.newIntervalDuration % global.granularity) + global.granularity;
                  }
                }
                // console.log(this.newIntervalDuration);
              };
              this.newIntervalLocalOffset = Math.round((((this.headerPane.scrollLeft + $event.pageX) - getPageXY(this.$el).x) / this.$el.offsetWidth) * this.chordInterval.duration);
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

                this.$emit('new-chord-interval', this.scaleInterval, this.chordInterval, this.newIntervalLocalOffset, this.newIntervalDuration);
                this.inputting = false;
                this.newIntervalLocalOffset = null;
                this.newIntervalDuration = null;
              };
              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            },
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
          mounted() {
            try {
              this.headerPane = this.$parent.$parent.$refs.headerPane || this.$parent.$parent.$parent.$refs.headerPane || this.$parent.$parent.$parent.$parent.$refs.headerPane;
            } catch (e) {
              console.error('Header pane is not found!');
              throw e;
            }
          },
        },
      },
    },
  },
  beforeCreate() {
    MIDI.loadPlugin({
        soundfontUrl: "static/vendor/MIDI.js/examples/soundfont/",
        instrument: "acoustic_grand_piano",
        onsuccess: function() {
          MIDI.setVolume(0, 127);
        },
    });
  },
};
</script>

<style lang="scss">
  @import './App.scss';
</style>
