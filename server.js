var application_root = __dirname,
  express = require("express"),
  path = require("path"),
  mongoose = require('mongoose');

var app = express.createServer();

// model
// mongoose.connect('mongodb://localhost/time_tracking');

// TODO Add some db modelss

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

app.listen(3000);