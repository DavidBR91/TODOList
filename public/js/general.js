var lists=[];
var listsView=[];
var exportList = [];

function equalHeight(group) {
  var tallest = 0;
  group.each(function() {
    var thisHeight = $(this).height();
    if(thisHeight > tallest) {
      tallest = thisHeight;
    }
  });
  group.each(function(){
    $(this).height(tallest);
  });
}
function changeList(list){
  $('#taskList').empty();
  $('#taskListTitle').empty();
  $('#taskListTitle').append('<h1>'+list+'</h1><hr>');
  $('#dropdownLists').val(list);
  var i=0;
  var dropdownIndex=$('#dropdownLists').get(0).selectedIndex;
  $('.active').removeClass('active');
  $('#dropdownLists').removeClass('active');
  $('.listElement').each(function() {
    if(dropdownIndex==i++){
      $(this).parent().addClass('active');
    }
  });
  var selectedList = lists.at($('#dropdownLists').get(0).selectedIndex)
  var modelTasks = selectedList.get('tasks');
  var nameTasks = selectedList.get('name');
  if(nameTasks === 'Favoritos'){
    var tasksView=new TasksViewFav({el: $('#taskList'), model: modelTasks});
  }
  else {
    var tasksView=new TasksView({el: $('#taskList'), model: modelTasks});
  }
  tasksView.render();
}
var List=Backbone.Model.extend({
  idAttribute: '_id',
  parse: function(response) {
    var taskList=[];
    this.url='/list/'+response._id;
    _.each(response.tasks,function(taskid) {
      var task=new Task({listid: response._id, _id: taskid});
      task.fetch({
        success: function(task) {
          addFavorites(task);
        }
      });
      taskList.push(task);
    });
    response.tasks=new TaskList(taskList);
    response.tasks.setParams(response._id,this,response.user);
    return response;
  }
});
var Lists=Backbone.Collection.extend({
  model: List,
  url: '/list',
  comparator: function(list) {
    return list.name
  }
});
var Task=Backbone.Model.extend({
  idAttribute: '_id',
  initialize: function(options) {
    if(typeof options._id!='undefined'){
      this.url='/list/'+options.listid+'/task/'+options._id;
    }
  },
  defaults:{
    name: '',
    description: '',
    expiration_date : new Date(),
    expectedDays: 0,
    completed: false
  }
});
var TaskList=Backbone.Collection.extend({
  model: Task,
  setParams: function(listid,list,user) {
    this.url='/list/'+listid+'/task';
    this.list=list;
    this.user=user;
  }
});
var ListsView=Backbone.View.extend({
  initialize: function(){
    this.model.bind('add',this.render,this);
    this.model.bind('remove',this.render,this);
  },
  render: function(){
    var listNameArray=[];
    this.$el.empty();
    lists.each(function(list) {
      listNameArray.push({name: list.get('name') });
    });
    var template = _.template( $("#listsNavbar").html(), {lists: listNameArray} );
    this.$el.append( template );
    $('.listElement').on('click',function(event) {
      var list=$(this).text();
      $('#dropdownLists').val(list);
      changeList(list);
    });
    $('#dropdownLists').change(function() {
      var list=$(this).val();
      changeList(list);
    });
    $('#deleteList').on('click', function(e){
      var list=lists.at($('#dropdownLists').get(0).selectedIndex);
      lists.remove(list);
      list.destroy();
      changeList(lists.at(0).get('name'));
    });
    //console.log($(template).find('input'));
    var inputs = $(template).find('input');
    for(var i =0; i < inputs.length; i++){
      inputs.eq(i).change(handler)
    }
    $(template).find('input').click(handler);
    //template.find('input').change(handler);

    return this;
  }
});

var handler = function(event) {
  var input = $(this);
  var parent = input.parent().parent();
  var index= parent.index();
  console.log(index);
  if(input.attr('checked')){
    exportList.push(lists.at(index).toJSON());
  }else{
    for(var i = 0; i < exportList.length; i++){
      if(lists.at(index) === exportList[i]){

        exportList.splice(i, 1);
      }
    }
  }
  console.log(exportList);
};

//$('.nav-list').find('input').change(handler);

var inDes = $('#inputDescription');
var inLimD = $('#inputLimitDay');
var inLimM= $('#inputLimitMonth');
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
      /*if(task.get('limitDay')==0||task.get('limitMonth')==0||task.get('limitYear')==0){
       taskArray.push({name: task.get('name'),limitDate: '', description : task.get('description')});
       }else{
       taskArray.push({name: task.get('name'),limitDate: task.get('limitDay')+"/"+task.get('limitMonth')+"/"+task.get('limitYear'), description : task.get('description')});
       }*/
      console.log(task);
      taskArray.push({name:task.get('name'), limitDate:task.get('expiration_date'), completed:task.get('completed'), description:task.get('description'), favorite:task.get('favorite')});
    });
    var template = _.template($("#taskRowTemplate").html(), {tasks:taskArray});
    this.$el.append(template);
    $('[rel=tooltip]').tooltip();
    $('.task:not(.addTask)').click(function (event) {
      var $target = $(event.target);
      var tasks = lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
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

var favList=new List({name: 'Favoritos', tasks: new TaskList('Favoritos')});
var firstTask = favList.get('tasks').at(0);
favList.get('tasks').remove(firstTask);

var addFavorites = function(task){
  if(task.get('favorite')){
    favList.get('tasks').add(task);
  }
}
var removeFavorites = function(task){
  if(!task.get('favorite')){
    favList.get('tasks').remove(task);
  }
}

$(document).ready(function() {
  lists=new Lists();

  lists.fetch({
    success: function() {
      lists.add(favList);
      listsView=new ListsView({el: $('#listsWell'), model: lists});
      listsView.render();
      var inputs = $('.nav-list').find('input');
      inputs.each(function(i) {
        inputs.eq(i).change(handler);
      });
      changeList(lists.at(0).get('name'));
      $('.listElement').first().parent().addClass('active');
      equalHeight($(".taskRow .task"));
      $('#submitButton').on('click', function(e){
        $('.taskOptionsForm').submit();
      });
      $('.taskOptionsForm').on('submit', function(e){
        var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
        tasks.each(function(task) {
          if(task.get('name')==$('#taskOptionsLabel').text()){
            //task.set({name: $('#inputTitle').val(),description: $('#inputDescription').val(),expiration_date: new Date($('#inputLimitYear').val(),$('#inputLimitMonth').val()-1,$('#inputLimitDay').val(),0,0,0,0),expectedDays: $('#inputExpectedDays').val(),completed: $('#inputCompleted').attr('checked')?true:false});
            console.log(task);
            task.save({name: $('#inputTitle').val(),description: $('#inputDescription').val(),expiration_date: new Date($('#inputLimitYear').val(),$('#inputLimitMonth').val()-1,$('#inputLimitDay').val(),0,0,0,0),expectedDays: $('#inputExpectedDays').val(),completed: ($('#inputCompleted').attr('checked')) ? true : false},{wait:false,success: function(model,response) {
              console.log(model);
              console.log(response);
            }});
            $("#taskOptions").modal('hide');
            console.log(task);
          }
        });
      });
      $('#submitNewListButton').on('click', function(e){
        $('.newListForm').submit();
      });
      $('.newListForm').on('submit', function(e){
        var newListName=$('#inputListName').val();
        $('#inputListName').val('')
        var newList=new List({name: newListName, tasks: new TaskList(newListName)});
        lists.add(newList);
        newList.save();
        $("#newList").modal('hide');
        changeList(newListName);
      });
      $('#submitNewTaskButton').on('click', function(e){
        $('.newTaskForm').submit();
      });
      $('.newTaskForm').on('submit', function(e){
        var newTaskName=$('#inputTaskName').val();
        $('#inputTaskName').val('')
        var selectedList=lists.at($('#dropdownLists').get(0).selectedIndex);
        var listName=selectedList.get('name');
        var tasks=selectedList.get('tasks');
        var newTask=new Task({listid: selectedList.get('_id'),name: newTaskName});
        tasks.add(newTask);
        newTask.save();
        $("#newTaskModal").modal('hide');
      });
      $('#removeButton').on('click', function(e){
        var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
        tasks.each(function(task) {
          if(task.get('name')==$('#taskOptionsLabel').text()){
            tasks.remove(task);
            task.destroy();
            $("#taskOptions").modal('hide');
            return false;
          }
        })

      });
      for(var i=0; i<lists.models.length; i++){
        var tasks = lists.at(i).get('tasks');
        tasks.each(function(task){
          console.log(task.get('name'));
        });
      }
    }
  });
});

var exportLists= function(){
  var txt ='';
  console.log('entra');
  console.log(exportList);
  for (var i = 0; i < exportList.length; i++) {
    console.log(exportList[i]);
    txt += JSON.stringify(exportList[i]) + '\n';
  }
  window.open('data:download/plain;charset=utf-8,' + encodeURI(txt), '_blank');
};