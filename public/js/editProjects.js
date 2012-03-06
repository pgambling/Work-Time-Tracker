var app = {};

app.saveProject = function (id, project, cb) {
	$.ajax({
		type: 'PUT',
		url: '/projects/' + id,
		data: project,
		success: cb
	});
};

app.createNewProject = function(id, project, cb) {
	$.post('/projects/', project, cb);
};

$(function () {
	$('#projectList')
	.on('change', 'input', function () {
		$(this).parent().children('button.save').show();
	})
	.on('click', 'button.save', function () {
		var $saveBtn = $(this),
			$projectListItem = $saveBtn.parent(),
			project = {
				name: $projectListItem.children('input.projectName').val(),
				start: $projectListItem.children('input.startTime').val(),
				end: $projectListItem.children('input.endTime').val()
			},
			projectId = $projectListItem.data('project-id'),
			serverAction = projectId ? app.saveProject : app.createNewProject;

		serverAction(projectId, project, function () { $saveBtn.hide(); });
	})
	.on('click', 'button.delete', function () {
		var $projectToDelete = $(this).parent();

		$.ajax({
			type: 'DELETE',
			url: '/projects/' + $projectToDelete.data('project-id'),
			success: function () { $projectToDelete.remove(); }
		});
	});
});