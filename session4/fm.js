var context = new AudioContext()
settings = {
    id: 'keyboard',
    width: 600,
    height: 150,
    startNote: 'C3',
    whiteNotesColour: '#fff',
    blackNotesColour: '#000',
    borderColour: '#000',
    activeColour: 'yellow',
    octaves: 2
},
keyboard = new QwertyHancock(settings);


var Voice = function(context, frequency, parameters) {
  this.context = context;

  // modulator osc
  this.modulatingOsc = context.createOscillator()
  this.modulatingOscGain = context.createGain();

  // carrier osc
  this.carrierOsc = context.createOscillator();
  this.carrierOscGain = context.createGain();

  // lowpass filter 
  this.lowpassfilter = context.createBiquadFilter();

  // connect
  this.modulatingOsc.connect(this.modulatingOscGain);
  this.modulatingOscGain.connect(this.carrierOsc.frequency);
  this.carrierOsc.connect(this.carrierOscGain);
  this.carrierOscGain.connect(this.lowpassfilter);
  this.lowpassfilter.connect(context.destination);
  
  // preset parameters 
  this.modulationIndex = parameters.modulationIndex;
  this.modulationFrequency = frequency / parameters.carrierModulationRatio;
  this.IndexAttackTime = parameters.IndexAttackTime;
  this.IndexDecayTime = parameters.IndexDecayTime;
  this.IndexSustainLevel = parameters.IndexSustainLevel;
  this.IndexReleaseTime = parameters.IndexReleaseTime;
  this.AmpEnvAttackTime = parameters.AmpEnvAttackTime;
  this.AmpEnvDecayTime = parameters.AmpEnvDecayTime;
  this.AmpEnvSustainLevel = parameters.AmpEnvSustainLevel;
  this.AmpEnvReleaseTime = parameters.AmpEnvReleaseTime;
  
  this.modulatingOsc.frequency.value = this.modulationFrequency;
  this.carrierOsc.frequency.value = frequency;
  
  this.lowpassfilter.type = 'lowpass';
  
};

Voice.prototype.on = function() {
  this.modulatingOsc.start();
  this.carrierOsc.start();
  this.triggerCarrierEnvelope();
  this.triggerSpectralEnvelope();
  this.triggerFilterEnvelope();
};

Voice.prototype.triggerCarrierEnvelope = function() {
  var param = this.carrierOscGain.gain;
  var now = this.context.currentTime;

  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);

  // brass			  
  param.linearRampToValueAtTime(1, now + this.AmpEnvAttackTime);
  param.exponentialRampToValueAtTime(this.AmpEnvSustainLevel, now + this.AmpEnvDecayTime);
};

Voice.prototype.triggerSpectralEnvelope = function() {
  var param = this.modulatingOscGain.gain;
  var now = this.context.currentTime;
  var A = this.modulationIndex * this.modulationFrequency;

  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);
  

  param.linearRampToValueAtTime(A, now + this.IndexAttackTime);
  param.exponentialRampToValueAtTime(A * this.IndexSustainLevel, now + this.IndexDecayTime);
};

Voice.prototype.triggerFilterEnvelope = function() {
  var param = this.lowpassfilter.frequency;
  var now = this.context.currentTime;

  param.cancelScheduledValues(now);
  param.setValueAtTime(2000, now);
  param.exponentialRampToValueAtTime(500, now + 0.5);
};

Voice.prototype.off = function() {
	  var param = this.carrierOscGain.gain;
	  var now = this.context.currentTime;
  param.exponentialRampToValueAtTime(0.001, now + this.AmpEnvReleaseTime);
  this.carrierOsc.stop(now + this.IndexReleaseTime);

  param = this.modulatingOscGain.gain;
  param.exponentialRampToValueAtTime(0.001, now + this.IndexReleaseTime);
  this.modulatingOsc.stop(now + this.AmpEnvReleaseTime);
};

var FmSynth = function(context, parameters) {
  this.context = context;
  this.voices = {};
  this.parameters = parameters;
};

FmSynth.prototype.noteOn = function(midi_note_number) {
  var frequency = this.midiNoteNumberToFrequency(midi_note_number);

  this.voices[midi_note_number] = new Voice(this.context, frequency, this.parameters)
  this.voices[midi_note_number].on();
};

FmSynth.prototype.midiNoteNumberToFrequency = function(midi_note_number) {
  var f_ref = 440;
  var n_ref = 57;
  var a = Math.pow(2, 1/12);
  var n = midi_note_number - n_ref;
  var f = f_ref * Math.pow(a, n);

  return f;
};

FmSynth.prototype.noteOff = function(midi_note_number) {
  this.voices[midi_note_number].off();
};

var brass_params = {
	presetName: "Brass",
	carrierModulationRatio: 1,
	modulationIndex: 5,
	IndexAttackTime: 0.2,
	IndexDecayTime: 0.3,
	IndexSustainLevel: 0.9,
	IndexReleaseTime: 1,
	AmpEnvAttackTime: 0.2,
	AmpEnvDecayTime: 0.3,
	AmpEnvSustainLevel: 0.9,
	AmpEnvReleaseTime: 0.5
};

// Electroc Piano
var ep_params = {
	presetName: "Electric Piano",
	carrierModulationRatio: 1/10,
	modulationIndex: 3,
	IndexAttackTime: 0,
	IndexDecayTime: 3,
	IndexSustainLevel: 0.001,
	IndexReleaseTime: 0.1,
	AmpEnvAttackTime: 0,
	AmpEnvDecayTime: 3,
	AmpEnvSustainLevel: 0.001,
	AmpEnvReleaseTime: 0.1
};

// add presets
var presets = [];
presets.push(brass_params);
presets.push(ep_params);

var synth;

// select a preset
window.onload=function(){
	var presetSelect = document.getElementById("PresetDropDown");
	for (var i in presets) {
		var option = document.createElement("option");
		option.text = presets[i].presetName;
		option.value = i;
		presetSelect.appendChild(option);
	}
	presetSelect.addEventListener("change", changePreset, false);
	
	// default
	synth = new FmSynth(context, presets[0]);
}

function changePreset(e){
	var presentValue = e.target.value;		
	synth = new FmSynth(context, presets[presentValue])
}


var getMIDINumOfNote = function (note) {
	var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
	key_number,
	octave;

	if (note.length === 3) {
		octave = note.charAt(2);
	} else {
		octave = note.charAt(1);
	}

	key_number = notes.indexOf(note.slice(0, -1));

	if (key_number < 3) {
		key_number = key_number + 12 + ((octave - 1) * 12) + 1;
	} else {
		key_number = key_number + ((octave - 1) * 12) + 1;
	}

	return (key_number+20);
};


// Qwerty-Hancock note on/off handlers	
keyboard.keyDown = function (note, frequency) {
	
	synth.noteOn(getMIDINumOfNote(note));
	
};

keyboard.keyUp = function (note, frequency) {
	
	synth.noteOff(getMIDINumOfNote(note));
};
	