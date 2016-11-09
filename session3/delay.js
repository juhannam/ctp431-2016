var context = new AudioContext();

// Buffer source
var sourceNode = null;
var delayEffect = null;


// Chorus parameters on GUI
var delayParams = {
	delayTime : 0.5,
	feedbackGain : 0.5,
	wetDry : 50
}

var filePlayOn = false;

// load demo audio feils
var demoBuffer;

window.onload=function(){

	var demoAudio = document.getElementById("demoAudio");
	demoAudio.addEventListener("click", playSound, false);


	// link delay GUI parameters to delay and gain nodes
	var delayTimeSlider = document.getElementById("delayTimeSlider");
	delayParams.delayTime = delayTimeSlider.value;
	delayTimeSlider.addEventListener("change", changeDelayTime, false);

	var delayTimeValueSlider = document.getElementById("delayTimeValue");
	delayTimeValueSlider.innerHTML = Math.round(delayTimeSlider.value*1000) + ' msec';


	var feedbackGainSlider = document.getElementById("feedbackGainSlider");
	delayParams.feedbackGain = feedbackGainSlider.value;
	feedbackGainSlider.addEventListener("change", changeFeedbackGain, false);

	var feedbackGainValueSlider = document.getElementById("feedbackGainValue");
	feedbackGainValueSlider.innerHTML = feedbackGainSlider.value;


	var wetDrySlider = document.getElementById("wetDrySlider");
	delayParams.wetDry = wetDrySlider.value;
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
// Delay parameter update functions
//

function changeDelayTime(e){
	var delayTime = e.target.value;		
	delayParams.delayTime = delayTime;

	var delayTimeValue = document.getElementById("delayTimeValue");
	delayTimeValue.innerHTML = Math.round(delayTime*1000) + ' msec';

	if (delayEffect != null) {		
		delayEffect.updateParams();
	} 		
}

function changeFeedbackGain(e){
	var feedbackGain = e.target.value;		
	delayParams.feedbackGain = feedbackGain;		

	console.log(feedbackGain);

	var feedbackGainValue = document.getElementById("feedbackGainValue");
	feedbackGainValue.innerHTML = feedbackGain;


	if (delayEffect != null) {		
		delayEffect.updateParams(); 		
	}
}

function changeWetDry(e){
	var wetDry = e.target.value;		
	delayParams.wetDry = wetDry;		

	var wetDryValueSlider = document.getElementById("wetDryValue");
	wetDryValueSlider.innerHTML = wetDry + ' %';

	if (delayEffect != null) {		
		delayEffect.updateParams(); 		
	}
}

var Delay = function(context, inputNode, parameters) {

	this.context = context;
	this.input = inputNode;

	// create nodes
	this.delayLine = context.createDelay();
	this.feedbackGain = context.createGain();
	this.wetGain = context.createGain(); 
	this.dryGain = context.createGain();


	// connect 
	this.input.connect(this.delayLine);
	this.delayLine.connect(this.feedbackGain);
	this.feedbackGain.connect(this.wetGain);
	this.feedbackGain.connect(this.delayLine);

	this.input.connect(this.dryGain);

	this.dryGain.connect(this.context.destination);
	this.wetGain.connect(this.context.destination);
}


Delay.prototype.updateParams = function () {
	this.delayLine.delayTime.value = delayParams.delayTime;

	this.feedbackGain.gain.value = delayParams.feedbackGain;

	this.wetGain.gain.value = delayParams.wetDry/100.0;
	this.dryGain.gain.value = (100.0-delayParams.wetDry)/100.0;
}

		
function playSound() {

	if (filePlayOn) {
		stopSound();
		return;
	}

	sourceNode = context.createBufferSource();
	sourceNode.buffer = demoBuffer;
	sourceNode.onended = stopSound;

	delayEffect = new Delay(context, sourceNode);

	sourceNode.start();
	
	delayEffect.updateParams(); 
	
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
    
    filePlayOn = false;
}	


