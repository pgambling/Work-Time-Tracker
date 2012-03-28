require.config({
  paths: {
    jquery: 'libs/jquery/1.7.1/jquery-1.7.1.min',
    underscore: 'libs/underscore/1.3.1-amdjs/underscore-min',
    backbone: 'libs/backbone/0.9.2-amdjs/backbone'
  }
});

require(['views/app'], function(AppView){
  $(function () {
	var app_view = new AppView();
  });
});
