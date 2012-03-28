define([
  'jquery',
  'underscore',
  'backbone'
  ], function($, _, Backbone){
  var ProjectTimeView = Backbone.View.extend({

    tagName:  "tr",

    // Template to show project time submissions
    template: _.template($('#projectTimeTemplate').html()),

    MS_IN_HOUR: 1000*60*60,

    events: {
      "click button.editProject": "edit"
    },

    initialize: function() {
        // On model remove, delete this view
    },

    // Re-render the contents of the todo item.
    render: function() {
      var startDate = new Date(this.model.get('start'));

      var displayData = {
        projectName: this.model.escape('name'),
        date: startDate.toLocaleDateString(),
        end: 'In progress',
        hours: ''
      };

      displayData.start = startDate.toLocaleTimeString();

      if(this.model.has('end')) {
        var endDate = new Date(this.model.get('end'));
        displayData.end = endDate.toLocaleTimeString();
        displayData.hours = ((endDate - startDate) / this.MS_IN_HOUR).toFixed(2);
      }

      this.$el.html(this.template(displayData));
      return this;
    },

    edit: function () {

    }
  });
  return ProjectTimeView;
});
