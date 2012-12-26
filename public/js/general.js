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
	$('.active').removeClass('active');
    $('.listElement').each(function() {
    	if($(this).text()==list){
    		$(this).parent().addClass('active');
    	}
    });
    var modelTasks=lists.at($('.active').index()/2).get('tasks');
    var tasksView=new TasksView({el: $('#taskList'), model: modelTasks});
    tasksView.render();
}

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

$(document).ready(function() {
	lists=new Lists();
	lists.fetch({
		success: function() {
			listsView=new ListsView({el: $('#listsWell'), model: lists});
			listsView.render();
			listsView
            var inputs = $('.nav-list').find('input');
            inputs.each(function(i) {
                inputs.eq(i).change(handler);
            });
            $('.listElement').first().parent().addClass('active');
			changeList(lists.at(0).get('name'));
			equalHeight($(".taskRow .task"));
			$('#submitButton').on('click', function(e){
				$('.taskOptionsForm').submit();	
			});
		    $('.taskOptionsForm').on('submit', function(e){
		    	var tasks=lists.at($('.active').index()/2).get('tasks');
		    	tasks.each(function(task) {
			    	if(task.get('name')==$('#taskOptionsLabel').text()){
			    		//task.set({name: $('#inputTitle').val(),description: $('#inputDescription').val(),expiration_date: new Date($('#inputLimitYear').val(),$('#inputLimitMonth').val()-1,$('#inputLimitDay').val(),0,0,0,0),expectedDays: $('#inputExpectedDays').val(),completed: $('#inputCompleted').attr('checked')?true:false});
			    		console.log(task);
			    		task.save({name: $('#inputTitle').val(),description: $('#inputDescription').val(),expiration_date: new Date($('#inputLimitYear').val(),$('#inputLimitMonth').val()-1,$('#inputLimitDay').val(),0,0,0,0),expectedDays: $('#inputExpectedDays').val(),completed: $('#inputCompleted').attr('checked')?true:false},{wait:false,success: function(model,response) { 
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
		    	var selectedList=lists.at($('.active').index()/2);
		    	var listName=selectedList.get('name');
		    	var tasks=selectedList.get('tasks');
		    	var newTask=new Task({listid: selectedList.get('_id'),name: newTaskName});
		    	tasks.add(newTask);
		    	newTask.save();
		    	$("#newTaskModal").modal('hide');
		    });
		    $('#removeButton').on('click', function(e){
		    	var tasks=lists.at($('.active').index()/2).get('tasks');
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