var app = {};

app.projects = [
	'iSyte',
	'AS Host',
	'Backoffice'
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

app.onWeeklyReport = function () {
	console.log("Get weekly report");
	
	$.get('/projects/report', { start: , end: }, function (data) {
	// TODO	
	});
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
});