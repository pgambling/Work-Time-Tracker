var application_root = __dirname,
  express = require("express"),
  path = require("path"),
  routes = require("./routes");

var app = express.createServer();

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

app.get('/', routes.getIndex);
app.put('/users/:username', routes.createUser);
app.put('/projects/:projectId', routes.saveProject);
app.get('/projects', routes.getAllProjects);
app.get('/reports/projecttotals', routes.getProjectTotals);
app.get('/projects/:projectName', routes.getProject);
app.post('/projects/:projectName', routes.updateProject);

app.listen(3000);