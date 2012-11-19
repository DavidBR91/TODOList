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
	
}
$(document).ready(function() {
	equalHeight($(".taskRow .task"));
    $('#submitButton').on('click', function(e){
    	// We don't want this to act as a link so cancel the link action
    	e.preventDefault();
    	// Find form and submit it
    	$('.taskOptionsForm').submit();
    });
    $("#dropdownLists").change(function() { 
    	changeList($(this).val());
    });
});