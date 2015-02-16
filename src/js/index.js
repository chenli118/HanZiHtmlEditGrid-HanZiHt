/*
	crud template for :
     db: northwind 
	 tablename :Customers
*/


function highlightRow(rowId, bgColor, after)
{
	
	var rowSelector = $("#" + rowId);
	rowSelector.css("background-color", bgColor);
	rowSelector.fadeTo("normal", 0.5, function() { 
		rowSelector.fadeTo("fast", 1, function() { 
			rowSelector.css("background-color", '');
		});
	});
}

function highlight(div_id, style) {
	highlightRow(div_id, style == "error" ? "#e5afaf" : style == "warning" ? "#ffcc00" : "#8dc70a");
}
        

function updateCellValue(editableGrid, rowIndex, columnIndex, oldValue, newValue, row, onResponse)
{
	
	$.ajax({
		url: 'crud.ashx?action=update&tablename=Customers',
		type: 'POST',
		dataType: "html",
	   		data: {
			tablename : editableGrid.name,			
			newvalue: editableGrid.getColumnType(columnIndex) == "boolean" ? (newValue ? 1 : 0) : newValue, 
			colname: editableGrid.getColumnName(columnIndex),
			coltype: editableGrid.getColumnType(columnIndex),
			wherestr: "CustomerID='" + editableGrid.getRowPKByColName(rowIndex, "CustomerID")+"'"//主键区分大小写需要元数据化

		},
		success: function (response) 
		{
			var success = onResponse ? onResponse(response) : (response == "ok" || !isNaN(parseInt(response))); 
			if (!success) editableGrid.setValueAt(rowIndex, columnIndex, oldValue);
		    highlight(row.id, success ? "ok" : "error"); 
		},
		error: function(XMLHttpRequest, textStatus, exception) { alert("Ajax failure\n" + errortext); },
		async: true
	});
   
}
   


function DatabaseGrid() 
{
	
	this.editableGrid = new EditableGrid("Customers", {
		enableSort: true,	   
      	pageSize: 50,     
        tableRendered:  function() {  updatePaginator(this); },
   	    tableLoaded: function() { datagrid.initializeGrid(this); },
		modelChanged: function(rowIndex, columnIndex, oldValue, newValue, row) {
   	    	updateCellValue(this, rowIndex, columnIndex, oldValue, newValue, row);
       	}
 	});
	this.fetchGrid(); 
	
}

DatabaseGrid.prototype.fetchGrid = function()  {
		
	this.editableGrid.loadJSON("crud.ashx?action=load&tablename=Customers");
};

DatabaseGrid.prototype.initializeGrid = function(grid) {

  var self = this;

	grid.setCellRenderer("action", new CellRenderer({  //action field valuse inlude PK data
		render: function(cell, id) {                 
		      cell.innerHTML+= "<i onclick=\"datagrid.deleteRow('"+id+"');\" class='fa fa-trash-o red' ></i>";
		}
	})); 

	grid.renderGrid("tablecontent", "testgrid");  // render
};    

DatabaseGrid.prototype.deleteRow = function(id) 
{
	
  var self = this;

  if (confirm('Are you sur you want to delete the row CustomerID ' + id))
  {

        $.ajax({
        	url: 'crud.ashx?action=delete&tablename=Customers',
		type: 'POST',
		dataType: "html",
		data: {
			tablename : self.editableGrid.name,
			wherestr: "CustomerID='" + id + "'" //主键区分大小写需要元数据化 
		},
		success: function (response) 
		{
			debugger;
			if (response == "ok" )
				self.editableGrid.removeRow(id, "CustomerID");
		},
		error: function(XMLHttpRequest, textStatus, exception) { alert("Ajax failure\n" + errortext); },
		async: true
	});

        
  }
			
}; 


DatabaseGrid.prototype.addRow = function(id) 
{
	

  var self = this;

        $.ajax({
        	url: 'crud.ashx?action=add&tablename=Customers',
		type: 'POST',
		dataType: "html",
		data: {
			tablename : self.editableGrid.name,
			customerid: $("#customerid").val(),
			companyname: $("#companyname").val(),
			contactname: $("#contactname").val(),
			address: $("#address").val()
		},
		success: function (response) 
		{ 
			if (response == "ok" ) {
   
                showAddForm();   
                $("#customerid").val('');
                $("#companyname").val('');
                $("#contactname").val('');
                $("#address").val('');
			    
                alert("Row added : reload model");
                self.fetchGrid();
           	}
            else 
              alert("error");
		},
		error: function(XMLHttpRequest, textStatus, exception) { alert("Ajax failure\n" + errortext); },
		async: true
	});

        
			
}; 




function updatePaginator(grid, divId)
{
	
	
    divId = divId || "paginator";
	var paginator = $("#" + divId).empty();
	var nbPages = grid.getPageCount();

	var interval = grid.getSlidingPageInterval(20);
	if (interval == null) return;
	
	var pages = grid.getPagesInInterval(interval, function(pageIndex, isCurrent) {
		if (isCurrent) return "<span id='currentpageindex'>" + (pageIndex + 1)  +"</span>";
		return $("<a>").css("cursor", "pointer").html(pageIndex + 1).click(function(event) { grid.setPageIndex(parseInt($(this).html()) - 1); });
	});
		
	var link = $("<a class='nobg'>").html("<i class='fa fa-fast-backward'></i>");
	if (!grid.canGoBack()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { grid.firstPage(); });
	paginator.append(link);

	
	link = $("<a class='nobg'>").html("<i class='fa fa-backward'></i>");
	if (!grid.canGoBack()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { grid.prevPage(); });
	paginator.append(link);

	
	for (p = 0; p < pages.length; p++) paginator.append(pages[p]).append(" ");
	
	
	link = $("<a class='nobg'>").html("<i class='fa fa-forward'>");
	if (!grid.canGoForward()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { grid.nextPage(); });
	paginator.append(link);

	
	link = $("<a class='nobg'>").html("<i class='fa fa-fast-forward'>");
	if (!grid.canGoForward()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { grid.lastPage(); });
	paginator.append(link);
}; 


function showAddForm() {
  if ( $("#addform").is(':visible') ) 
      $("#addform").hide();
  else
      $("#addform").show();
}

        

   




  



