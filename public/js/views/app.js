define([
  'jquery',
  'underscore',
  'backbone',
  'collections/projecttimes',
  'views/projecttime'
  ], function($, _, Backbone, ProjectTimes, ProjectTimeView) {
  var AppView = Backbone.View.extend({

    el: $("#mainApp"),

    // Template to show total and per project times for report
    reportTotalsTemplate: _.template($('#reportTotalsTemplate').html()),

    events: {
      'click button.StartProject': 'startProject',
      'click button.StartLunch': 'startLunch',
      'click button.Today': 'showTodaysTimes',
      'click button.Week': 'showTimesForThisWeek'
    },

    initialize: function() {
      // The sorted order of project times matters, so
      // always re-render the view
      ProjectTimes.on('all', this.render, this);

      this.showTodaysTimes();
    },

    // Update the report and time totals
    render: function() {
      var currentProject = ProjectTimes.currentProject();
      var $divCurrentProject = this.$('#divCurrentProject');
      if(currentProject) {
        $divCurrentProject.find('#currentProjectName').html(currentProject.escape('name'));
        $divCurrentProject.show();
      }
      else {
        $divCurrentProject.hide();
      }

      ProjectTimes.each(function (project) {
        var view = new ProjectTimeView({model: project});
        this.$("#projectTimesList").append(view.render().el);
      });

      this.$('#reportTotals').html(this.reportTotalsTemplate({
        total: 'TODO',
        perProjectTotals: {
          'iSyte': 'TODO',
          'lunch': 'TODO'
        }
      }));

      return this;
    },

    startProject: function () {
        ProjectTimes.create({
          name: this.$('#selectProject').val(),
          start: (new Date()).toString()
        });
    },

    startLunch: function () {

    },

    showTodaysTimes: function () {
      ProjectTimes.fetch(); // TODO
    },

    showTimesForThisWeek: function () {
      
    }

  });
  return AppView;
});
