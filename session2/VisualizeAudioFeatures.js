//
// "main" file to visualize audio features 
//
// refer to some code from https://webaudiodemos.appspot.com/pitchdetect/

var context;
var source = null;
var myAudioBuffer = null;

var sourceNode = null;
var mediaSourceNode = null;
var analyser = null;


var loudness_view;
var loudness_value;

var pitch_view;
var pitch_value;

var sc_view;
var sc_value;

var WIDTH = 360;
var HEIGHT = 320;
var SOUND_METER_WIDTH = 100;
var SOUND_METER_HEIGHT = HEIGHT;
var SOUND_METER_MIN_LEVEL = -48.0;  // dB

var micOn = false;
var filePlayOn = false;

var loudness_ani_id;
var pitch_ani_id;
var sc_ani_id;

// load demo audio feils
var demo_buffer;

window.onload=function(){

	var mic = document.getElementById("micInput");
	mic.addEventListener("click", playMic, false);

	var demoAudio = document.getElementById("demoAudio");
	demoAudio.addEventListener("click", playFile, false);

	loudness_view = document.getElementById("loudnessView");
	loudness_value = document.getElementById("loudnessValue");
	loudness_view.width =  WIDTH;
	loudness_view.height = HEIGHT;

	pitch_view = document.getElementById("pitchView");
	pitch_value = document.getElementById("pitchValue");
	pitch_periodicity = document.getElementById("pitchPeriodicity");
	pitch_view.width =  WIDTH;
	pitch_view.height = HEIGHT;

	sc_view = document.getElementById("spectralCentroidView");
	sc_value = document.getElementById("spectralCentroidValue");
	sc_view.width =  WIDTH;
	sc_view.height = HEIGHT;
	
	// create audio context
	context = new AudioContext();
	
	// analyzer
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
	analyser.smoothingTimeConstant = 0;		


	var demoReq = new XMLHttpRequest();
    demoReq.open("Get","demo1.wav",true);
    demoReq.responseType = "arraybuffer";
    demoReq.onload = function(){
        context.decodeAudioData(demoReq.response, function(buffer){demo_buffer = buffer;});
    }
    demoReq.send();
}


function draw_loudness() {

	// get samples 
	var data_array = new Float32Array(analyser.frequencyBinCount*2);
	analyser.getFloatTimeDomainData(data_array);

	var loudness = calc_sound_level_dB(data_array)

	// display the loudness value
	loudness_value.innerHTML = 'Level (dB): ' + loudness + ' dB'

	// 2d canvas context
	var drawContext = loudness_view.getContext('2d');
	
	// fill rectangular (for the entire canvas)
	drawContext.fillStyle = 'rgb(0, 0, 0)';
	drawContext.fillRect(0, 0, WIDTH, HEIGHT);

	// fill rectangular (for the sound level)
	var sound_level = (loudness-SOUND_METER_MIN_LEVEL)/(0.0-SOUND_METER_MIN_LEVEL)*SOUND_METER_HEIGHT;
	drawContext.beginPath();
	drawContext.rect(WIDTH/2- SOUND_METER_WIDTH/2, SOUND_METER_HEIGHT, SOUND_METER_WIDTH, -sound_level);
	var my_gradient=drawContext.createLinearGradient(0, SOUND_METER_HEIGHT, 0, SOUND_METER_HEIGHT/4);
	my_gradient.addColorStop(0,'rgb(0, 255, 0)');
	my_gradient.addColorStop(1,'rgb(255, 0, 0)');
	drawContext.fillStyle=my_gradient;
	drawContext.fill();

	// queue for next callback
	loudness_ani_id = window.requestAnimationFrame(draw_loudness);
}


function draw_pitch() {

	// get samples 
	var data_array = new Float32Array(analyser.frequencyBinCount*2);
	analyser.getFloatTimeDomainData(data_array);

	// call pitch detection algorithm
	var pitch_array = detect_pitch(data_array)
	pitch = pitch_array[0];
	periodicity = pitch_array[1];

	// display the pitch value
	if (pitch > 0 ) {
		pitch_value.innerHTML = 'Pitch: ' + pitch + ' Hz'
	}
	else {
		pitch_value.innerHTML = 'No Pitch'			
	}

	pitch_periodicity.innerHTML = 'Periodicity(0-1): ' + periodicity;


	// 2d canvas context
	var drawContext = pitch_view.getContext('2d');
	
	// fill rectangular
	drawContext.fillStyle = 'rgb(0, 0, 0)';
	drawContext.fillRect(0, 0, WIDTH, HEIGHT);


	var pitch_midi = 12.0*Math.log10(pitch/440.0)/Math.log10(2) + 69;
	var center_x = (pitch_midi-40)/(96-40)*WIDTH;
	var center_y = HEIGHT/2;

	var periodicity_map;
	periodicity_map = Math.pow(periodicity,4);

	if (periodicity_map < 0.5) {
		periodicity_map = 0.0;
	}

	var r = 40.0*periodicity_map;

	// circle
	drawContext.beginPath();
	drawContext.arc(center_x,center_y,r,0,2*Math.PI);
	var red = Math.floor(255*periodicity_map);
	drawContext.fillStyle = 'rgb(' + red + ', 0, 0)';
	drawContext.fill();
	
	// queue for next callback
	pitch_ani_id = window.requestAnimationFrame(draw_pitch);
}

function draw_spectralCentroid(input_array) {

	// get samples 
	var data_array = new Float32Array(analyser.frequencyBinCount);
	analyser.getFloatFrequencyData(data_array);

	var spectral_centroid = calc_spectral_centroid(data_array);

	sc_value.innerHTML = 'Spectral Centroid: ' + spectral_centroid + ' Hz'

	// 2d canvas context
	var drawContext = sc_view.getContext('2d');
	
	// fill rectangular
	drawContext.fillStyle = 'rgb(0, 0, 0)';
	drawContext.fillRect(0, 0, WIDTH, HEIGHT);


	var pitch_midi = 12.0*Math.log10(spectral_centroid/440.0)/Math.log10(2) + 69;
	var center_x = (pitch_midi-60)/(96-60)*WIDTH;
	var center_y = HEIGHT/2;

	var r = 40.0;

	// circle
	drawContext.beginPath();
	drawContext.arc(center_x,center_y,r,0,2*Math.PI);
	drawContext.fillStyle = 'rgb(255, 255, 0)';
	drawContext.fill();


	// queue for next callback
	sc_ani_id = window.requestAnimationFrame(draw_spectralCentroid);
}


function playMic()
{
    if (filePlayOn) {
    	turnOffFileAudio();
    }

    if (micOn) {
		turnOffMicAudio();
		return;
    }

	if (!navigator.getUserMedia)
		navigator.getUserMedia = (navigator.getUserMedia({audio: true}) || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
							  
	if (!navigator.getUserMedia)
		alert("Error: getUserMedia not supported!");
						
	// get audio input streaming 				 
	navigator.getUserMedia({audio: true}, onStream, onStreamError)

	micOn = true;

	var mic = document.getElementById("micInput");
	mic.innerHTML = 'Mic Off'
}


// success callback
function onStream(stream) {
    mediaSourceNode = context.createMediaStreamSource(stream);
	
	// Connect graph
	mediaSourceNode.connect(analyser);
						  
	// visualize audio
	draw_loudness();
	draw_pitch();	
	draw_spectralCentroid();	
}

// errorCallback			 
function onStreamError(error) {
	console.error('Error getting microphone', error);

	micOn = false;
}


function playFile() {
    if (filePlayOn) {
    	turnOffFileAudio();
    	return;
    }

    if (micOn) {
		turnOffMicAudio();
    }

    sourceNode = context.createBufferSource();

    sourceNode.buffer = demo_buffer;
    sourceNode.connect(context.destination);
    sourceNode.start(0);

	sourceNode.connect(analyser);

	// visualize audio
	draw_loudness();
	draw_pitch();	
	draw_spectralCentroid();

	filePlayOn = true;
	
	var demoAudio = document.getElementById("demoAudio");
	demoAudio.innerHTML = 'Demo Audio Stop'
}


function turnOffMicAudio() {
	var mic = document.getElementById("micInput");		
	mic.innerHTML = 'Mic On'
	mediaSourceNode = null;
	micOn = false;

	stopAnimation();
}

function turnOffFileAudio() {
	var demoAudio = document.getElementById("demoAudio");
	demoAudio.innerHTML = 'Demo Audio Play'
	sourceNode.stop(0);
    sourceNode = null;
    filePlayOn = false;

	stopAnimation();
}

function stopAnimation() {
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        
    window.cancelAnimationFrame(loudness_ani_id);
    window.cancelAnimationFrame(pitch_ani_id);
    window.cancelAnimationFrame(sc_ani_id);	
}


