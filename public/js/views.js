var ListsView = Backbone.View.extend({
  initialize:function () {
    this.model.bind('add', this.render, this);
    this.model.bind('remove', this.render, this);
  },
  render:function () {
    var listNameArray = [];
    this.$el.empty();
    lists.each(function (list) {
      listNameArray.push({name:list.get('name') });
    });
    var template = _.template($("#listsNavbar").html(), {lists:listNameArray});
    this.$el.append(template);
    $('.listElement').bind("click tap touchend", function (event) {
      var list = $(this).text();
      changeList(list);
    });
    return this;
  }
});

var TasksView = Backbone.View.extend({
  initialize:function () {
    this.model.bind('add', this.render, this);
    this.model.bind('remove', this.render, this);
    this.model.bind('change', this.render, this);
  },
  render:function () {
    var taskArray = [];
    this.$el.empty();

    var collection = this.model;

    var end = (this.options.end < this.model.length) ? this.options.end : this.model.length;

    for (var i = this.options.start; i < end; i++) {
      var task = this.model.at(i);
      taskArray.push({name:task.get('name'), limitDate:task.get('expiration_date'), completed:task.get('completed'), description:task.get('description'), favorite:task.get('favorite')});
    }
    var template = _.template($("#taskRowTemplate").html(), {tasks:taskArray});
    this.$el.append(template);
    var initPos, endPos;
    $(function () {
      $('#taskList').sortable({
        placeholder:"box-placeholder",
        start:function (event, ui) {
          initPos = ui.item.index();
        },
        update:function (event, ui) {
          endPos = ui.item.index();
          collection.reorder(initPos, endPos);
        }
      });
      $('#taskList').disableSelection();
    });
    $('[rel=tooltip]').tooltip();
    $('.task:not(.addTask)').bind("click tap touchend", function (event) {

      var $target = $(event.target);
      var tasks = lists.at($('.nav-list .active').index()).get('tasks');
      var index = $(this).parents('.box').prevAll().length;
      var task = tasks.at(index);
      if ($target.is(".favicon")) {
        task.save({favorite:((task.get('favorite')) ? false : true)}, {wait:false});
        addFavorites(task);
        removeFavorites(task);
      }
      else {
        $('#taskOptions').modal('show')
        var taskName = $(this).data('name');
        var date = new Date(task.get('expiration_date'));
        $('#inputTitle').val(taskName);
        $('#taskOptionsLabel').text(taskName);
        $('#inputDescription').val(task.get('description'));
        $('#inputDate').datepicker({language:'es', weekStart:1});
        $('#inputDate').datepicker('setValue', date);
        $('#inputCompleted').val(task.get('expectedDays'));
        (task.get('completed')) ? $('#inputCompleted').attr('checked', true) : $('#inputCompleted').attr('checked', false);
      }
    });
    $('#newTaskButton').bind('click tap touchend', function () {
      $('#newTaskModal').modal('show');
    });
    return this;
  }
});

var TasksViewFav = Backbone.View.extend({
  render:function () {
    var taskArray = [];
    this.$el.empty();
    this.model.each(function (task) {
      taskArray.push({name:task.get('name'), limitDate:task.get('expiration_date'), completed:task.get('completed'), description:task.get('description'), favorite:task.get('favorite')});
    });
    var template = _.template($("#taskRowTemplate_Fav").html(), {tasks:taskArray});
    this.$el.append(template);

    $('[rel=tooltip]').tooltip();
    return this;
  }
});
