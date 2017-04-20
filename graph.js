 /*
   In this file we have a code for rendering D3 Chart from JSON data.
   Here we have 3 Chart in which 2 are Bar Chart (For Agewise and Educationwise)
   and 1 is Stacked Bar Chart between Statewise and Genderwise.
 */

 // set the dimensions of the graph
  var margin = {top: 30, right: 20, bottom: 100, left: 140},
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      padding = 100;


  // set the ranges
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var y = d3.scale.linear().range([height, 0]);

  // define the axis
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(15)
      .tickFormat(d3.format("s"));
  
/* Population Chart code starts here */
function renderPopulationData(){  
  renderBarGraph("population13", "Countrywise Population", "Country", "country", "Total Population(In Millions)", "population13", "Population");
}
/* Population Chart code ends here */

/* GDP Chart code starts here */
function renderGDPData(){  
  renderBarGraph("gdp13", "Countrywise GDP", "Country", "country", "GDP Billions (US$)", "gdp13", "GDP");
}
/* GDP Chart code ends here */

/* Purchase Power Chart code starts here */
function renderPurchasingData(){  
  renderBarGraph("purchase13", "Countrywise Purchase Power", "Country", "country", "Purchasing Power in Billions", "purchase13", "Purchase Power");
}
/* Purchase Power Chart code ends here */

/*
  Render Bar Chart from JSON
*/
function renderBarGraph(jsonName, heading, xTitle, xKeyName, yTitle, yKeyName, yAxisTitle){
  d3.json("./jsonData/"+jsonName+".json", function(error, data) {

    document.getElementById("heading").innerHTML = "<h1>"+heading+"</h1>";
    document.getElementById("graph").innerHTML = "";
    // add the SVG element
    var svg = d3.select("#graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
    
    // Toottip Code for Bars
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
      return "<div><strong>"+xTitle+":</strong> <span>" + d[xKeyName] + "</span></div><strong>"+yTitle+":</strong> <span>" + d[yKeyName] + "</span>";
    })
    svg.call(tip);

    data.forEach(function(d) {
        d[xKeyName] = d[xKeyName];
        d[yKeyName] = +d[yKeyName];
    });

    x.domain(data.map(function(d) { return d[xKeyName]; }));
    y.domain([0, d3.max(data, function(d) {return d[yKeyName]; })]);

    // add axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("dy", "-.35em")
        .attr("transform", "rotate(-45)" );
  
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")
        .style("font-size","20px")
        .attr("y", -5)
        .attr("dy", "-4em")
        .style("text-anchor", "middle")
        .text(yAxisTitle);

    // Add bar chart
    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[xKeyName]); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) {return y(d[yKeyName]); })
        .attr("height", function(d) { return height - y(d[yKeyName]); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
  });
}

/* Growth Chart code starts here */
function renderGrowthData(){
  renderStackChart("Growth_Chart", "Population & Purchasing Growth", "country", "population_Growth", "purchase_Growth");
}
/* Growth Chart code ends here */

/* Aggregate Chart code starts here */
function renderAggregateData(){
  renderStackChart("aggregate", "Population & GDP Aggregate", "CONTINENT", "POPULATION", "GDP");
}
/* Aggregate Chart code ends here */

function renderStackChart(jsonName, heading, xKeyName, y1, y2){
  d3.json("./jsonData/"+jsonName+".json", function(error, data) {
    document.getElementById("heading").innerHTML = "<h1>"+heading+"</h1>";
    document.getElementById("graph").innerHTML = "";
    // add the SVG element
    var svg = d3.select("#graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  // Transpose the data into layers
  var dataset = d3.layout.stack()([y1, y2].map(function(y) {
    return data.map(function(d) {
      return {x: (d[xKeyName]), y: +d[y]};
    });
  }));


  // Set x, y and colors
  var x = d3.scale.ordinal()
    .domain(dataset[0].map(function(d) { return d.x; }))
    .rangeRoundBands([10, width-10], 0.02);

  var y = d3.scale.linear()
    .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
    .range([height, 0]);

  var colors = ["#ed1b17", "#4ef442"];

  // Define and draw axes
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width, 0, 0)
    .tickFormat(d3.format("s"));
    // .tickFormat( function(d) { return d } );

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.5em")
    .attr("dy", "-.35em")
    .attr("transform", "rotate(-45)");

  // Create groups for each series, rects for each segment 
  var groups = svg.selectAll("g.cost")
    .data(dataset)
    .enter().append("g")
    .attr("class", "cost")
    .style("fill", function(d, i) { return colors[i]; });

  var rect = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.x); })
    .attr("y", function(d) { return y(d.y0 + d.y); })
    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
    .attr("width", x.rangeBand())
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
      var xPosition = d3.mouse(this)[0] - 15;
      var yPosition = d3.mouse(this)[1] - 25;
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      tooltip.select("text").html((d.y0 == 0)?("Population Growth - "+ d3.format(".2f")(d.y)):("Purchase Growth - "+ d3.format(".2f")(d.y)));
    });

  // Prep the tooltip bits, initial display is hidden
  var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");
      
  tooltip.append("rect")
    .attr("width", 30)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

  tooltip.append("text")
    .attr("x", 15)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
  });
}