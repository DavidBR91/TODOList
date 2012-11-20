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
}
$(document).ready(function() {
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
        $('#dropdownLists').parent().parent().find('.active').removeClass('active');
        $('.todoLists > ul > li > a').each(function() {
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
