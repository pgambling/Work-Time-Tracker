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

var getFiltersFromRequest = function (req) {
  var retObj = {};

  if(req.query.start) retObj.start = new Date(req.query.start);
  if(req.query.end) retObj.end = new Date(req.query.end);

  return retObj;
};

routes.getProjectTotals = function (req, res) {
	var filters = getFiltersFromRequest(req);
	
	models.ProjectWork.getProjectsForUser(g_username, filters,
	function (projects) {
		var timePerProject = { startTime: filters.start, endTime: filters.end };
		projects.forEach(function(project) {
      var start = filters.start,
          end = filters.end;
      
      if(project.start && project.start > start) {
        start = project.start;
      }

      if(project.end && project.end < end) {
        end = project.end;
      }

			if(!timePerProject[project.name]) timePerProject[project.name] = 0;

			timePerProject[project.name] += end - start;
		});

		res.send(timePerProject);
	});
};

routes.getAllProjects = function (req, res) {
  models.ProjectWork.getProjectsForUser(g_username,
  // TODO Fix this - models.ProjectWork.getProjectsForUser(g_username, getFiltersFromRequest(req),
  function (projects) {
    res.render('editProjects.html', {projects: projects});
  });
};

routes.saveProject = function (req, res) {
  models.ProjectWork.saveProject(req.params.projectId, req.body, function () {
    res.send(204);
  });
};

module.exports = routes;