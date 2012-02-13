var models = require('./models'),
	routes = {},
	g_username = 'pgambling'; // TODO Hardcoded for now until I add actual user accounts

routes.getIndex = function (req, res) {
	models.User.getUser(g_username, function (err, user) {
		if(err) throw err;

		var projectName = '';
		if(user && user._currentProject) projectName = user._currentProject.name;

		res.render('index.html', {
			currentProjectName: projectName
		});
	});
};

routes.createUser = function (req, res) {
  var newUser = new models.User({ username: g_username});
  newUser.save();
};

routes.getAllProjects = function (req, res) {
  // TODO Add start and end date filtering
  return models.ProjectWork.find({username: g_username}, function (err, projects) {
    if(!err) return res.send(projects);
  });
};

routes.getProject = function (req, res) {
   return models.ProjectWork.find({username: g_username, name: req.params.projectName }, function (err, projects) {
       if(!err) return res.send(projects);
   });
};

var startNewProject = function (user, projectName, startTime, res) {
    var newProject = new models.ProjectWork({
      username: user.username,
      name: projectName,
      start: startTime
    });
    newProject.save(function (err) {
      if(err) throw err;

      user._currentProject = newProject;
      user.save(function (err) {
        if(err) throw err;

        return res.send();
      });
    });
};

routes.updateProject  = function (req, res) {
  var now = new Date();

  models.User.getUser(g_username, function (err, user) {
    if(err) throw err;

    var bStartingProject = req.body.action === "start",
        currentProject = user._currentProject,
        projectName = req.params.projectName;

    // Bail if there is no project to stop
    //
    if(!currentProject && !bStartingProject) return res.send();

    // Bail if trying to start current project again
    //
    if(bStartingProject && currentProject && projectName === currentProject.name) return res.send();

    if(!currentProject) { return startNewProject(user, projectName, now, res); }

    // Stop the current project because we either stopped the current one or started a new one
    //
    currentProject.end = now;
    currentProject.save(function (err) {
      if(bStartingProject) {
        return startNewProject(user, projectName, now, res);
      }
      else {
        user._currentProject = null;
        user.save(function (err) {
          if(err) throw err;

          return res.send();
        });
      }
    });
  });
};

routes.getProjectTotals = function (req, res) {
	var startTime = new Date(req.query.start),
		endTime = new Date(req.query.end);
		
	models.ProjectWork.getProjectsForUser(g_username, {start: startTime, end: endTime},
	function (projects) {
		var timePerProject = { startTime: startTime, endTime: endTime };
		projects.forEach(function(project) {
			var start = project.start < startTime ? startTime : project.start;
			var end = project.end > endTime ? endTime : project.end;

			if(!timePerProject[project.name]) timePerProject[project.name] = 0;

			timePerProject[project.name] += end - start;
		});

		res.send(timePerProject);
	});
};

module.exports = routes;