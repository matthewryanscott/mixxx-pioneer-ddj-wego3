// ********** :::::: TODO ::::: ********** // LIST
// =========
// - properly use brake factor
// - cancel braking when play is pressed during brake
// - continue scratch velocity after releasing platter

var PioneerDDJWeGO3 = function() {};

var wego3 = PioneerDDJWeGO3;


// =============
// Configuration
// =============


// Turn on scratch mode for all decks.
wego3.ALL_SCRATCH_ON = true;

// Brake on stop settings (shift play).
wego3.BRAKE_FACTOR = 1.0;
wego3.BRAKE_DIRECTION = 1.0;

// Sets the jogwheels sensivity. 1 is default, 2 is twice as sensitive, 0.5 is half as sensitive.
wego3.JOG_WHEEL_SENSITIVITY =  1.0;

// Wikka wikka wikka...
wego3.SCRATCH_SETTINGS = {
  alpha: 1.0 / 8,
  beta: 1.0 / 8 / 32,
  jogResolution: 720,
  vinylSpeed: 33 + 1/3,
  safeScratchTimeout: 20
};

wego3.LED_MAP = {
  headphoneCue: {'[Left]': [0x96, 0x54], '[Right]': [0x96, 0x55], '[Master]': [0x96, 0x5b]},
  // loopHalf: {'[Left]': [0x90, 0x12], '[Right]': [0x91, 0x12]},
  // loopDouble: {'[Left]': [0x90, 0x13], '[Right]': [0x91, 0x13]},
  loop: {'[Left]': [0x9b, 0x10], '[Right]': [0x9b, 0x11]},
  fx1: {'[Left]': [0x94, 0x43], '[Right]': [0x95, 0x43]},
  fx2: {'[Left]': [0x94, 0x44], '[Right]': [0x95, 0x44]},
  fx3: {'[Left]': [0x94, 0x45], '[Right]': [0x95, 0x45]},
  sync: {'[Left]': [0x90, 0x58], '[Right]': [0x91, 0x58]},
  play: {'[Left]': [0x90, 0x0b], '[Right]': [0x91, 0x0b]},
  cue: {'[Left]': [0x90, 0x0c], '[Right]': [0x91, 0x0c]},
  cuePoint1: {'[Left]': [0x90, 0x2e], '[Right]': [0x91, 0x2e]},
  cuePoint2: {'[Left]': [0x90, 0x2f], '[Right]': [0x91, 0x2f]},
  cuePoint3: {'[Left]': [0x90, 0x30], '[Right]': [0x91, 0x30]},
  cuePoint4: {'[Left]': [0x90, 0x31], '[Right]': [0x91, 0x31]},
  sampler1: {'[Left]': [0x90, 0x3c], '[Right]': [0x91, 0x3c]},
  sampler2: {'[Left]': [0x90, 0x3e], '[Right]': [0x91, 0x3e]},
  sampler3: {'[Left]': [0x90, 0x40], '[Right]': [0x91, 0x40]},
  sampler4: {'[Left]': [0x90, 0x42], '[Right]': [0x91, 0x42]}
};

wego3.LED_CONTROL_FUNCTIONS = {
  play: 'wego3.playLed',
  pfl: 'wego3.headphoneCueLed',
  beat_active: 'wego3.syncLed',
  hotcue_1_enabled: 'wego3.hotCueLed',
  hotcue_2_enabled: 'wego3.hotCueLed',
  hotcue_3_enabled: 'wego3.hotCueLed',
  hotcue_4_enabled: 'wego3.hotCueLed'
};


// ==============
// Initialization
// ==============


wego3.init = function(id) {
  print('init');
  // Data structures
  wego3.shiftPressed = false;
  wego3.allChannels = [1, 2, 3, 4].
    map(function (x) { return '[Channel' + x + ']'; })
  wego3.highResMSB = {
    '[Channel1]': {},
    '[Channel2]': {},
    '[Channel3]': {},
    '[Channel4]': {},
    '[Master]': {}
  };
  wego3.groupDecks = {
    // groupDecks[group] => deck
    '[Channel1]': 0,
    '[Channel2]': 1,
    '[Channel3]': 2,
    '[Channel4]': 3,
  };
  wego3.deckGroups = [
    // deckGroups[deck] => group
    '[Channel1]',
    '[Channel2]',
    '[Channel3]',
    '[Channel4]'
  ];
  wego3.actualGroupMap = {
    '[Left]': '[Channel1]',
    '[Right]': '[Channel2]',
    '[Master]': '[Master]'
  };
  wego3.actualGroupToggleMap = {
    '[Channel1]': '[Channel3]',
    '[Channel2]': '[Channel4]',
    '[Channel3]': '[Channel1]',
    '[Channel4]': '[Channel2]'
  };
  wego3.virtualGroupMap = {
    '[Channel1]': '[Left]',
    '[Channel2]': '[Right]',
    '[Channel3]': '[Left]',
    '[Channel4]': '[Right]',
    '[Master]': '[Master]'
  };
  var v = wego3.ALL_SCRATCH_ON;
  wego3.scratchMode = [v, v, v, v];
  // Engine
  wego3.setAllSoftTakeover();
  // Lighting
  wego3.turnOffAllLeds('[Left]');
  wego3.turnOffAllLeds('[Right]');
  wego3.turnOffAllLeds('[Master]');
  wego3.bindDeckLeds('[Left]', true);
  wego3.bindDeckLeds('[Right]', true);
  wego3.bindGlobalLeds(true);
  // Initial slip mode.
  wego3.slipMode = [true, true, true, true];
  engine.setValue('[Channel1]', 'slip_enabled', 1);
  engine.setValue('[Channel2]', 'slip_enabled', 1);
  engine.setValue('[Channel3]', 'slip_enabled', 1);
  engine.setValue('[Channel4]', 'slip_enabled', 1);

  // midi.sendShortMsg(0x9b, 0x0c, 0x01); // initialize left deck - 0x00 or 0x01
  // midi.sendShortMsg(0x9b, 0x0d, 0x01); // initialize right deck

};


wego3.shutdown = function() {
  wego3.bindDeckLeds('[Left]', false);
  wego3.bindDeckLeds('[Right]', false);
  wego3.bindGlobalLeds(false);
  wego3.setAllSoftTakeover(false);
  wegp3.turnOffAllLeds();
};


wego3.setAllSoftTakeover = function (isBinding) {
  if (isBinding === undefined) {
    isBinding = true;
  }
  wego3.allChannels.
    forEach(function (c) { wego3.setDeckSoftTakeover(c, isBinding); });
};


wego3.setDeckSoftTakeover = function (channel, isBinding) {
  engine.softTakeover(channel, 'volume', isBinding);
  engine.softTakeover(channel, 'rate', isBinding);
  engine.softTakeover(channel, 'filterHigh', isBinding);
  engine.softTakeover(channel, 'filterMid', isBinding);
  engine.softTakeover(channel, 'filterLow', isBinding);
  var effectRack = '[QuickEffectRack1_' + channel + ']';
  engine.softTakeover(effectRack, 'super1', isBinding);
};


// ==============================
// Virtual/actual channel mapping
// ==============================


wego3.actualGroup = function (group) {
  return wego3.actualGroupMap[group] || group;
};


wego3.virtualGroup = function (group) {
  var virtualGroup = wego3.virtualGroupMap[group];
  var currentActualGroup = wego3.actualGroup(virtualGroup);
  if (group == currentActualGroup) {
    return virtualGroup;
  }
};


// =================
// Function builders
// =================


wego3.hiResControl = function (functionName, controlName, callback, min, midMax, max, predicate) {
  if (callback == 'linear') {
    if (min === undefined) {
      min = 0.0;
    }
    if (midMax === undefined) {
      max = 1.0;
    } else {
      max = midMax;
    }
    callback = function(fullValue, group) {
      if (predicate === undefined || predicate()) {
        var newValue = script.absoluteLin(fullValue, min, max, 0, 0x3fff);
        engine.setValue(group, controlName, newValue);
      }
    };
  } else if (callback == 'nonlinear') {
    if (min === undefined) {
      min = 0.0;
    }
    if (midMax === undefined) {
      midMax = 1.0;
    }
    if (max === undefined) {
      max = 4.0;
    }
    callback = function(fullValue, group) {
      if (predicate === undefined || predicate()) {
        var newValue = script.absoluteNonLin(fullValue, min, midMax, max, 0, 0x3fff);
        engine.setValue(group, controlName, newValue);
      }
    };
  }
  var msbControlName = functionName + 'MSB';
  var lsbControlName = functionName + 'LSB';
  wego3[msbControlName] = function (channel, control, value, status, group) {
    group = wego3.actualGroup(group);
    wego3.highResMSB[group][functionName] = value;
  };
  wego3[lsbControlName] = function (channel, control, value, status, group) {
    group = wego3.actualGroup(group);
    var fullValue = (wego3.highResMSB[group][functionName] << 7) + value;
    callback(fullValue, group);
  };
};


// ===============
// 14-bit controls
// ===============

wego3.canCrossFade = function () {
  // only allow crossfader to operate when slip mode is deactivated
  var actualLeft = wego3.actualGroup('[Left]');
  var actualRight = wego3.actualGroup('[Right]');
  var deckLeft = wego3.groupDecks[actualLeft];
  var deckRight = wego3.groupDecks[actualRight];
  return (!wego3.slipMode[deckLeft] && !wego3.slipMode[deckRight]);
};

wego3.hiResControl('crossFader', 'crossfader', 'linear', -1.0, 1.0, null, wego3.canCrossFade);
wego3.hiResControl('tempoSlider', 'rate', 'linear', 1.0, -1.0);
wego3.hiResControl('filterHighKnob', 'filterHigh', 'nonlinear');
wego3.hiResControl('filterMidKnob', 'filterMid', 'nonlinear');
wego3.hiResControl('filterLowKnob', 'filterLow', 'nonlinear');
wego3.hiResControl('deckFader', 'volume', 'linear');


// =======
// Buttons
// =======

wego3.browseKnob = function (channel, control, value, status, group) {
  // ********** :::::: TODO ::::: ********** //
  print('browseKnob');
  script.midiDebug(channel, control, value, status, group);
};


wego3.browseButton = function (channel, control, value, status, group) {
  // ********** :::::: TODO ::::: ********** //
  print('browseButton');
  script.midiDebug(channel, control, value, status, group);
};


wego3.shiftButton = function (channel, control, value, status, group) {
  wego3.bindDeckLeds(group, false);
  wego3.turnOffAllLeds(group);
  wego3.shiftPressed = !!value;
  wego3.bindDeckLeds(group, true);
};


wego3.headphoneCueButton = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  if (value) {
    if (group == '[Master]') {
      var current = engine.getValue(group, 'headMix');
      engine.setValue(group, 'headMix', current < 0 ? 0.0 : -1.0);
    } else {
      script.toggleControl(group, 'pfl');
    }
  }
};


// When A or B headphone select is pressed while shifted,
// toggle the deck that is being controlled by that side.
wego3.headphoneCueButtonShifted = function (channel, control, value, status, group) {
  if (value && group !== '[Master]') {
    var currentActualGroup = wego3.actualGroup(group);
    var newActualGroup = wego3.actualGroupToggleMap[currentActualGroup];
    wego3.bindDeckLeds(group, false);
    wego3.turnOffAllLeds(group);
    wego3.actualGroupMap[group] = newActualGroup;
    wego3.bindDeckLeds(group, true);
  }
}


wego3.playButton = function (channel, control, value, status, group) {
  if (value) {
    group = wego3.actualGroup(group);
    var deck = wego3.groupDecks[group];
    engine.brake(deck + 1, 0);
    script.toggleControl(group, 'play');
    engine.setValue(group, 'reverseroll', 0);
  }
};


wego3.playButtonShifted = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  if (value && engine.getValue(group, 'play')) {
    var deck = wego3.groupDecks[group];
    engine.setValue(group, 'play', 0);
    engine.brake(deck + 1, value, wego3.BRAKE_FACTOR, wego3.BRAKE_DIRECTION);
  }
};


wego3.cueButton = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group)
  engine.setValue(group, 'cue_default', value);
};


wego3.cueButtonShifted = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  engine.setValue(group, 'reverseroll', value);
};


wego3.loopHalfButton = function (channel, control, value, status, group) {
  // ********** :::::: TODO ::::: ********** //
  print('loopHalfButton');
  script.midiDebug(channel, control, value, status, group);
};


wego3.loopDoubleButton = function (channel, control, value, status, group) {
  // ********** :::::: TODO ::::: ********** //
  print('loopDoubleButton');
  script.midiDebug(channel, control, value, status, group);
};


wego3.loopButton = function (channel, control, value, status, group) {
  if (value) {
    group = wego3.actualGroup(group);
    engine.setValue(group, 'reloop_exit', 1);
  }
};


wego3.hotCueButton = function (channel, control, value, status, group) {
  var hotCueIndex = control - 0x2d;
  group = wego3.actualGroup(group);
  engine.setValue(group, 'hotcue_' + hotCueIndex + '_activate', value);
};


wego3.hotCueButtonShifted = function (channel, control, value, status, group) {
  var hotCueIndex = control - 0x5e;
  if (value) {
    group = wego3.actualGroup(group);
    engine.setValue(group, 'hotcue_' + hotCueIndex + '_clear', 1);
  }
};


wego3.samplerButton = function (channel, control, value, status, group) {
  // ********** :::::: TODO ::::: ********** //
  print('samplerButton');
  script.midiDebug(channel, control, value, status, group);
};


wego3.samplerButtonShifted = function (channel, control, value, status, group) {
  print('samplerButtonShifted');
  script.midiDebug(channel, control, value, status, group);
};


wego3.syncButton = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  if (value) {
    script.toggleControl(group, 'sync_enabled');
  }
};


wego3.syncButtonShifted = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  if (value) {
    var deck = wego3.groupDecks[group];
    wego3.slipMode[deck] = !wego3.slipMode[deck];
  }
};


wego3.cueSamplerToggleButton = function (channel, control, value, status, group) {
  // ********** :::::: TODO ::::: ********** //
  print('cueSamplerToggleButton');
  script.midiDebug(channel, control, value, status, group);
};


wego3.fxButton = function (channel, control, value, status, group) {
  // TODO: allow holding as well as toggling
  if (value) {
    var fxNumber = control - 0x42;
    group = wego3.actualGroup(group);
    var fxGroup = '[EffectRack1_EffectUnit' + fxNumber + ']';
    var controlName = 'group_' + group + '_enable';
    script.toggleControl(fxGroup, controlName);
  }
};


wego3.fxButtonShifted = function (channel, control, value, status, group) {
  // TODO: allow holding as well as toggling
  if (value) {
    var fxNumber = control - 0x4c;
    var fxGroup = '[EffectRack1_EffectUnit' + fxNumber + ']';
    var controlName = 'group_[Headphone]_enable';
    print('fxgroup=' + fxGroup + ' controlname=' + controlName);
    script.toggleControl(fxGroup, controlName);
  }
};


wego3.loadButton = function (channel, control, value, status, group) {
  // ********** :::::: TODO ::::: ********** //
  print('loadButton');
  script.midiDebug(channel, control, value, status, group);
};


// ==========
// Jog wheels
// ==========


wego3.jogWheelDelta = function (value) {
  return value - 0x40;
};


wego3.jogRingTick = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  wego3.pitchBendFromJog(group, wego3.jogWheelDelta(value));
};


wego3.jogPlatterTick = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  var deck = wego3.groupDecks[group];
  if (wego3.scratchMode[deck]) {
    engine.scratchTick(deck + 1, wego3.jogWheelDelta(value));
  } else {
    wego3.pitchBendFromJog(group, wego3.jogWheelDelta(value));
  }
};


wego3.jogTouch = function (channel, control, value, status, group) {
  group = wego3.actualGroup(group);
  var deck = wego3.groupDecks[group];
  if (wego3.scratchMode[deck]) {
    if (value) {
      engine.scratchEnable(
        deck + 1,
        wego3.SCRATCH_SETTINGS.jogResolution,
        wego3.SCRATCH_SETTINGS.vinylSpeed,
        wego3.SCRATCH_SETTINGS.alpha,
        wego3.SCRATCH_SETTINGS.beta
      );
      engine.setValue(group, 'slip_enabled', wego3.slipMode[deck]);
    } else {
      engine.scratchDisable(deck + 1, true);
      engine.beginTimer(50, 'wego3.disableSlip("' + group + '")', true);
    }
  }
};


wego3.disableSlip = function (group) {
  engine.setValue(group, 'slip_enabled', false);
};


wego3.pitchBendFromJog = function (group, movement) {
  var group = (typeof group === 'string' ? group : wego3.deckGroups[group]);
  engine.setValue(group, 'jog', movement / 5 * wego3.JOG_WHEEL_SENSITIVITY);
};


// ========
// Lighting
// ========

wego3.setLed = function (group, name, value) {
  print('LED name ' + name + ', value ' + value);
  if (wego3.LED_MAP[name] === undefined || wego3.LED_MAP[name][group] === undefined) {
    // No light is defined for this group.
    return;
  }
  var ledInfo = wego3.LED_MAP[name][group];
  var command = ledInfo[0];
  var midino = ledInfo[1];
  midi.sendShortMsg(command, midino, value);
  print('command=' + command + ' midino=' + midino + ' value=' + value);
};

wego3.turnOffAllLeds = function (group) {
  for (var k in wego3.LED_MAP) {
    wego3.setLed(group, k, 0);
  }
};

wego3.playLed = function (value, group, control) {
  group = wego3.virtualGroup(group);
  wego3.setLed(group, 'play', value);
};

wego3.headphoneCueLed = function (value, group, control) {
  group = wego3.virtualGroup(group);
  wego3.setLed(group, 'headphoneCue', value * 0x7f);
};

wego3.masterCueLed = function (value, group, control) {
  group = wego3.virtualGroup(group);
  wego3.setLed(group, 'headphoneCue', (value >= 0.0) * 0x7f);
};

wego3.syncLed = function (value, group, control) {
  var deck = wego3.groupDecks[group];
  group = wego3.virtualGroup(group);
  if (!wego3.slipMode[deck]) {
    value = !value;
  }
  wego3.setLed(group, 'sync', value * 0x7f);
};

wego3.hotCueLed = function (value, group, control) {
  for (var i = 1; i <= 4; ++i) {
    if (control === 'hotcue_' + i + '_enabled') {
      var ledName = 'cuePoint' + i;
      group = wego3.virtualGroup(group);
      wego3.setLed(group, ledName, value * 0x7f);
    }
  }
};

wego3.fxLed = function (value, group, control) {
  print('fxLed value=' + value + ' group=' + group + ' control=' + control);
  for (var fx = 1; fx <= 3; ++fx) {
    for (var cn = 1; cn <= 4; ++cn) {
      var fxMatches = (group === '[EffectRack1_EffectUnit' + fx + ']');
      var cnMatches = (control === 'group_[Channel' + cn + ']_enable');
      if (fxMatches && cnMatches) {
        var ledName = 'fx' + fx;
        var actual = '[Channel' + cn + ']';
        var virtual = wego3.virtualGroup(actual);
        wego3.setLed(virtual, ledName, value * 0x7f);
      }
    }
  }
};

wego3.bindGlobalLeds = function(isBinding) {
  engine.connectControl('[Master]', 'headMix', 'wego3.masterCueLed', !isBinding);
  if (isBinding) {
    engine.trigger('[Master]', 'headMix');
  }
};

wego3.bindDeckLeds = function(group, isBinding) {
  group = wego3.actualGroup(group);
  script.bindConnections(group, wego3.LED_CONTROL_FUNCTIONS, !isBinding);
  // Effects (they use different group names)
  var effectsGroup;
  if (wego3.shiftPressed) {
    effectsGroup = '[Headphone]';
  } else {
    effectsGroup = group;
  }
  for (var i = 1; i <= 3; ++i) {
    engine.connectControl('[EffectRack1_EffectUnit' + i + ']', 'group_' + effectsGroup + '_enable', 'wego3.fxLed', !isBinding);
    if (isBinding) {
      engine.trigger('[EffectRack1_EffectUnit' + i + ']', 'group_' + effectsGroup + '_enable');
    }
  }
};

// ========================
// Enable shifted functions
// ========================

for (var fnName in wego3) {
  if (fnName.substr(-7) == 'Shifted') {
    (function (fnName) {
      var unshiftedName = fnName.substr(0, fnName.length - 7);
      print('Setting up shifted/unshifted for ' + fnName + '/' + unshiftedName);
      var shiftedFn = wego3[fnName];
      var unshiftedFn = wego3[unshiftedName];
      wego3[unshiftedName] = function (channel, control, value, status, group) {
        if (wego3.shiftPressed) {
          shiftedFn(channel, control, value, status, group);
        } else {
          unshiftedFn(channel, control, value, status, group);
        }
      };
    })(fnName);
  }
}
