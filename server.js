var application_root = __dirname,
  express = require("express"),
  path = require("path"),
  mongoose = require('mongoose');

var app = express.createServer();

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


app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('view engine', 'ejs');
  app.set('view options', { layout: false });
  app.register('.html', require('ejs'));
});

app.get('/', function(req, res){
  res.render('index.html');
});

var g_userName = 'pgambling'; // TODO Hardcoded for now until I add auth support

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

app.post('/projects/:projectName', function(req, res) {
  User.findOne({userName: g_userName})
  .populate('_currentProject')
  .run(function(err, user) {
    if(err) return;

    var bStartingProject = req.body.action === "start",
        currentProject = user._currentProject,
        projectName = req.params.projectName,
        now = new Date();

    if(currentProject) {
      // Bail if the user already started this project
      //
      if(bStartingProject && projectName === currentProject.name) return;

      // Stop the current project because we either stopped the current one or started a new one
      //
      currentProject.end = now;
      currentProject.save();

      if(!bStartingProject) {
        user._currentProject = null; // TODO Can I do this?
        user.save();
        return;
      }
    }
    else {
      // Bail if there is no project to stop
      //
      if(!bStartingProject) return;
    }

    // Start a new project
    //
    var newProject = new ProjectWork({
      userName: g_userName,
      name: projectName,
      start: now
    });
    newProject.save(function (err) {
      if(err) return;
      user._currentProject = newProject;
      user.save();
    });
  });
});

app.listen(3000);