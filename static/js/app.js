var app = {};

app.projects = [
	'iSyte',
	'AS Host',
	'Backoffice'
];

app.onProjectStart = function () {
	console.log("Start project " + app.$selectProject.val());
};

app.onProjectStop = function () {
	console.log("Stop project " + app.$selectProject.val());
};

app.onLunchStart = function () {
	console.log("Lunch time!");
};

app.onLunchEnd = function () {
	console.log("Lunch is over.");
};

$(function () {
	app.$selectProject = $('#selectProject');
	app.projects.forEach(function (projectName) {
		$('<option />').text(projectName).appendTo(app.$selectProject);
	});

	$('#btnProjectStart').on('click', app.onProjectStart);
	$('#btnLunchStart').on('click', app.onLunchStart);
	$('#btnLunchEnd').on('click', app.onLunchEnd);
	$('#btnProjectStop').on('click', app.onProjectStop);
});