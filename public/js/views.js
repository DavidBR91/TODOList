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
    $('#deleteList').bind("click", function (e) {
      var index = $('.active').index() / 2;
      if (index === 0) {
        alert('No se puede borrar la lista principal');
      }
      else {
        var list = lists.at(index);
        lists.remove(list);
        list.destroy();
        $('.listElement').first().parent().addClass('active');
        changeList(lists.at(0).get('name'));
      }
    });
    //console.log($(template).find('input'));
    var inputs = $(template).find('input');
    for (var i = 0; i < inputs.length; i++) {
      inputs.eq(i).change(handler)
    }
    $(template).find('input').bind("click tap touchend", handler);
    //template.find('input').change(handler);

    return this;
  }
});
var inDes = $('#inputDescription');
var inLimD = $('#inputLimitDay');
var inLimM = $('#inputLimitMonth');
var inLimY = $('#inputLimitYear');
var inComp = $('#inputCompleted');
var inExpD = $('#inputExpectedDays');

var TasksView = Backbone.View.extend({
  initialize:function () {
    this.model.bind('add', this.render, this);
    this.model.bind('remove', this.render, this);
    this.model.bind('change', this.render, this);
  },
  render:function () {
    var taskArray = [];
    this.$el.empty();
    this.model.each(function (task) {
      taskArray.push({name:task.get('name'), limitDate:task.get('expiration_date'), completed:task.get('completed'), description:task.get('description'), favorite:task.get('favorite')});
    });
    var template = _.template($("#taskRowTemplate").html(), {tasks:taskArray});
    this.$el.append(template);
    $('[rel=tooltip]').tooltip();
    $('.task:not(.addTask)').bind("click tap touchend", function (event) {
      var $target = $(event.target);
      var tasks = lists.at($('.active').index() / 2).get('tasks');
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
        $('#inputTitle').val(taskName);
        $('#taskOptionsLabel').text(taskName);
        var date = new Date(task.get('expiration_date'));
        inDes.val(task.get('description'));
        inLimD.val(date.getDate());
        inLimM.val(date.getMonth() + 1);
        inLimY.val(date.getFullYear());
        inExpD.val(task.get('expectedDays'));
        (task.get('completed')) ? inComp.attr('checked', true) : inComp.attr('checked', false);
      }
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
