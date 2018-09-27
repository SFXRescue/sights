/*
	Created by the Semi-Autonomous Rescue Team
	Licensed under GNU General Public License 3.0
	
	Mainly based off https://github.com/luser/gamepadtest created in 2013 by Ted Mielczarek (released as CC0)
	Current code borrows some constants from Dan Cox (videlais) https://gist.github.com/videlais/8110000
	
*/

var ip = "10.0.2.4";//window.location.hostname;

var haveEvents = "GamepadEvent" in window;
var haveWebkitEvents = "WebKitGamepadEvent" in window;
var controllers = {};
var rAF =
	window.mozRequestAnimationFrame ||
	window.requestAnimationFrame;

var select_pressed = false;
	
var BUTTONS = {
	FACE_0: 0,
	FACE_1: 1,
	FACE_2: 2,
	FACE_3: 3,
	LEFT_BUMPER: 4,
	RIGHT_BUMPER: 5,
	LEFT_TRIGGER: 6,
	RIGHT_TRIGGER: 7,
	SELECT: 8,
	START: 9,
	LEFT_STICK: 10,
	RIGHT_STICK: 11,
	PAD_UP: 12,
	PAD_DOWN: 13,
	PAD_LEFT: 14,
	PAD_RIGHT: 15,
	CENTER_BUTTON: 16
};

var message = {
	left_axis_x : 0,
	left_axis_y : 0,
	last_dpad: 'none',
	button_LS : false,
	button_A : false,
	button_B : false,
	button_X : false,
	button_Y : false,
	left_trigger : 0,
	right_trigger : 0,
	left_bumper : false,
	right_bumper : false,
	flipped : false
}

console.log("Attempting to connect to the websocket server");
var controlSocket = new WebSocket("ws://" + ip + ":5555");

//Log to the console the result of the socket connection attempt. Useful for troubleshooting.
function socketState() {
	var state = controlSocket.readyState
	switch (state) {
		case 0:
			return "Connecting (The connection is not yet open)";
		case 1:
			return "Open (The connection is open and ready to communicate)";
		case 2:
			return "Closing (The connection is in the process of closing)";
		case 3:
			return "Closed (The connection is closed or couldn't be opened)";
	}
}
console.log("Attempt result: " + socketState());

function connectHandler(e) {
	addGamepad(e.gamepad);
}

function addGamepad(gamepad) {
	document.getElementById("start").innerHTML = "Controller connected";
	controllers[gamepad.index] = gamepad;
	rAF(updateStatus);
	console.log("Controller connected");
}

function disconnectHandler(e) {
	removeGamepad(e.gamepad);
}

function removeGamepad(gamepad) {
	var d = document.getElementById("controller" + gamepad.index);
	document.body.removeChild(d);
	delete controllers[gamepad.index];
}

function getButton(controller, id) {
	var val = controller.buttons[BUTTONS[id]];
	var pressed = val == 1.0;
	if (typeof val == "object") {
		pressed = val.pressed;
		val = val.value;
	}
	if (pressed) {
		return true;
	} else return false;
}

function getTrigger(controller, id) {
	var button = controller.buttons[BUTTONS[id]];
	if (typeof button == "object") {
		return button.value.toFixed(1);
	}
}

function updateStatus() {
	scanGamepads();
	
	for (j in controllers) {
		var controller = controllers[j];
		
		// Basic implementation of a button as a toggle
		if (getButton(controller, "SELECT")) {
			select_pressed = true;
		} else if (select_pressed == true) {
			select_pressed = false;
			message.flipped = !message.flipped;

			// Handle flipping
			if (message.flipped) {
				document.getElementById("camera_front").style = "transform: scale(-1, -1);";
				document.getElementById("camera_left").style = "transform: scale(-1, -1);";
				document.getElementById("camera_right").style = "transform: scale(-1, -1);";
				document.getElementById("camera_back").style = "transform: scale(-1, -1);";
				// Swap left and right
				document.getElementById("camera_left").src = "http://" + ip + ":8082";
				document.getElementById("camera_right").src = "http://" + ip + ":8083";
				
			} else {
				document.getElementById("camera_front").style = "";
				document.getElementById("camera_left").style = "";
				document.getElementById("camera_right").style = "";
				document.getElementById("camera_back").style = "";
				// Swap left and right
				document.getElementById("camera_left").src = "http://" + ip + ":8083";
				document.getElementById("camera_right").src = "http://" + ip + ":8082";
			}
		}
		
		message.button_A = getButton(controller, "FACE_0");
		message.button_B = getButton(controller, "FACE_1");
		message.button_X = getButton(controller, "FACE_2");
		message.button_Y = getButton(controller, "FACE_3");
		
		message.button_LS = getButton(controller, "LEFT_STICK");
		
		message.left_bumper = getButton(controller, "LEFT_BUMPER");
		message.right_bumper = getButton(controller, "RIGHT_BUMPER");
		
		message.left_trigger = getTrigger(controller, "LEFT_TRIGGER");
		message.right_trigger = getTrigger(controller, "RIGHT_TRIGGER");

		for (var i = 0; i < controller.axes.length; i++) {
			if (i == 0) message.left_axis_x = controller.axes[i].toFixed(1);
			if (i == 1) message.left_axis_y = controller.axes[i].toFixed(1);
		}
	}
	//console.log(JSON.stringify(message));
	if (controlSocket.readyState == 1) 
		controlSocket.send(JSON.stringify(message));
	
	rAF(updateStatus);
}

function scanGamepads() {
	var gamepads = navigator.getGamepads
		? navigator.getGamepads()
		: navigator.webkitGetGamepads
			? navigator.webkitGetGamepads()
			: [];
	for (var i = 0; i < gamepads.length; i++) {
		if (gamepads[i]) {
			if (!(gamepads[i].index in controllers)) {
				addGamepad(gamepads[i]);
			} else {
				controllers[gamepads[i].index] = gamepads[i];
			}
		}
	}
}

if (haveEvents) {
	window.addEventListener("gamepadconnected", connectHandler);
	window.addEventListener("gamepaddisconnected", disconnectHandler);
} else if (haveWebkitEvents) {
	window.addEventListener("webkitgamepadconnected", connectHandler);
	window.addEventListener("webkitgamepaddisconnected", disconnectHandler);
} else {
	setInterval(scanGamepads, 500);
}
