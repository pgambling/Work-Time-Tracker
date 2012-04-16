var app = {};

app.projects = [
	'iCHEM',
	'iLEVEL',
	'iSYTE',
	'iLEVEL',
	'HF Hybrid Controller',
	'iChem C1D2',
	'Croft Prod. Dehydrator Auto Sys',
	'EFM3000',
	'ACiC & iCConnect',
	'iNodes/BackOffice',
	'LL III & AutoCycle',
	'RTU 5x00',
	'CBM',
	'AS Host Development',
	'Customer Support',
	'Testing Support',
	'Third Party Host Support',
	'Repair/Maint/Manufacturing',
	'Training \\ Personal Development',
	'Meetings (Non-Project)',
	'Admin \\ Other General Overhead',
	'Tools \\ Servers \\ Infrastructure',
	'Time Off (PTO/Other)',
	'Holiday'
];

app.onProjectStart = function () {
	var newProjectName = app.$selectProject.val();

	console.log("Start project " + newProjectName);
	app.updateProject(newProjectName, 'start');
};

app.onProjectStop = function () {
	var projectName = app.$selectProject.val();
	console.log("Stop project " + projectName);

	app.updateProject(projectName, 'stop');
};

app.onLunchStart = function () {
	console.log("Lunch time!");
	app.updateProject('lunch', 'start');
};

app.onLunchEnd = function () {
	console.log("Lunch is over.");
	app.updateProject('lunch', 'stop');
};

app.showReport = function (data) {
	var linesInReport = [],
		millisecondsInHour = 1000 * 60 * 60,
		totalHours = 0;

	for(var project in data.timePerProject) {
		var hours = data.timePerProject[project] / millisecondsInHour;
		linesInReport.push(project + ': ' + hours.toFixed(2));
		totalHours += hours;
	}
	linesInReport.unshift('-- Project Times --');
	linesInReport.unshift('Total Hours: ' + totalHours.toFixed(2));
	linesInReport.unshift('End Time: ' + data.endTime);
	linesInReport.unshift('Start Time: ' + data.startTime);

	var list = $('<ul>');
	linesInReport.forEach(function (line) {
		$('<li>').text(line).appendTo(list);
	});

	$('#divReport').html(list);
};

app.thisWeek = function () {
	var startOfWeek = new Date(),
		endOfWeek = new Date(),
		dayOfWeek = startOfWeek.getDay();
	
	var daysSinceStartOfWeek = dayOfWeek ? dayOfWeek-1 : 6;
	startOfWeek.setDate(startOfWeek.getDate() - daysSinceStartOfWeek);
	startOfWeek.setMilliseconds(0);
	startOfWeek.setSeconds(0);
	startOfWeek.setMinutes(0);
	startOfWeek.setHours(0);

	var daysUntilEndOfWeek = dayOfWeek ? 7 - dayOfWeek : 0;
	endOfWeek.setDate(endOfWeek.getDate() + daysUntilEndOfWeek);
	endOfWeek.setMilliseconds(999);
	endOfWeek.setSeconds(59);
	endOfWeek.setMinutes(59);
	endOfWeek.setHours(23);

	return { start: startOfWeek.toJSON(), end: endOfWeek.toJSON()};
};

app.onWeeklyReport = function () {
	console.log("Get weekly report");
	$.get('/reports/projecttotals', app.thisWeek(), app.showReport);
};

// Test code
app.createUser = function (name) {
	$.ajax({
		type: 'PUT',
		url: '/users/' + name,
		data: {},
		success: function (data) { console.log(data); }
	});
};

app.getProjects = function () {
	$.get('/projects', function (data) {
		console.log(data);
	});
};

app.getProject = function (projectName) {
	$.get('/projects/'+projectName, function (data) {
		console.log(data);
	});
};

app.updateProjectStatus = function (projectName) {
	app.$currentProjectName.text(projectName);
	$('#projectText').text(projectName === "lunch" ? "Currently out to" : "Current project is");
	app.$divCurrentProject.toggle(projectName.length > 0);
};

app.updateProject = function(projectName, actionStr) {
	var oldProjectName = app.$currentProjectName.text();

	$.post('/projects/'+projectName, { action: actionStr }, function(data) {
		console.log("updateProject: " + data);
	})
	.error(function () {
		app.updateProjectStatus(oldProjectName);
	});

	// Optimistically change the UI
	//
	app.updateProjectStatus(actionStr === 'stop' ? '' : projectName);
};

$(function () {
	app.$selectProject = $('#selectProject');
	app.$currentProjectName = $('#currentProjectName');
	app.$divCurrentProject = $('#divCurrentProject');

	app.updateProjectStatus(app.$currentProjectName.text());

	app.projects.forEach(function (projectName) {
		$('<option />').text(projectName).appendTo(app.$selectProject);
	});

	$('#btnProjectStart').on('click', app.onProjectStart);
	$('#btnLunchStart').on('click', app.onLunchStart);
	$('#btnLunchEnd').on('click', app.onLunchEnd);
	$('#btnProjectStop').on('click', app.onProjectStop);

	$('#btnWeeklyReport').on('click', app.onWeeklyReport);

	$("#divStatus")
	.ajaxStart(function () {
		$(this)
		.removeClass("error")
		.text("Sending...");
	})
	.ajaxSuccess(function () {
		$(this)
		.text('');
	})
	.ajaxError(function(e, jqxhr) {
		$(this)
		.addClass("error")
		.text("Request failed: " + jqxhr.statusText);
	});
	var $projectsForWeek = $("#linkToThisWeeksTimes");
	var href = $projectsForWeek.attr('href');
	dateRange = app.thisWeek();
	$projectsForWeek.attr('href', href + '?start=' + dateRange.start + '&end=' + dateRange.end); 
});
