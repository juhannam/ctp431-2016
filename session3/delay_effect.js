	var context = new AudioContext();

	// Buffer source
	var source = null;
	var myAudioBuffer = null;
	var loopPlayBack = false;

	// delay effect
	var delay = context.createDelay();
	var feedbackGain = context.createGain();
	
	// default
	var delay_params = {
		delayTime : 0.5,
		feedbackGain : 0.5
	}
	
	window.onload=function(){
		// select a file 
		var control = document.getElementById("fileChooseInput");
		control.addEventListener("change", fileChanged, false);
		
		// link delay GUI parameters to delay and gain nodes
		var delayTimeSlider = document.getElementById("delayTimeSlider");
		delay_params.delayTime = delayTimeSlider.value;
		delayTimeSlider.addEventListener("change", changeDelayTime, false);

		var feedbackGainSlider = document.getElementById("feedbackGainSlider");
		delay_params.feedbackGain = feedbackGainSlider.value;
		feedbackGainSlider.addEventListener("change", changeFeedbackGain, false);

		updateDelay();	
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

	function changeDelayTime(e){
		var delayTime = e.target.value;		
		delay_params.delayTime = delayTime;		
		updateDelay(); 		
	}

	function changeFeedbackGain(e){
		var feedbackGain = e.target.value;		
		delay_params.feedbackGain = feedbackGain;		
		updateDelay(); 		
	}

	// update delay parameters
	function updateDelay() { 	
		// update filter parameters
		delay.delayTime.value = delay_params.delayTime;
		feedbackGain.gain.value  = delay_params.feedbackGain ;
	}
			
	function playSound(anybuffer) {
		// create buffersource
		source = context.createBufferSource();
		source.buffer = anybuffer;
		source.loop = loopPlayBack;

		// plug-in delay
		source.connect(delay);
		delay.connect(context.destination);
		delay.connect(feedbackGain);
		feedbackGain.connect(delay);

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
