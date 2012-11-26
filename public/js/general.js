var lists=[];
var listsView=[];
var tasksView=[];
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
	$('.taskListTitle').append('<h2>'+list+'</h2>');
	tasksView.render();
}
var List=Backbone.Model.extend({
	defaults:{
		name: '',
		tasks: []
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
		expectedDays: 0
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
	initialize: function(lists){
    },
    render: function(){
    	var listNameArray=[];
    	lists.each(function(list) {
	    	listNameArray.push({name: list.get('name') });
    	});
        var template = _.template( $("#listsNavbar").html(), {lists: listNameArray} );
        this.$el.append( template );
        return this;
    }
});
var TasksView=Backbone.View.extend({
	initialize: function(lists){
    },
    render: function(){
    	var taskArray=[];
    	lists.at($('#dropdownLists').get(0).selectedIndex).get('tasks').each(function(task) {
	    	taskArray.push({name: task.get('name'),limitDate: task.get('limitDay')+"/"+task.get('limitMonth')+"/"+task.get('limitYear')});
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
        return this;
    }
});
$(document).ready(function() {
	var task1=new Task({name: 'task1', limitYear: 12, limitMonth: 12, limitDay: 12});
	var task2=new Task({name: 'task2', limitYear: 11, limitMonth: 11, limitDay: 11});
	var task3=new Task({name: 'task3', limitYear: 10, limitMonth: 10, limitDay: 10});
	var task4=new Task({name: 'task4', limitYear: 9, limitMonth: 9, limitDay: 9});
	var task5=new Task({name: 'task5', limitYear: 8, limitMonth: 8, limitDay: 8});
	var taskList1=new TaskList([task1,task2,task3,task4,task5]);
	var taskList2=new TaskList([task2,task4]);
	var list1=new List({name: 'List1', tasks: taskList1});
	var list2=new List({name: 'List2', tasks: taskList2});
	lists=new Lists([list1,list2]);
	listsView=new ListsView({el: $('.todoLists')});
	listsView.render();
	tasksView=new TasksView({el: $('.taskList')});
	tasksView.render();
	$('.taskListTitle').empty();
	$('.taskListTitle').append('<h2>'+$('#dropdownLists').val()+'</h2>');
	$('.listElement').first().parent().addClass('active');
	equalHeight($(".taskRow .task"));
    $('#submitButton').on('click', function(e){
    	// We don't want this to act as a link so cancel the link action
    	e.preventDefault();
    	// Find form and submit it
    	$('.taskOptionsForm').submit();
    });
    $('#dropdownLists').change(function() { 
    	var list=$(this).val();
    	var i=0;
    	var dropdownIndex=$('#dropdownLists').get(0).selectedIndex;
    	$('.active').removeClass('active');
    	$('#dropdownLists').removeClass('active');
        $('.todoLists > .listsLinks > ul > li > a').each(function() {
        	if(dropdownIndex==i++){
        		$(this).parent().addClass('active');
        	}
        });
        changeList(list);
    });
    $('.listElement').on('click',function(event) { 
    	var list=$(this).text();
    	$('#dropdownLists').val(list);
    	$(this).parent().parent().find('.active').removeClass('active');
    	$(this).parent().addClass('active');
    	changeList(list);
    });
});
