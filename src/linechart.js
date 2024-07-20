async function updateChart() {
    d3.select("#viz_div").selectAll("*").remove();
    init_linechart(document.querySelector('#location1').value, document.querySelector('#location2').value, document.querySelector('#metric').value)
}

async function init_linechart(location1, location2, metric) {
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

    var highest_y = null;
    var metric = metric ? metric : "total_deaths_per_million";
    var current_data = data.filter((row) => row.location === (location2 ? location2 : "France") || row.location === (location1 ? location1 : "United States"));
    for (i in current_data) {
        if (!highest_y || highest_y < current_data[i][metric]) {
            highest_y = current_data[i][metric];
        }
    }

    const y = d3.scaleLinear([0, highest_y], [380 - margin.top, margin.bottom]);
    const parser = d3.timeParse("%Y-%m");
    var color = d3.scaleOrdinal()
        .domain(["North America", "Asia", "Africa", "Europe", "South America", "Oceania"])
        .range(d3.schemeSet1);

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

    // CREATE THE SVG CHART
    const svg = d3.select("#viz_div")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // POPULATE CHART WITH BLUE LINE (LOCATION1)
    // ---------------------------------------------------------------------------------------------------------------------------------  
    d3.select("g")
        .append("path")
        .datum(data.filter((row) => row.location === (location1 ? location1 : "United States")))
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("d", d3.line()
            .x(function (d) { return x((parser(d.date))); })
            .y(function (d) { return y(d[metric]); })
        );

    // POPULATE CHART WITH RED DOTS (LOCATION2)
    // ---------------------------------------------------------------------------------------------------------------------------------  
    d3.select("g").selectAll('myCircles')
        .data(data.filter((row) => row.location === (location2 ? location2 : "France")))
        .enter()
        .append("circle")
        .attr("fill", "Tomato")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x((parser(d.date))); })
        .attr("cy", function (d) { return y(d[metric]); })
        .attr("r", 5)
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('100')
                .attr("r", 8);

            //Makes div appear
            div.transition()
                .duration(100)
                .style("opacity", 1);

            div.html(`In ${d.date}, ${(location2 ? location2 : "France")} had ${new Intl.NumberFormat().format(d[metric])} ${metric}`)
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

    // POPULATE CHART WITH BLUE DOTS (LOCATION1)
    // ---------------------------------------------------------------------------------------------------------------------------------  
    d3.select("g").selectAll('myCircles')
        .data(data.filter((row) => row.location === (location1 ? location1 : "United States")))
        .enter()
        .append("circle")
        .attr("fill", "steelblue")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x((parser(d.date))); })
        .attr("cy", function (d) { return y(d[metric]); })
        .attr("r", 5)
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('100')
                .attr("r", 8);

            //Makes div appear
            div.transition()
                .duration(100)
                .style("opacity", 1);

            div.html(`In ${d.date}, ${(location1 ? location1 : "United States")} had ${new Intl.NumberFormat().format(d[metric])} ${metric}`)
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

    // POPULATE CHART WITH BLUE LINE (LOCATION1)
    // ---------------------------------------------------------------------------------------------------------------------------------  
    d3.select("g")
        .append("path")
        .datum(data.filter((row) => row.location === (location2 ? location2 : "France")))
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("stroke", "Tomato")
        .attr("d", d3.line()
            .x(function (d) { return x((parser(d.date))); })
            .y(function (d) { return y(d[metric]); })
        );

    // POPULATE SELECT DROPDOWNS WITH LOCATIONS AND METRIC TYPES
    // ---------------------------------------------------------------------------------------------------------------------------------  
    d3.select("#location1")
        .selectAll("option")
        .data(data.filter((row) => row.date == '2023-05' && !(String(row.iso_code).includes("OWID"))))
        .enter()
        .append("option")
        .attr("value", function (d) { return d.location; })
        .attr("id", function (d) { return d.location; })
        .text(function (d) { return d.location; });

    d3.select("#location2")
        .selectAll("option")
        .data(data.filter((row) => row.date == '2023-05' && !(String(row.iso_code).includes("OWID"))))
        .enter()
        .append("option")
        .attr("value", function (d) { return d.location; })
        .attr("id", function (d) { return d.location; })
        .text(function (d) { return d.location; });

    if (!location1) {
        d3.select("#United\\ States")
            .property("selected", true);
        d3.select(".location2").select("#France")
            .property("selected", true);
    }

    d3.select("#metric")
        .selectAll("option")
        .data(['new_cases', 'new_deaths', 'total_cases_per_million', 'total_deaths_per_million'])
        .enter()
        .append("option")
        .attr("value", function (d) { return d; })
        .attr("id", function (d) { return d; })
        .text(function (d) { return d; });
    d3.select(`#${metric}`)
        .property("selected", true);

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

    var keys = [(location1 ? location1 : "United States"), (location2 ? location2 : "France")]

    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(['steelblue', 'Tomato']);

    Svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", 930)
        .attr("cy", function (d, i) { return 25 + i * 25 })
        .attr("r", 7)
        .style("fill", function (d) { return color(d) })

    Svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 945)
        .attr("y", function (d, i) { return 30 + i * 25 })
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "left");


    // CREATE AXIS TITLES
    // ---------------------------------------------------------------------------------------------------------------------------------
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 480)
        .attr("y", 410)
        .text("Month");

    if (metric == 'new_cases') {
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("y", -25)
            .attr("x", -150)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("New Cases");
    }
    else if (metric == 'new_deaths') {
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("y", -25)
            .attr("x", -150)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("New Deaths");
    }
    else if (metric == 'total_cases_per_million') {
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("y", -25)
            .attr("x", -100)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Cases Per Million To Date");
    }
    else if (metric == 'total_deaths_per_million') {
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("y", -25)
            .attr("x", -100)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Deaths Per Million To Date");
    }
}