/*
	Created by the Semi-Autonomous Rescue Team
	Licensed under GNU General Public License 3.0

*/

var ip = window.location.hostname;

var performanceSocket = new WebSocket("ws://" + ip + ":5558");

performanceSocket.onmessage = function(event){

	var str = event.data;

	var obj = JSON.parse(str);

	var memory_total = obj.memory_total;
	var memory_used = obj.memory_used;
	var cpu_percent = obj.cpu_percent;
	var highest_temp = obj.highest_temp;
	var uptime = obj.uptime;
	
	// This stuff here does a lot of fancy maths to make sure that any device can be used and statistics should report correctly. 
	// If there is a problem with a specific piece of hardware, please contact the Jack Williams with the problem and the specifications of the hardware you are using.
	var memory_total = Math.round(obj.memory_total/1048576);
	var memory_used = Math.round(obj.memory_used/1048576);
	var cpu_percent = Math.round(obj.cpu_percent);
	var highest_temp = Math.round(obj.highest_temp);
	var uptime = Math.round(obj.uptime);

	// Fancy stuff to display in megabytes if the used RAM is less than a gigabyte.
	if (memory_used < 1024) {
		document.getElementById("ram").innerHTML = memory_used + " MB";
	}
	else {
		document.getElementById("ram").innerHTML = (memory_used/1024).toFixed(2) + " GB";
	}

	document.getElementById("ramPercentage").className = "c100 big orange p" + Math.round((memory_used/memory_total)*100);

	document.getElementById("cpu").innerHTML = cpu_percent + "%";
	document.getElementById("cpuPercentage").className = "c100 big orange p" + cpu_percent;

	document.getElementById("cpuTemp").innerHTML = highest_temp + "&degC";
	document.getElementById("cpuTempPercentage").className = "c100 big orange p" + highest_temp;

	document.getElementById("uptime").innerHTML = new Date(1000 * uptime).toISOString().substr(11, 8) + "";
}
