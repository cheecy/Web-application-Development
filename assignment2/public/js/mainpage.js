google.charts.load('current', {packages: ['corechart']});
google.charts.load('current', {'packages':['bar']});

var optionsBar = {'title':"Revision distribution by year and by user type",
        'width':600,
        'height':400};

var optionsPie = {'title':"Distribution in user type",
        'width':500,
        'height':500};

var dataBar
var dataPie
var userChart
var resultdata
var check = []

function drawBar(){
	var data = google.visualization.arrayToDataTable(dataBar)
	/*
	var data = google.visualization.arrayToDataTable([
        ['Year', 'Administrator', 'Anonymous', 'Bot'],
        ['2014', 1000, 400, 200],
        ['2015', 1170, 460, 250],
        ['2016', 660, 1120, 300],
        ['2017', 1030, 540, 350]
      ]);
	*/

      var chart = new google.charts.Bar($("#barchart")[0]);

      chart.draw(data, google.charts.Bar.convertOptions(optionsBar));
}

function drawPie(){
   	graphData = new google.visualization.DataTable();
	graphData.addColumn('string', 'Element');
	graphData.addColumn('number', 'Percentage');
	$.each(dataPie, function(key, val) {
		graphData.addRow([key, val]);
	})
	var chart = new google.visualization.PieChart($("#piechart")[0]);
	chart.draw(graphData, optionsPie);
}

function drawUserChart(t, datar){
	
	var dataUser = new Array()
	var chartTitle = new Array()
	chartTitle.push('Genre')
	for (var i = 0; i < check.length; i++) {
		chartTitle.push(check[i])
	}
	chartTitle.push({role: 'annotation'})
	dataUser[0] = chartTitle
	
	for (var i = 0; i < datar.length; i++) {
		var record = new Array()
		record.push(datar[i]._id)
		for (var j = 0; j < check.length; j ++) {
			var flag = false
			for(var k = 0; k < datar[i].distribution.length; k ++) {
				if (check[j] == datar[i].distribution[k].user) {
					record.push(datar[i].distribution[k].count)
					flag = true
				}
			}
			if (!flag) {
				record.push(0)
			}
		}
		
		record.push('')
		dataUser.push(record)
	}
	
	var data = google.visualization.arrayToDataTable(dataUser)
	/*
	    var data = google.visualization.arrayToDataTable([
        ['Genre', 'Fantasy & Sci Fi', 'Romance', 'Mystery/Crime', 'General',
         'Western', 'Literature', { role: 'annotation' } ],
        ['2010', 10, 24, 20, 32, 18, 5, ''],
        ['2020', 16, 22, 23, 30, 16, 9, ''],
        ['2030', 28, 19, 29, 30, 12, 13, '']
      ]);
	*/
	var options = {
		'title': "Revision distribution by year of user " + check + "for article " + t,
        width: 600,
        height: 400,
        legend: { position: 'top', maxLines: 3 },
        bar: { groupWidth: '75%' },
        isStacked: true
      };
	
      var chart = new google.charts.Bar($("#userchart")[0]);

      chart.draw(data, google.charts.Bar.convertOptions(options));
}

$(document).ready(function(){
	//Selecter listener
	var sel = $('#select')
	$('#barchart').show()
	$('#piechart').hide();
	$('#userchart').hide();
	
	$('#bar').show();
	$('#pie').show();
	$('#user').hide();
	
	$('#bar').click(function() {
		$('#barchart').show();
		$('#piechart').hide();
		$('#userchart').hide();
	})
	
	$('#pie').click(function() {
		$('#barchart').hide();
		$('#piechart').show();
		$('#userchart').hide();
	})
	
	$('#user').click(function() {
		$('#barchart').hide();
		$('#piechart').hide();
		$('#userchart').show();
	})
	/*
	 * Individual
	 */
	
	sel.change(function(){
		var index = sel.get(0).selectedIndex
		console.log(index)
		var article = sel.val().split(" - ")[0]
		if (article == "Overall") {
			window.location.replace("/")
		}
		else {
			$('#bar').show();
			$('#pie').show();
			$('#user').show();
			
			
			//pull update
			var pullUpdate = $.getJSON('/index/individual/pullUpdate',{title:article}, function(count) {
			
				alert(count + " documents pulled from wikipedia")
				$('#select').children().remove()
				var selecter = $.getJSON('index/getSelecter',null)
				selecter.done(function(result) {
					for (var i = 0; i < result.length; i ++) {
						var one = $("<option>" +  result[i]._id +" - "+ result[i].count +"</option>")
						$('#select').append(one)
					}
					sel.get(0).selectedIndex = index
					console.log(index)
					$('#title').children().remove()
					$('#title').append("<h2> Top users (" + sel.val() + ") </h2>")
				})
				//get Individual table
				var overallTable = $.get('index/individual/getTable',{title:article})
				overallTable.done(function(result) {
					$('#overallTable').html(result)
					
					//get user chart
					var userList = []
					$('.user').each(function () {
						var u = $(this).text();
						userList.push(u)
					})
					//console.log(userList)
					$.getJSON('/index/individual/getUserChart',{title:article, users:userList}, function(rdata) {
						resultdata = rdata
						drawUserChart(article, resultdata)
						//console.log(rdata)
					})
					//set check box action 
					$('.check').change(function() {
						//var u = []
						check = new Array()
				        for (var i = 0; i < $('.check').length; i ++) {
				        	if ($('.check')[i].checked) {
				        		//u.push($('.user')[i].text())
				        		check.push(userList[i])
				        	}
				        }
						//console.log(resultdata[0])
				        drawUserChart(article, resultdata)
						//console.log(check)
				    });
				})
				//get Bar chart
				$.getJSON('/index/individual/getBar',{title:article}, function(rdata) {
					dataBar = rdata
			    	google.charts.setOnLoadCallback(drawBar)
			    }
			    );
				//get Pie chart
				$.getJSON('/index/individual/getPie',{title:article}, function(rdata) {
					dataPie = rdata
			    	google.charts.setOnLoadCallback(drawPie)
			    }
			    );

			})
			/*
			//get Individual table
			var overallTable = $.get('index/individual/getTable',{title:article})
			overallTable.done(function(result) {
				$('#title').children().remove()
				$('#title').append("<h2> Top users (" + sel.val() + ") </h2>")
				$('#overallTable').html(result)
				
				//get user chart
				var userList = []
				$('.user').each(function () {
					var u = $(this).text();
					userList.push(u)
				})
				//console.log(userList)
				$.getJSON('/index/individual/getUserChart',{title:article, users:userList}, function(rdata) {
					resultdata = rdata
					drawUserChart(article, resultdata)
					//console.log(rdata)
				})
				//set check box action 
				$('.check').change(function() {
					//var u = []
					check = new Array()
			        for (var i = 0; i < $('.check').length; i ++) {
			        	if ($('.check')[i].checked) {
			        		//u.push($('.user')[i].text())
			        		check.push(userList[i])
			        	}
			        }
					//console.log(resultdata[0])
			        drawUserChart(article, resultdata)
					//console.log(check)
			    });
			})
			//get Bar chart
			$.getJSON('/index/individual/getBar',{title:article}, function(rdata) {
				dataBar = rdata
		    	google.charts.setOnLoadCallback(drawBar)
		    }
		    );
			//get Pie chart
			$.getJSON('/index/individual/getPie',{title:article}, function(rdata) {
				dataPie = rdata
		    	google.charts.setOnLoadCallback(drawPie)
		    }
		    );
			*/
		}
	})
	
	/*
	 * Overall
	 */
	//get Selecter

	var selecter = $.getJSON('index/getSelecter',null)
	$('#select').children().remove()
	selecter.done(function(result) {
		for (var i = 0; i < result.length; i ++) {
			var one = $("<option>" +  result[i]._id +" - "+ result[i].count +"</option>")
			$('#select').append(one)
		}
	})
	selecter.fail(function(jqXHR){
		$('#results').html("Response status:" + jqXHR.status)
	})
	//get Overall table
	var overallTable = $.get('index/overall/getTable',null)
	overallTable.done(function(result) {
		$('#title').children().remove()
		$('#title').append("<h2>" + sel.val() + "</h2>")
		$('#overallTable').html(result)
	})
	//get Bar chart
	$.getJSON('/index/overall/getBar',null, function(rdata) {
		dataBar = rdata
    	google.charts.setOnLoadCallback(drawBar)
    }
    );	
	//get Pie chart
	$.getJSON('/index/overall/getPie',null, function(rdata) {
		dataPie = rdata
    	google.charts.setOnLoadCallback(drawPie)
    }
    );
})