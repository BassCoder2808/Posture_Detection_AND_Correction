'use strict';

let timeThreshold = 300; // time in ms
let startAlgo = false;
let lastClosedTime,continuous = false;
let body = document.querySelector('body');
let message;


function main() {
	JEEFACETRANSFERAPI.init({
		canvasId: 'canvas',
		NNCpath: 'static/assets/model/',
		callbackReady: function(errCode) {
			if (errCode) {
				console.log('ERROR - cannot init JEEFACETRANSFERAPI. errCode =', errCode);
				errorCallback(errCode);
				return;
			}
			console.log('INFO : JEEFACETRANSFERAPI is ready !!!');
			successCallback();
		} //end callbackReady()
	});
} //end main()

function successCallback() {
	nextFrame();
	document.getElementById('full-page-loader').style.display = 'none';
	body = document.querySelector('body');
	message = document.querySelector('#message');
}

function errorCallback(errorCode) {

}

function nextFrame() {
	if (!startAlgo) {
		return;
	}
	let deltaTime = Date.now() - lastClosedTime;
	if (deltaTime > timeThreshold && continuous) {
		start_alarm();
		// console.log("Alarm Called");
		body.style.background = '#f00';
	} else {
		stop_alarm();
		body.style.background = '#fff';
	}

	if (JEEFACETRANSFERAPI.is_detected()) {
		let rotation = JEEFACETRANSFERAPI.get_rotationStabilized();
		let isHeadPostureOk = isHeadPostureOK(rotation);
		let positionScaleZ = JEEFACETRANSFERAPI.get_positionScale()[2];
		let screenDistanceOK = isScreenDistanceOK(positionScaleZ);

		if (!isHeadPostureOk[0] || !isHeadPostureOk[1] || !isHeadPostureOk[2] || !screenDistanceOK) {
			if (lastClosedTime === undefined || !continuous) lastClosedTime = Date.now(); // Now is the new time
			continuous = true;
			if (message) {
				let messageContent = '';
				if (!screenDistanceOK) {
					messageContent += '<p>Getting too close to the Screen!!!</p>';
				}
				if (!isHeadPostureOk[0]) {
					messageContent += '<p>Head is either too up or too down.</p>';
				}
				if (!isHeadPostureOk[1]) {
					messageContent += '<p>Head is turned too much.</p>';
				}
				if (!isHeadPostureOk[2]) {
					messageContent += '<p>Head is bend towards shoulders.</p>';
				}
				message.innerHTML = messageContent;
			}
		} else {
			if (message) {
				message.innerHTML = '';
			}
			continuous = false;
		}
		console.log('Detected and Face Recpognition On');
	} else {
		console.log('Face Not detected');
	}
	requestAnimationFrame(nextFrame);
}

function start() {
	init_sound();
	startAlgo = true;
	nextFrame();
	document.getElementById('warnings').style.display = 'none';
}
