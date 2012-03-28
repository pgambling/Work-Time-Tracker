define([
  'underscore',
  'backbone'
  ], function(_, Backbone) {
	var ProjectTimeModel = Backbone.Model.extend({
		idAttribute: "_id", // Use the mongodb object id directly

		defaults: {
			username: "pgambling",
			start: null,
			end: null,
			name: "Unspecified project"
		}
	});

	return ProjectTimeModel;
});