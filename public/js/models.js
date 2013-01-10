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
  reorder : function(initPos,endPos){
    var model = this.at(initPos);
    this.remove(model);
    this.add(model,{at:endPos});
  },
  setParams: function(listid,list,user) {
    this.url='/list/'+listid+'/task';
    this.list=list;
    this.user=user;
  }
});

var User = Backbone.Model.extend({
  url: '/user'
});