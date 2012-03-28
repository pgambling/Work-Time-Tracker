define([
  'backbone',
  'libs/backbone/plugins/localstorage-amd',
  'models/projecttime'
  ], function(Backbone, LocalStore, ProjectTime) {
	var ProjectTimesCollection = Backbone.Collection.extend({
		model: ProjectTime,

		localStorage: new LocalStore("project-times"),

		// Sort by start time in descending order (most recent first)
		comparator: function (projectTime) {
			return new Date(projectTime.get('start')).getTime() * -1;
		},

		currentProject: function () {
			if(this.length === 0) return false;

			var firstProject = this.at(0);

			// The first project is the current project only if there is no end time
			if(firstProject.has('end')) return false;

			return firstProject;
		}
	});

	return new ProjectTimesCollection();
});