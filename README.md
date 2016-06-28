# Mixxx MIDI map and script for Pioneer DDJ-WeGO3

## Installation

Copy or symlink the `Pioneer-DDJ-WeGO3-scripts.js` and `Pioneer-DDJ-WeGO3.midi.xml` file to your [user controller mapping folder](http://mixxx.org/wiki/doku.php/controller_mapping_file_locations).

In Mixxx, go to Preferences, Controllers, and select the first instance of `PIONEER DDJ-WeGO3` (the MIDI controller, not the HID controller).

Enable the controller.

Open the Load Preset menu and scroll to the bottom. Select "Pioneer DDJ-WeGO3" to load the mapping. *If you see it twice, select the second one — the first one may be automatically created by Mixxx.*

You can check the Input Mappings and Scripts tab to verify that everything loaded.

Click OK and you should now be able to use your controller with Mixxx!

## Controls & Features

### Virtual Deck Support

On the left, switch between controlling deck 1 and 3 by pressing `SHIFT + HEADPHONE SELECT A`; likewise, switch between deck 2 and 4 on the right using `SHIFT + HEADPHONE SELECT B`.

Note: currently the only way to see which deck is active, without moving any controls, is to use the `HEADPHONE SELECT A` and `HEADPHONE SELECT B` headphone cue buttons and see which on-screen deck responds.

### Slip mode and play/cue/crossfade protection

Turn slip mode on and off by pressing `SHIFT + SYNC`.

The `SYNC` LED will turn on to indicate that you are in non-slip mode.

Slip mode is turned on for all decks by default at startup.

By default, slip mode also turns on certain protections to prevent against unwanted bumps while working with the DDJ-WeGO3's physical layout:

- `CROSSFADER` only works when slip mode is off for both active decks.
- `PLAY` and `CUE` will not stop a playing deck if the deck is audible (deck volume is > 0).

### Transport

- `PLAY` and `CUE` work as intended, subject to the protections listed above.

- `SHIFT + PLAY` will trigger a turntable-style brake.

- `SHIFT + CUE`, while held, will censor (1x backspin in slip mode).

### Sync

- `SYNC` button turns on/off sync for the deck. Note that visual feedback for this will only be shown on-screen.

### Platters

Use the outer ring of the platter to nudge. Use the surface to scratch.

Scratching is enabled for all decks. When slip mode is on, playback will resume as if the scratch never occurred.

Hold down `SHIFT` to increase speed of nudging and scratching. (Default factor is 10x)

### Hot cues

Set `HOT CUE / SAMPLER` to hot cue mode.

Press `1` through `4` to set or trigger cue points.

Press `SHIFT + 1` through `SHIFT + 4` to unset cue points.

### Beat looping

- Use `LOOP` to start a 4-bar loop at the current point. Press again to exit the loop.
- Use `1/2X` and `2X` to decrease and increase the size of the loop.

To get accurate in/out points, make sure Quantize mode is turned on for the deck before turning on looping.

### Beat loop rolls

Set `HOT CUE / SAMPLER` to sampler mode.

Press and hold `1` through `4` to trigger a beat loop roll:

- `1`: 1/4 beat
- `2`: 1/2 beat
- `3`: 1 beat
- `4`: 2 beats

### Filters and levels

`HI`, `MID`, `LOW`, and channel faders work as expected.

`SHIFT + HI` will modify the low/high pass filter for that deck.

`SHIFT + MID` will modify the channel gain for that deck.

### Kill switches

Set `HOT CUE / SAMPLER` to sampler mode.

Press and hold `SHIFT + 1` through `SHIFT + 4` to activate kills:

- `SHIFT + 1`: mute
- `SHIFT + 2`: kill highs
- `SHIFT + 3`: kill mids
- `SHIFT + 4`: kill lows

### Effects

- Use `FX1` through `FX3` to toggle the first three effects in the chain for that deck.
- Use `SHIFT + FX1` through `SHIFT + FX3` to toggle headphone output for the first three effects in the chain.

Note: No controls on the WeGO3 are mapped to effect modulators. To change those, use your mouse/trackpad or a separate controller.

### Playlist and loading

- Turn `BROWSE` to scroll through a playlist.
- Turn `SHIFT + BROWSE` to scroll 10 rows at a time.
- Press `LOAD` to load track into that deck (which must not be playing)
- Press `SHIFT + BROWSE` to open/close library folder
- Press `SHIFT + LOAD` to select prev/next library folders

### Headphone cueing

- Use `HEADPHONE SELECT A` and `HEADPHONE SELECT B` to toggle headphone cueing for that deck.
- Use `HEADPHONE SELECT MASTER` to turn on/off inclusion of master in headphones.

## Settings

Open the `Pioneer-DDJ-WeGO3-scripts.js` in a text editor and cange the settings near the top of the file.

When you save the file, Mixxx will reload it immediately.

## TODO / Known bugs

- Turn on CUE and PLAY LEDs
- Show active deck indicator on controller using blue or red platter LEDs
- When there's still platter movement after releasing touch, it's interpreted as ring movement.
- allow adjustment of brake factor
- trigger backspin if enough velocity detected during scratch
- allow toggling FX when tapping, and temporary hold of FX when holding
- preview track in headphones after clicking browse

## License

This mapping is released under the terms of the MIT license. See `LICENSE.md` for more details.
