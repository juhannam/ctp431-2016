window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

// Buffer source
var source = null;
var myAudioBuffer = null;
var loopPlayBack = false;

// convolver
var convolver = context.createConvolver();
var dryGain = context.createGain();
var wetGain = context.createGain();

var impulseResponse = null;


// default
var convolver_params = {
	wetdryRatio : 0.5
}

window.onload=function(){
	// select a file 
	var control = document.getElementById("fileChooseInput");
	control.addEventListener("change", fileChanged, false);
	
	// link delay GUI parameters to delay and gain nodes
	var wetdrySlider = document.getElementById("wetdryRatioSlider");
	convolver_params.wetdryRatio = wetdrySlider.value/1000;
	wetdrySlider.addEventListener("change", changeWetDryRatio, false);

	updateConvolver();	
	loadIumpulseResponse();
	
}

// event handlers
function fileChanged(e){
	var file = e.target.files[0];
	var fileReader = new FileReader();
	fileReader.onload = fileLoaded;
	fileReader.readAsArrayBuffer(file);
}

function fileLoaded(e){
    context.decodeAudioData(e.target.result, function(buffer) {
    	myAudioBuffer = buffer;
    });
}

//load impulse response
function loadIumpulseResponse() {
	var request = new XMLHttpRequest();
	var url = "memchu_ir2.wav";
  	request.open('GET', url, true);
  	request.responseType = 'arraybuffer';
  	request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
		convolver.buffer = buffer;
    });
  }
  request.send();
}	


function changeWetDryRatio(e){
	var wetdryRatio = e.target.value;		
	convolver_params.wetdryRatio = wetdryRatio/1000;		
	updateConvolver(); 		
}

// update convolver parameters
function updateConvolver() { 	
	// update filter parameters
	dryGain.gain.value = 1-convolver_params.wetdryRatio;
	wetGain.gain.value = convolver_params.wetdryRatio;
}
		
function playSound(anybuffer) {
	// create buffersource
	source = context.createBufferSource();
	source.buffer = anybuffer;
	source.loop = loopPlayBack;

	// plug-in convolver
	source.connect(convolver);
	convolver.connect(wetGain);
	wetGain.connect(context.destination);

	source.connect(dryGain);
	dryGain.connect(context.destination);

	source.start();
}

function stopSound() {
	source.stop();
}	

function toggleLoopPlay() {
	if ( loopPlayBack ) {
		loopPlayBack = false;
	}
	else {
		loopPlayBack = true;
	}		
}	
