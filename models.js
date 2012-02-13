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
@param userName - Find projects belonging to this user.
@param filters - (optional) Additional filters to apply to the query
					{ start, end }
@param callback
*/
models.ProjectWork.getProjectsForUser = function (userName) {
	var callback = arguments[arguments.length-1],
		query = this.find().where('username', userName);

	if(arguments.length >= 3) {
		var params = arguments[1],
			timeSpan = {};

		if(params.start) timeSpan['$gte'] = params.start;
		if(params.end) timeSpan['$lte'] = params.end;

		query.or([{start: timeSpan}, {end: timeSpan}]);
	}

	query.run(function (err, projects) {
		if(err) throw err;
		callback(projects);
	});
};

models.User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  _currentProject: { type: mongoose.Schema.ObjectId, ref: 'ProjectWork'}
}));

models.User.getUser = function (userName, callback) {
  this.findOne({userName: userName})
  .populate('_currentProject')
  .run(callback);
};

module.exports = models;