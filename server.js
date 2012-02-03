var application_root = __dirname,
  express = require("express"),
  path = require("path"),
  mongoose = require('mongoose');

var app = express.createServer();

// model
mongoose.connect('mongodb://localhost/time_tracking');

var ProjectDay = mongoose.model('ProjectDay', new mongoose.Schema({
  user: String,
  date: String,
  projectName: String,
  secondsWorked: Number
}));

var User = mongoose.model('User', new mongoose.Schema({
  username: String,
  currentProjectId: Schema.ObjectId,
  projectStartTime: Date
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

// TODO Add routes to get at db models

app.get('/:userName/:projectName', function(req, res) {
   return ProjectDay.find({user: req.params.userName, projectName: req.params.projectName }, function (err, projects) {
       if(!err) return res.send(projects);
   });
});

// app.get('/project/:name/:date', function(req, res) {

//    return ProjectTime.findOne({projectName: req.params.name, date: req.params.date }, function (err, projects) {
//        if(!err) return res.send(doc);
//    });
// });

app.post('/:userName/start/:projectName', function(req, res) {
  // TODO Get user
  // TODO If currently working another project, stop that one and update its time
  // TODO Can I invoke the "stop" api from here?
  // TODO Create a new project (or find existing one for today?) (record start, stop time pairs?)

  // TODO Update user with current project and current time

  // Save to DB
  var project = new ProjectDay({
    user: req.params.userName,
    date: new Date(),
    projectName: req.params.projectName,
    secondsWorked: 0
  });
  project.save(function (err) {
    if(!err) {
      res.send(project);
    }
  });
});

// app.put('/project/start/:name', function(req, res) {
  // TODO Use this for the manual edit page?
// });

app.listen(3000);