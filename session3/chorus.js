window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

// Buffer source
var sourceNode = null;
var chorusEffect = null;


// Chorus parameters on GUI
var chorusParams = {
	delayTime : 0.03,
	lfoDepth : 0.001,
	lfoRate : 1.5,
	wetDry : 100,
}

var flangerParams = {
	delayTime : 0.003,
	lfoDepth : 0.0015,
	lfoRate : 0.3,
	wetDry : 100,
}


var effectParams = {
	delayTime : 0.03,
	lfoDepth : 0.001,
	lfoRate : 1.5,
	wetDry : 50,
}

var filePlayOn = false;

// load demo audio feils
var demoBuffer;

window.onload=function(){

	var demoAudio = document.getElementById("demoAudio");
	demoAudio.addEventListener("click", playSound, false);


	var chorus = document.getElementById("chorus");
	chorus.addEventListener("click", function(){
			changeEffectPreset(1)	
	}, false); 

	var flanger = document.getElementById("flanger");
	flanger.addEventListener("click", function(){
			changeEffectPreset(2)	
	}, false); 


	// link delay GUI parameters to delay and gain nodes
	var delayTimeSlider = document.getElementById("delayTimeSlider");
	effectParams.delayTime = delayTimeSlider.value;
	delayTimeSlider.addEventListener("change", changeDelayTime, false);

	var delayTimeValueSlider = document.getElementById("delayTimeValue");
	delayTimeValueSlider.innerHTML = Math.round(delayTimeSlider.value*1000) + ' msec';


	var lfoRateSlider = document.getElementById("lfoRateSlider");
	effectParams.lfoRate = lfoRateSlider.value;
	lfoRateSlider.addEventListener("change", changeLFORate, false);

	var lfoRateValueSlider = document.getElementById("lfoRateValue");
	lfoRateValueSlider.innerHTML = lfoRateSlider.value + ' Hz';


	var lfoDepthSlider = document.getElementById("lfoDepthSlider");
	effectParams.lfoDepth = lfoDepthSlider.value;
	lfoDepthSlider.addEventListener("change", changeLFODepth, false);

	var lfoDepthValueSlider = document.getElementById("lfoDepthValue");
	lfoDepthValueSlider.innerHTML = Math.round(lfoDepthSlider.value*100000)/100.0 + ' msec';


	var wetDrySlider = document.getElementById("wetDrySlider");
	effectParams.wetDry = wetDrySlider.value;
	wetDrySlider.addEventListener("change", changeWetDry, false);
	
	var wetDryValueSlider = document.getElementById("wetDryValue");
	wetDryValueSlider.innerHTML = wetDrySlider.value + ' %';


	var demoReq = new XMLHttpRequest();
    demoReq.open("Get","AcousticGuitar.mp3",true);
    demoReq.responseType = "arraybuffer";
    demoReq.onload = function(){
        context.decodeAudioData(demoReq.response, function(buffer){demoBuffer = buffer;});
    }
    demoReq.send();    	
}

//
// Chorus parameter update functions
//

function changeDelayTime(e){
	var delayTime = e.target.value;		
	effectParams.delayTime = delayTime;

	var delayTimeValueSlider = document.getElementById("delayTimeValue");
	delayTimeValueSlider.innerHTML = Math.round(delayTime*1000) + ' msec';

	if (chorusEffect != null) {		
		chorusEffect.updateParams();
	} 		
}

function changeLFORate(e){
	var lfoRate = e.target.value;		
	effectParams.lfoRate = lfoRate;		

	var lfoRateValueSlider = document.getElementById("lfoRateValue");
	lfoRateValueSlider.innerHTML = lfoRate + ' Hz';


	if (chorusEffect != null) {		
		chorusEffect.updateParams(); 		
	}
}

function changeLFODepth(e){
	var lfoDepth = e.target.value;		
	effectParams.lfoDepth = lfoDepth;		

	var lfoDepthValueSlider = document.getElementById("lfoDepthValue");
	lfoDepthValueSlider.innerHTML = Math.round(lfoDepth*100000)/100.0 + ' msec';

	if (chorusEffect != null) {		
		chorusEffect.updateParams(); 		
	}
}

function changeWetDry(e){
	var wetDry = e.target.value;		
	effectParams.wetDry = wetDry;		

	var wetDryValueSlider = document.getElementById("wetDryValue");
	wetDryValueSlider.innerHTML = wetDry + ' %';

	if (chorusEffect != null) {		
		chorusEffect.updateParams(); 		
	}
}

function changeEffectPreset(num) {


	if (num == 1) {
		effectParams.delayTime = chorusParams.delayTime;	
		effectParams.lfoDepth = chorusParams.lfoDepth;	
		effectParams.lfoRate = chorusParams.lfoRate;	
		effectParams.wetDry = chorusParams.wetDry;	
	}
	else if (num == 2) {
		effectParams.delayTime = flangerParams.delayTime;	
		effectParams.lfoDepth = flangerParams.lfoDepth;	
		effectParams.lfoRate = flangerParams.lfoRate;	
		effectParams.wetDry = flangerParams.wetDry;	
	}

	var delayTimeSlider = document.getElementById("delayTimeSlider");
	delayTimeSlider.value = effectParams.delayTime;
	var delayTimeValueSlider = document.getElementById("delayTimeValue");
	delayTimeValueSlider.innerHTML = Math.round(effectParams.delayTime*1000) + ' msec';


	var lfoRateSlider = document.getElementById("lfoRateSlider");
	lfoRateSlider.value = effectParams.lfoRate;
	var lfoRateValueSlider = document.getElementById("lfoRateValue");
	lfoRateValueSlider.innerHTML = effectParams.lfoRate + ' Hz';

	var lfoDepthSlider = document.getElementById("lfoDepthSlider");
	lfoDepthSlider.value = effectParams.lfoDepth;
	var lfoDepthValueSlider = document.getElementById("lfoDepthValue");
	lfoDepthValueSlider.innerHTML = Math.round(effectParams.lfoDepth*100000)/100.0 + ' msec';


	var wetDrySlider = document.getElementById("wetDrySlider");
	wetDrySlider.value = effectParams.wetDry;
	var wetDryValueSlider = document.getElementById("wetDryValue");
	wetDryValueSlider.innerHTML = effectParams.wetDry + ' %';

	if (chorusEffect != null) {		
		chorusEffect.updateParams();
	} 		
}

var Chorus = function(context, inputNode, parameters) {

	this.context = context;
	this.input = inputNode;

	// create nodes
	this.delayLine = context.createDelay();
	this.input.connect(this.delayLine);

	this.LFO = context.createOscillator();
	this.LFOGain = context.createGain();

	this.wetGain = context.createGain(); 
	this.dryGain = context.createGain();
	this.input.connect(this.wetGain);

	this.input.connect(this.dryGain);

	// connect 
	this.delayLine.connect(this.wetGain);
	this.wetGain.connect(context.destination);

	this.LFO.connect(this.LFOGain);
	this.LFOGain.connect(this.delayLine.delayTime);

	this.dryGain.connect(context.destination);
}

Chorus.prototype.updateParams = function () {
	this.delayLine.delayTime.value = effectParams.delayTime;
	this.LFO.frequency.value = effectParams.lfoRate;
	this.LFOGain.gain.value = effectParams.lfoDepth;

	this.wetGain.gain.value = effectParams.wetDry/100.0;
	this.dryGain.gain.value = (100.0-effectParams.wetDry)/100.0;
}


Chorus.prototype.start = function(inputNode) {
	this.LFO.start(0);
};

Chorus.prototype.stop = function() {
	this.LFO.stop(0);
};

// LFO control: https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect(AudioParam)
		
function playSound() {

	if (filePlayOn) {
		stopSound();
		return;
	}

	sourceNode = context.createBufferSource();
	sourceNode.buffer = demoBuffer;
	sourceNode.onended = stopSound;

	chorusEffect = new Chorus(context, sourceNode);

	sourceNode.start();
	
	chorusEffect.updateParams(); 
	chorusEffect.start();	
	
	filePlayOn = true;

	var demoAudio = document.getElementById("demoAudio");
	demoAudio.innerHTML = 'Demo Audio Stop';
}

function stopSound() {
	var demoAudio = document.getElementById("demoAudio");
	demoAudio.innerHTML = 'Demo Audio Play';

	if (sourceNode != null ) {
		sourceNode.stop(0);
		sourceNode = null;
	}

	chorusEffect.stop();			
    
    filePlayOn = false;
}	


