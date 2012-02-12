var application_root = __dirname,
  express = require("express"),
  path = require("path"),
  mongoose = require('mongoose');

var app = express.createServer();

var g_userName = 'pgambling'; // TODO Hardcoded for now until I add actual user accounts

// model
mongoose.connect('mongodb://localhost/time_tracking');

var ProjectWork = mongoose.model('ProjectWork', new mongoose.Schema({
  username: String,
  name: String,
  start: Date,
  end: Date // TODO What does this default to?
}));

var User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  _currentProject: { type: mongoose.Schema.ObjectId, ref: 'ProjectWork'}
}));

User.getUser = function (userName, callback) {
  User.findOne({userName: g_userName})
  .populate('_currentProject')
  .run(callback);
};

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
  app.set('view engine', 'ejs');
  app.set('view options', { layout: false });
  app.register('.html', require('ejs'));
});

app.configure('development', function(){
    app.use(express['static'](path.join(application_root, "public")));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express['static'](path.join(application_root, "public"), { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  User.getUser(g_userName, function (err, user) {
      if(err) throw err;

      var projectName = '';
      if(user._currentProject) projectName = user._currentProject.name;

      res.render('index.html', {
        currentProjectName: projectName
      });
  });
});

app.put('/users/:userName', function (req, res) {
  var newUser = new User({ userName: g_userName});
  newUser.save();
});

app.get('/projects', function (req, res) {
  // TODO Add start and end date filtering
  return ProjectWork.find({userName: g_userName}, function (err, projects) {
    if(!err) return res.send(projects);
  });
});

app.get('/projects/:projectName', function(req, res) {
   return ProjectWork.find({userName: g_userName, name: req.params.projectName }, function (err, projects) {
       if(!err) return res.send(projects);
   });
});

var startNewProject = function (user, projectName, startTime, res) {
    var newProject = new ProjectWork({
      userName: user.username,
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

app.post('/projects/:projectName', function(req, res) {
  var now = new Date();

  User.getUser(g_userName, function (err, user) {
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
});

app.listen(3000);