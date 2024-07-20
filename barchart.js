async function init_barchart() {

  // ADD ANNOTATION AND MAKE IT INVISIBLE
  // ---------------------------------------------------------------------------------------------------------------------------------  
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // SCALERS AND OTHER VARIABLES NEEDED FOR LATER
  // ---------------------------------------------------------------------------------------------------------------------------------  
  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  width = 1060 - margin.left - margin.right;
  height = 435 - margin.top - margin.bottom;

  const data = await d3.json("https://raw.githubusercontent.com/Z-Nouman/Narrative_Viz/main/transformed_covid_data.json");
  const x = d3.scaleTime([new Date("2020-02"), new Date("2023-06")], [margin.left, 40 * 20 + margin.left]);
  const y_cases = d3.scaleLinear([33, 22000000], [height / 2, margin.top]);
  const y_deaths = d3.scaleLinear([120000, 0], [380 - margin.top, height / 2]);
  const parser = d3.timeParse("%Y-%m");

  // CREATE THE SVG CHART
  const svg = d3.select("#viz_div")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // POPULATE CHART FOR CASES
  // ---------------------------------------------------------------------------------------------------------------------------------  
  const g1 = d3.select("g")
    .selectAll("rect")
    .data(data.filter((row) => row.location === "United States"))
    .enter()
    .append("rect")
    .attr("width", 16)
    .attr("height", function (d) { return height / 2 - y_cases(d.new_cases); })
    .attr("x", function (d, i) { return x((parser(d.date))); })
    .attr("y", function (d) { return y_cases(d.new_cases) })
    .style("fill", function (d) { return 'LightSeaGreen' })
    .style("z-index", 2)
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration('100');

      //Makes div appear
      div.transition()
        .duration(100)
        .style("opacity", 1);

      div.html(`${new Intl.NumberFormat().format(d.new_cases)} New Cases in ${d.date}`)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration('200');
      div.transition()
        .duration(200)
        .style("opacity", 0);
    });

  // POPULATE CHART FOR DEATHS
  // ---------------------------------------------------------------------------------------------------------------------------------  
  const g = d3.select("g")
    .selectAll("circle")
    .data(data.filter((row) => row.location === "United States"))
    .enter()
    .append("rect")
    .attr("width", 16)
    .attr("height", function (d) { return y_deaths(d.new_deaths) - height / 2; })
    .attr("x", function (d, i) { return x((parser(d.date))); })
    .attr("y", function (d) { return height / 2 })
    .style("z-index", 2)
    .style("fill", function (d) { return 'Tomato' })
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration('100');

      //Makes div appear
      div.transition()
        .duration(100)
        .style("opacity", 1);

      div.html(`${new Intl.NumberFormat().format(d.new_deaths)} New Deaths in ${d.date}`)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
    })
    // Make div disppear on mouseout
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration('200');
      div.transition()
        .duration(200)
        .style("opacity", 0);
    });

  
  // ADD HIGHLIGHTED PORTIONS AS ANNOTATIONS
  // ---------------------------------------------------------------------------------------------------------------------------------  
  g.select("g")
    .data(['blah'])
    .enter()
    .append("rect")
    .attr("width", 16)
    .attr("height", function (d) { return height - margin.bottom - 5; })
    .attr("x", function (d, i) { return x((parser("2020-12"))); })
    .attr("y", function (d) { return margin.top })
    .attr("opacity", 0.2)
    .style("fill", 'SlateBlue');

  g.select("g")
    .data(['blah'])
    .enter()
    .append("rect")
    .attr("width", 36)
    .attr("height", function (d) { return height - margin.bottom - 5; })
    .attr("x", function (d, i) { return x((parser("2021-07"))); })
    .attr("y", function (d) { return margin.top })
    .attr("opacity", 0.2)
    .style("fill", 'SlateBlue');

  g.raise()
  g1.raise()

  // CREATE LEGEND
  // ---------------------------------------------------------------------------------------------------------------------------------  
  var keys = ['New Cases', 'New Deaths']
  g.select("g")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", 840)
    .attr("cy", function (d, i) { return 25 + i * 25 })
    .attr("r", 7)
    .style("fill", function (d, i) { return ['LightSeaGreen', 'Tomato'][i] })

  g.select("g")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 855)
    .attr("y", function (d, i) { return 30 + i * 25 })
    .style("fill", function (d, i) { return ['LightSeaGreen', 'Tomato'][i] })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "left");



  // CREATE AXIS
  // ---------------------------------------------------------------------------------------------------------------------------------
  d3.select("svg").append("g")
    .attr("transform", `translate(${margin.left + margin.left},${margin.top})`)
    .call(d3.axisLeft(y_cases));

  d3.select("svg").append("g")
    .attr("transform", `translate(${margin.left + margin.left},${margin.top})`)
    .call(d3.axisLeft(y_deaths));

  d3.select("svg").append("g")
    .attr("transform", `translate(${margin.left},${380})`)
    .call(d3.axisBottom(x));

  d3.select("svg").append("g")
    .attr("transform", `translate(${margin.left},${height / 2 + 10})`)
    .call(d3.axisBottom(x).tickValues([]).tickSize(0));

  // CREATE AXIS TITLES
  // ---------------------------------------------------------------------------------------------------------------------------------
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 480)
    .attr("y", 410)
    .text("Month");

  svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", -25)
    .attr("x", -150)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Cases / Deaths");

  // CREATE ANNOTATION TEXT
  // ---------------------------------------------------------------------------------------------------------------------------------
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("x", 195)
    .attr("y", 30)
    .text("First COVID-19 vaccines");
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("x", 195)
    .attr("y", 40)
    .text("begin distribution");
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("x", 425)
    .attr("y", 30)
    .text("70% Adults w/ at min 1 vaccine dose");
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("x", 425)
    .attr("y", 45)
    .text("CDC advises to wear masks in public");
}
// ---------------------------------------------------------------------------------------------------------------------------------