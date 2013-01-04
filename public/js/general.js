var lists = [];
var listsView = [];
var exportList = [];
var user = new User();
var lastChange = [];
var offlineMode = false;

function equalHeight(group) {
  var tallest = 0;
  group.each(function () {
    var thisHeight = $(this).height();
    if (thisHeight > tallest) {
      tallest = thisHeight;
    }
  });
  group.each(function () {
    $(this).height(tallest);
  });
}
function changeOfflineMode() {
  if (!offlineMode) {
    offlineMode = true;
    $('#status').html('<i class="status offline"/> Offline');
  } else {
    offlineMode = false;
    lists.syncDirtyAndDestroyed();
    lists.each(function (list) {
      //list.get('tasks').syncDirtyAndDestroyed();
      list.get('tasks').each(function (task) {
        task.save();
      });
    });
    $('#status').html('<i class="status online"/> Online');
  }
  alert(offlineMode);
  return false;
}
function changeList(list) {
  $('#taskList').empty();
  $('#taskListTitle').empty();
  $('#taskListTitle').append('<h1>' + list + '</h1><hr>');
  $('.active').removeClass('active');
  $('.listElement').each(function () {
    if ($(this).text() == list) {
      $(this).parent().addClass('active');
    }
  });

  var selectedList = lists.at($('.nav-list .active').index());
  var modelTasks = selectedList.get('tasks');

  this.user.fetch({
    success:function (user) {
      var tpp = user.get('settings').tasks_per_page;
      var numPages = Math.ceil(modelTasks.length / tpp);
      var template = _.template($("#paginationTemplate").html(), {pages:numPages});
      $('.pagination').html(template);
      paginationHandler();
      showTasks(0);
    }
  });
}

function paginationHandler() {
  $('.pagination ul li a').click(function () {
    var index = $(this).parents('li').index();
    showTasks(index);
  });
}

function showTasks(page) {
  $('.pagination ul li').removeClass('active');
  $($('.pagination ul li').get(page)).addClass('active');

  var selectedList = lists.at($('.nav-list .active').index());
  var modelTasks = selectedList.get('tasks');
  var nameTasks = selectedList.get('name');

  var tpp = user.get('settings').tasks_per_page;
  var start = tpp * page;
  var end = start + tpp;

  console.log(page);

  if (nameTasks === 'Favoritos') {
    var tasksView = new TasksViewFav({start:start, end:end, el:$('#taskList'), model:modelTasks});
  }
  else {
    var tasksView = new TasksView({start:start, end:end, el:$('#taskList'), model:modelTasks});
  }
  tasksView.render();
}

var favList = new List({name:'Favoritos', tasks:new TaskList('Favoritos')});
var firstTask = favList.get('tasks').at(0);
favList.get('tasks').remove(firstTask);

var addFavorites = function (task) {
  if (task.get('favorite')) {
    favList.get('tasks').add(task);
  }
}
var removeFavorites = function (task) {
  if (!task.get('favorite')) {
    favList.get('tasks').remove(task);
  }
}
$(document).ready(function () {
  lists = new Lists();
  lists.fetch({
    success:function () {
      lists.add(favList);
      listsView = new ListsView({el:$('#listsWell'), model:lists});
      listsView.render();
      user.fetch({
        success:function (user) {
          var default_list = user.get('settings').default_list;
          changeList(lists.at(default_list).get('name'));
        }
      });

      $('.listElement').first().parent().addClass('active');
      equalHeight($(".taskRow .task"));
      $('#submitButton').on('click', function (e) {
        $('.taskOptionsForm').submit();
      });
      $('.taskOptionsForm').on('submit', function (e) {
        var tasks = lists.at($('.nav-list .active').index()).get('tasks');
        tasks.each(function (task) {
          if (task.get('name') == $('#taskOptionsLabel').text()) {
            var date = $('#inputDate input').val().split('-');
            var day = date[0], month = date[1] - 1, year = date[2];
            //task.set({name: $('#inputTitle').val(),description: $('#inputDescription').val(),expiration_date: new Date($('#inputLimitYear').val(),$('#inputLimitMonth').val()-1,$('#inputLimitDay').val(),0,0,0,0),expectedDays: $('#inputExpectedDays').val(),completed: $('#inputCompleted').attr('checked')?true:false});
            lastChange = ['update', task, {name:task.get('name'), description:task.get('description'), expiration_date:task.get('expiration_date'), expectedDays:task.get('expectedDays'), completed:task.get('completed')}];
            task.save({name:$('#inputTitle').val(), description:$('#inputDescription').val(), expiration_date:new Date(year, month, day), expectedDays:$('#inputExpectedDays').val(), completed:($('#inputCompleted').attr('checked')) ? true : false}, {remote:!offlineMode, wait:false, success:function (model, response) {
            }});
            $("#taskOptions").modal('hide');
          }
        });
      });
      $('#submitNewListButton').on('click', function (e) {
        $('.newListForm').submit();
      });
      $('.newListForm').on('submit', function (e) {
        var newListName = $('#inputListName').val();
        $('#inputListName').val('')
        var newList = new List({name:newListName, tasks:new TaskList(newListName)});
        lastChange = ['create', 'list', newList];
        lists.add(newList);
        newList.save({}, {remote:!offlineMode});
        $("#newList").modal('hide');
        changeList(newListName);
      });
      $('#submitNewTaskButton').on('click', function (e) {
        $('.newTaskForm').submit();
      });
      $('.newTaskForm').on('submit', function (e) {
        var newTaskName = $('#inputTaskName').val();
        $('#inputTaskName').val('')
        var selectedList = lists.at($('.nav-list .active').index());
        var listName = selectedList.get('name');
        var tasks = selectedList.get('tasks');
        var newTask = new Task({listid:selectedList.get('_id'), name:newTaskName});
        lastChange = ['create', 'task', newTask];
        tasks.add(newTask);
        newTask.save({}, {remote:!offlineMode});
        $("#newTaskModal").modal('hide');
      });
      $('#removeButton').on('click', function (e) {
        var tasks = lists.at($('.nav-list .active').index()).get('tasks');
        tasks.each(function (task) {
          if (task.get('name') == $('#taskOptionsLabel').text()) {
            lastChange = ['delete', lists.at($('.nav-list .active').index()), {name:task.get('name'), description:task.get('description'), expiration_date:task.get('expiration_date'), expectedDays:task.get('expectedDays'), completed:task.get('completed'), listid:lists.at($('.nav-list .active').index()).get('_id')}];
            tasks.remove(task);
            task.destroy({remote:!offlineMode});
            $("#taskOptions").modal('hide');
            return false;
          }
        })
      });
      $("#shareModal").on('show', function () {
        createTableShare(lists);
      })
    }
  });
});

var exportLists = function (){
    var checkedInputs = $('.checkExport:checked');
    var parent;
    var index;
    var list;
    var txt = '';
    for(var i = 0; i < checkedInputs.length; i++){
        parent = $(checkedInputs[i]).parent().parent();
        index = parent.index();
        list = lists.at(index);
        var tasksStr = '';
        list.get('tasks').each( function(task){
            tasksStr += '\t- ' + task.get('name') + ' : ' + task.get('description') +
                '\n\t\t- Fecha de expiracion : ' + task.get('expiration_date') +
                '\n\t\t- Estado : ' + (task.get('completed') ? 'Completada ' : 'No completada') + '\n';
        });
        txt += '- ' + list.get('name') + '\n' + tasksStr + '\n';
    }
    window.open('data:download/plain;charset=utf-8,' + encodeURI(txt), '_blank');
}

var createTableShare = function (lists) {
  console.log(lists);
  $("#shareTable tbody").html('');
  lists.each(function (list) {
    if (list.get('name') !== 'Favoritos') {
      list.get('tasks').each(function (task) {
        $("#shareTable tbody").append("<tr>" +
          "<td><input class='checkTask' type='checkbox' data-id='" + task.get('_id') + "'/></td>" +
          "<td>" + task.get('name') + "</td>" +
          "<td>" + list.get('name') + "</td>" +
          "</tr>")
      });
    }
  });
};

var shareTasks = function () {
  var checkedInputs = $('.checkTask:checked');
  var inputsId = [];
  for (var i = 0; i < checkedInputs.length; i++) {
    inputsId.push($(checkedInputs[i]).attr('data-id'));
  }
  return inputsId;
};

var undoLastChange = function () {
  alert(lastChange);
  if (lastChange.length == 0) return;
  if (lastChange[0] == 'update') {
    lastChange[1].save(lastChange[2]);
  } else if (lastChange[0] == 'create') {
    if (lastChange[1] == 'task') {
      lists.each(function (list) {
        var tasks = list.get('tasks');
        tasks.each(function (task) {
          if (task.get('_id') == lastChange[2].get('_id'))
            tasks.remove(lastChange[2]);
        });
      });
    } else {
      lists.remove(lastChange[2]);
    }
    lastChange[2].destroy();
  } else if (lastChange[0] == 'delete') {
    if (lastChange[1] == 'list') {
      var list = new List(lastChange[1]);
      lists.add(list);
      list.save();
    } else {
      var task = new Task(lastChange[2]);
      var tasks = lastChange[1].get('tasks');
      tasks.add(task);
      task.save();
    }
  }
  lastChange = [];

  listsView = new ListsView({el:$('#listsWell'), model:lists});
  listsView.render();
};
