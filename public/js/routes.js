var Router = Backbone.Router.extend({
  routes:{
    "":"index",
    "admin/user":"admin-user",
    "admin/tasks":"admin-tasks"
  },

  index:function () {
    loadTemplate('index');
  },

  "admin-user" :function () {
    loadTemplate('admin-user');
  },
  "admin-tasks" :function () {
    loadTemplate('admin-tasks');
  }
});

new Router();
Backbone.history.start();

function loadTemplate(name){
  $.get('/tpl/' + name + '.html', function(data){
    $('#content').html(data);
  });
}