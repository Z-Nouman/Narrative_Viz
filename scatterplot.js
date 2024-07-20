async function init_scatterplot() {
  // ADD TOOLTIP AND MAKE IT INVISIBLE
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
  console.log(data);
  const filtered = data.filter((row) => (row.date === "2023-05") && (row.population > 3000000));
  console.log(filtered);
  const x = d3.scaleLinear([0, 6500], [margin.left, 40 * 20 + margin.left]);
  const y = d3.scaleLinear([0, 800000], [380 - margin.top, margin.bottom]);
  var color = d3.scaleOrdinal()
    .domain(["North America", "Asia", "Africa", "Europe", "South America", "Oceania"])
    .range(d3.schemeSet1);

  // ADD ANNOTATION
  // ---------------------------------------------------------------------------------------------------------------------------------  
  const annotations = [
    {
      note: {
        label: "305,763 total cases per million\n3,336 total deaths per million",
        title: "United States"
      },
      color: ["#69b3a2"],
      x: 530,
      y: 250,
      dy: -130,
      dx: -110
    }
  ];
  const makeAnnotations = d3.annotation()
    .annotations(annotations)

  // CREATE THE SVG CHART
  const svg = d3.select("#viz_div")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // POPULATE CHART
  // ---------------------------------------------------------------------------------------------------------------------------------  
  d3.select("g")
    .selectAll("circle")
    .data(data.filter((row) => (row.date === "2023-05") && (row.population > 1000000) && !(String(row.iso_code).includes("OWID"))))
    .enter().append("circle")
    .attr("r", 5)
    .attr("cx", function (d, i) { return x(d.total_deaths_per_million) })
    .attr("cy", function (d) { return y(d.total_cases_per_million) })
    .style("fill", function (d) { return color(d.continent) })
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration('100')
        .attr("r", 7);

      //Makes div appear
      div.transition()
        .duration(100)
        .style("opacity", 1);

      div.html(d.location)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration('200')
        .attr("r", 5);

      div.transition()
        .duration(200)
        .style("opacity", 0);
    });

  // POPULATE CHART WITH ANNOTATION
  // ---------------------------------------------------------------------------------------------------------------------------------  
  d3.select("svg").append("g").call(makeAnnotations);

  // CREATE AXIS
  // ---------------------------------------------------------------------------------------------------------------------------------
  d3.select("svg").append("g")
    .attr("transform", `translate(${margin.left + margin.left},${margin.top})`)
    .call(d3.axisLeft(y));

  d3.select("svg").append("g")
    .attr("transform", `translate(${margin.left},${380})`)
    .call(d3.axisBottom(x));

  // CREATE LEGEND
  // ---------------------------------------------------------------------------------------------------------------------------------  
  var Svg = d3.select("svg")

  var keys = ["North America", "Asia", "Africa", "Europe", "South America", "Oceania"]

  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet1);

  Svg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", 840)
    .attr("cy", function (d, i) { return 25 + i * 25 })
    .attr("r", 7)
    .style("fill", function (d) { return color(d) })

  Svg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 855)
    .attr("y", function (d, i) { return 30 + i * 25 })
    .style("fill", function (d) { return color(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "left");

  // CREATE AXIS TITLES
  // ---------------------------------------------------------------------------------------------------------------------------------
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 650)
    .attr("y", 410)
    .text("Total deaths attributed to COVID-19 per 1,000,000 people");

  svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", -25)
    .attr("x", -15)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Total confirmed cases of COVID-19 per 1,000,000 people");
}