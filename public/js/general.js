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
	$('.taskList').empty();
	$('.taskListTitle').empty();
	$('.taskListTitle').append('<h2>'+list+'<button href="#newTaskModal" class="btn btn-primary pull-right" data-toggle="modal"><h1>+</h1></button></h2>');
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
    var tasksView=new TasksView({el: $('.taskList'), model: modelTasks});
    tasksView.render();
}
var List=Backbone.Model.extend({
	defaults:{
		name: '',
		tasks: new TaskList()
	},
	initialize: function(attrs,opts){}
});
var Lists=Backbone.Collection.extend({
	model: List,
	comparator: function(list) {
		return list.name
	}
});
var Task=Backbone.Model.extend({
	defaults:{
		name: '',
		description: '',
		limitYear: 0,
		limitMonth: 0,
		limitDay: 0,
		expectedDays: 0,
		completed: 0
	},
	initialize: function(attrs,opts){}
});
var TaskList=Backbone.Collection.extend({
	model: Task,
	comparator: function(task) {
		var date=new Date(task.get("limitYear"),task.get("limitMonth"),task.get("limitDay"),0,0,0,0);
		return date.getTime();
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
	    	lists.remove(lists.at($('#dropdownLists').get(0).selectedIndex));
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
    		if(task.get('limitDay')==0||task.get('limitMonth')==0||task.get('limitYear')==0){
	    		taskArray.push({name: task.get('name'),limitDate: ''});
    		}else{
	    		taskArray.push({name: task.get('name'),limitDate: task.get('limitDay')+"/"+task.get('limitMonth')+"/"+task.get('limitYear')});
	    	}
    	});
    	for(var i=0,len=taskArray.length;i<len;i+=4){
    		var j=0;
    		var taskArrayMin=[];
    		while (j+i<taskArray.length&&j<4){
	    		taskArrayMin.push(taskArray[i+j]);
	    		j++;
    		}
	    	var template = _.template( $("#taskRowTemplate").html(), {tasks: taskArrayMin} );
	    	this.$el.append( template );
    	}
    	$('.task').click(function() {
		    var taskName = $(this).data('name');
		    $('#inputTitle').val(taskName);
		    $('#taskOptionsLabel').text(taskName);
		    var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
		    tasks.each(function(task) {
		    	if(task.get('name')===taskName){
			    	$('#inputDescription').val(task.get('description'));
			    	$('#inputLimitDay').val(task.get('limitDay'));
			    	$('#inputLimitMonth').val(task.get('limitMonth'));
			    	$('#inputLimitYear').val(task.get('limitYear'));
			    	$('#inputExpectedDays').val(task.get('expectedDays'));
			    	task.get('completed')==0 ?  $('#inputCompleted').attr('checked', false):$('#inputCompleted').attr('checked', true);
		    	}
		    });
	    });
    	return this;
    }
});
$(document).ready(function() {
	var task1=new Task({name: 'task1', limitYear: 12, limitMonth: 12, limitDay: 12, description: 'hola'});
	var task2=new Task({name: 'task2', limitYear: 11, limitMonth: 11, limitDay: 11});
	var task3=new Task({name: 'task3', limitYear: 10, limitMonth: 10, limitDay: 10});
	var task4=new Task({name: 'task4', limitYear: 9, limitMonth: 9, limitDay: 9});
	var task5=new Task({name: 'task5', limitYear: 8, limitMonth: 8, limitDay: 8});
	var task6=new Task({name: 'task6', limitYear: 12, limitMonth: 12, limitDay: 12});
	var task7=new Task({name: 'task7', limitYear: 11, limitMonth: 11, limitDay: 11});
	var task8=new Task({name: 'task8', limitYear: 10, limitMonth: 10, limitDay: 10});
	var task9=new Task({name: 'task9', limitYear: 9, limitMonth: 9, limitDay: 9});
	var task10=new Task({name: 'task10', limitYear: 8, limitMonth: 8, limitDay: 8});
	var task11=new Task({name: 'task11', limitYear: 12, limitMonth: 12, limitDay: 12});
	var task12=new Task({name: 'task12', limitYear: 11, limitMonth: 11, limitDay: 11});
	var task13=new Task({name: 'task13', limitYear: 10, limitMonth: 10, limitDay: 10});
	var task14=new Task({name: 'task14', limitYear: 9, limitMonth: 9, limitDay: 9});
	var task15=new Task({name: 'task15', limitYear: 8, limitMonth: 8, limitDay: 8});
	var task16=new Task({name: 'task16', limitYear: 12, limitMonth: 12, limitDay: 12});
	var task17=new Task({name: 'task17', limitYear: 11, limitMonth: 11, limitDay: 11});
	var task18=new Task({name: 'task18', limitYear: 10, limitMonth: 10, limitDay: 10});
	var task19=new Task({name: 'task19', limitYear: 9, limitMonth: 9, limitDay: 9});
	var task20=new Task({name: 'task20', limitYear: 8, limitMonth: 8, limitDay: 8});
	var taskList1=new TaskList([task1,task2,task3,task4,task5,task6,task7,task8,task9,task10,task11, task12,task13,task14,task15,task16,task17,task18,task19,task20]);
	var taskList2=new TaskList([task2,task4]);
	var taskList3=new TaskList([task4,task5]);
	var taskList4=new TaskList([task7,task8]);
	var taskList5=new TaskList([task11,task12]);
	var taskList6=new TaskList([task13,task14]);
	var taskList7=new TaskList([task15,task16]);
	var taskList8=new TaskList([task17,task18,task19]);
	var taskList9=new TaskList([task20,task4,task10,task12]);
	var taskList10=new TaskList([task8,task1,task1,task5]);
	var taskList11=new TaskList([task1,task2,task3,task4,task5,task6,task7,task8,task9,task10,task11, task12,task13,task14,task15,task16,task17,task18,task19,task20]);
	var taskList12=new TaskList([task2,task4]);
	var taskList13=new TaskList([task4,task5]);
	var taskList14=new TaskList([task7,task8]);
	var taskList15=new TaskList([task11,task12]);
	var taskList16=new TaskList([task13,task14]);
	var taskList17=new TaskList([task15,task16]);
	var taskList18=new TaskList([task17,task18,task19]);
	var taskList19=new TaskList([task20,task4,task10,task12]);
	var list1=new List({name: 'List1', tasks: taskList1});
	var list2=new List({name: 'List2', tasks: taskList2});
	var list3=new List({name: 'List3', tasks: taskList3});
	var list4=new List({name: 'List4', tasks: taskList4});
	var list5=new List({name: 'List5', tasks: taskList5});
	var list6=new List({name: 'List6', tasks: taskList6});
	var list7=new List({name: 'List7', tasks: taskList7});
	var list8=new List({name: 'List8', tasks: taskList8});
	var list9=new List({name: 'List9', tasks: taskList9});
	var list10=new List({name: 'List10', tasks: taskList10});
	var list11=new List({name: 'List11', tasks: taskList11});
	var list12=new List({name: 'List12', tasks: taskList12});
	var list13=new List({name: 'List13', tasks: taskList13});
	var list14=new List({name: 'List14', tasks: taskList14});
	var list15=new List({name: 'List15', tasks: taskList15});
	var list16=new List({name: 'List16', tasks: taskList16});
	var list17=new List({name: 'List17', tasks: taskList17});
	var list18=new List({name: 'List18', tasks: taskList18});
	var list19=new List({name: 'List19', tasks: taskList19});
	lists=new Lists([list1,list2,list3,list4,list5,list6,list7,list8,list9,list10,list11,list12,list13,list14,list15,list16,list17,list18,list19]);
	listsView=new ListsView({el: $('.todoLists'), model: lists});
	listsView.render();
	changeList(lists.at(0).get('name'));
	$('.listElement').first().parent().addClass('active');
	equalHeight($(".taskRow .task"));
    $('#submitButton').on('click', function(e){
    	var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
    	tasks.each(function(task) {
	    	if(task.get('name')==$('#taskOptionsLabel').text()){
	    		task.set({name: $('#inputTitle').val(),description: $('#inputDescription').val(),limitYear: $('#inputLimitYear').val(),limitMonth: $('#inputLimitMonth').val(),limitDay: $('#inputLimitDay').val(),expectedDays: $('#inputExpectedDays').val(),completed: $('#inputCompleted').attr('checked')==false?0:1});
	    		$("#taskOptions").modal('hide');
		    	return false;
	    	}
    	})
    	//$('.taskOptionsForm').submit();
    });
    $('#submitNewListButton').on('click', function(e){
    	var newListName=$('#inputListName').val();
    	lists.add(new List({name: newListName, tasks: new TaskList([])}));
    	$("#newList").modal('hide');
    	changeList(newListName);
    	//$('.newListForm').submit();
    });
    $('#submitNewTaskButton').on('click', function(e){
    	var newTaskName=$('#inputTaskName').val();
    	var listName=lists.at($('#dropdownLists').get(0).selectedIndex).get('name');
    	var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
    	tasks.add(new Task({name: newTaskName}));
    	$("#newTaskModal").modal('hide');
    	//$('.newTaskForm').submit();
    });
    $('.newListForm').on('submit',function() {
	    $("#newList").modal('hide');
    });
    $('#removeButton').on('click', function(e){
    	var tasks=lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks');
    	tasks.each(function(task) {
	    	if(task.get('name')==$('#taskOptionsLabel').text()){
	    		tasks.remove(task);
	    		$("#taskOptions").modal('hide');
		    	return false;
	    	}
    	})
    	
    });
});
