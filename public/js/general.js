var lists=[];
var listsView=[];
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
    $('.todoLists > .listsLinks > ul > li > a').each(function() {
    	if(dropdownIndex==i++){
    		$(this).parent().addClass('active');
    	}
    });
    var modelTasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
    var tasksView=new TasksView({el: $('#taskList'), model: modelTasks});
    tasksView.render();
}
var List=Backbone.Model.extend({
	idAttribute: '_id',
	defaults:{
		name: '',
	},
	parse: function(response) {
		var taskList=[];
		this.url='/list/'+response._id;
		_.each(response.tasks,function(taskid) {
			var task=new Task({listid: response._id, _id: taskid});
			task.fetch({
				success: function(task) {}
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
		/*limitYear: 0,
		limitMonth: 0,
		limitDay: 0,*/
		expectedDays: 0,
		completed: 0
	},
});
var TaskList=Backbone.Collection.extend({
	model: Task,
	setParams: function(listid,list,user) {
		this.url='/list/'+listid+'/task';
		this.list=list;
		this.user=user;
	},
	comparator: function(task) {
		//var date=new Date(task.get("limitYear"),task.get("limitMonth"),task.get("limitDay"),0,0,0,0);
		//return date.getTime();
		if(typeof task.expiration_date != 'undefined') return task.expiration_date.getTime();
		else return task.name;
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
	    	$(this).parent().parent().find('.active').removeClass('active');
	    	$(this).parent().addClass('active');
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
        return this;
    }
});
var TasksView=Backbone.View.extend({
	initialize: function(){
		this.model.bind('add',this.render,this);
		this.model.bind('remove',this.render,this);
		this.model.bind('change',this.render,this);
    },
    render: function(){
    	var taskArray=[];
    	this.$el.empty();
    	this.model.each(function(task) {
    		/*if(task.get('limitDay')==0||task.get('limitMonth')==0||task.get('limitYear')==0){
	    		taskArray.push({name: task.get('name'),limitDate: '', description : task.get('description')});
    		}else{
	    		taskArray.push({name: task.get('name'),limitDate: task.get('limitDay')+"/"+task.get('limitMonth')+"/"+task.get('limitYear'), description : task.get('description')});
	    	}*/
	    	taskArray.push({name: task.get('name'),limitDate: task.get('expiration_date'), description : task.get('description')});
    	});
	    	var template = _.template( $("#taskRowTemplate").html(), {tasks: taskArray} );
	    	this.$el.append( template );
    	$('#task').click(function() {
		    var taskName = $(this).data('name');
		    $('#inputTitle').val(taskName);
		    $('#taskOptionsLabel').text(taskName);
		    var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
		    tasks.each(function(task) {
		    	if(task.get('name')===taskName){
			    	$('#inputDescription').val(task.get('description'));
			    	/*$('#inputLimitDay').val(task.get('limitDay'));
			    	$('#inputLimitMonth').val(task.get('limitMonth'));
			    	$('#inputLimitYear').val(task.get('limitYear'));*/
			    	$('#inputLimitDay').val(task.get('expiration_date').getDate());
			    	$('#inputLimitMonth').val(task.get('expiration_date').getMonth()+1);
			    	$('#inputLimitYear').val(task.get('expiration_date').getFullYear());
			    	$('#inputExpectedDays').val(task.get('expectedDays'));
			    	task.get('completed')==0 ?  $('#inputCompleted').attr('checked', false):$('#inputCompleted').attr('checked', true);
		    	}
		    });
	    });
    	return this;
    }
});
$(document).ready(function() {
	lists=new Lists();
	lists.fetch({
		success: function() {
			listsView=new ListsView({el: $('.todoLists'), model: lists});
			listsView.render();
			if(typeof lists.at(0) != 'undefined') changeList(lists.at(0).get('name'));
			$('.listElement').first().parent().addClass('active');
			equalHeight($(".taskRow .task"));
			$('#submitButton').on('click', function(e){
				$('.taskOptionsForm').submit();	
			});
		    $('.taskOptionsForm').on('submit', function(e){
		    	var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
		    	tasks.each(function(task) {
			    	if(task.get('name')==$('#taskOptionsLabel').text()){
			    		//task.set({name: $('#inputTitle').val(),description: $('#inputDescription').val(),limitYear: $('#inputLimitYear').val(),limitMonth: $('#inputLimitMonth').val(),limitDay: $('#inputLimitDay').val(),expectedDays: $('#inputExpectedDays').val(),completed: $('#inputCompleted').attr('checked')==false?0:1});
			    		console.log(task);
			    		task.save({name: $('#inputTitle').val(),description: $('#inputDescription').val(),expiration_Date: new Date($('#inputLimitYear').val(),$('#inputLimitMonth').val(),$('#inputLimitDay').val(),0,0,0,0),expectedDays: $('#inputExpectedDays').val(),completed: $('#inputCompleted').attr('checked')==false?0:1});
			    		$("#taskOptions").modal('hide');
				    	return false;
			    	}
		    	})
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
		}
	});
});
