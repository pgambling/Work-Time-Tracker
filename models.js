var mongoose = require('mongoose'),
	models = {};

mongoose.connect('mongodb://localhost/time_tracking');

models.ProjectWork = mongoose.model('ProjectWork', new mongoose.Schema({
  username: String,
  name: String,
  start: Date,
  end: Date
}));

/**
@param username - Find projects belonging to this user.
@param filters -  Additional filters to apply to the query
					{ start, end }
@param callback
*/
models.ProjectWork.getProjectsForUser = function (username, filters, callback) {
	var query = this.find().where('username', username).desc('end');

	if(filters) {
		var timeSpan = {};

		if(filters.start) timeSpan['$gte'] = filters.start;
		if(filters.end) timeSpan['$lte'] = filters.end;

		query.or([{start: timeSpan}, {end: timeSpan}]);
	}

	query.run(function (err, projects) {
		if(err) throw err;
		callback(projects);
	});
};

var updateAndSaveProject = function (project, data, callback) {
	project.name = data.name;
	project.start = new Date(data.start);
	project.end = new Date(data.end);
	project.save(function (err) {
		if(err) throw err;
		callback(project);
	});
};

models.ProjectWork.modifyProject = function (projectId, data, callback) {
	models.ProjectWork.findById(projectId, function (err, project) {
    if(err) throw err;

    updateAndSaveProject(project, data, callback);
  });
};

models.ProjectWork.createNewProject = function (data, callback) {
	var newProject = new models.ProjectWork();
	newProject.username = data.username;
	updateAndSaveProject(newProject, data, callback);
};

models.User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  _currentProject: { type: mongoose.Schema.ObjectId, ref: 'ProjectWork'}
}));

models.User.getUser = function (username, callback) {
  this.findOne({username: username})
  .populate('_currentProject')
  .run(callback);
};

module.exports = models;