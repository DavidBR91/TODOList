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
	    	changeList(list);
    	});
	     $('#deleteList').on('click', function(e){
	     	var list=lists.at($('.active').index());
	    	lists.remove(list);
	    	list.destroy();
	    	$('.listElement').first().parent().addClass('active');
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
var inDes = $('#inputDescription');
var inLimD = $('#inputLimitDay');
var inLimM= $('#inputLimitMonth');
var inLimY = $('#inputLimitYear');
var inComp = $('#inputCompleted');
var inExpD = $('#inputExpectedDays');

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
	    	taskArray.push({name: task.get('name'),limitDate: task.get('expiration_date'), completed : task.get('completed'), description : task.get('description')});
    	});
	    	var template = _.template( $("#taskRowTemplate").html(), {tasks: taskArray} );
	    	this.$el.append( template );
      $('[rel=tooltip]').tooltip();
    	$('.task').click(function() {
		    var taskName = $(this).data('name');
		    $('#inputTitle').val(taskName);
		    $('#taskOptionsLabel').text(taskName);
		    var tasks=lists.at($('.active').index()/2).get('tasks');
		    console.log(tasks);
		    tasks.each(function(task) {
		    	if(task.get('name')===taskName){
		    		var date=new Date(task.get('expiration_date'));
			    	inDes.val(task.get('description'));
			    	inLimD.val(date.getDate());
			    	inLimM.val(date.getMonth()+1);
			      inLimY.val(date.getFullYear());
			    	inExpD.val(task.get('expectedDays'));
			    	task.get('completed')==false ?  inComp.attr('checked', false) : inComp.attr('checked', true);
		    	}
		    });
	    });
    	return this;
    }
});
