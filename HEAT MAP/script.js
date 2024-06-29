// Fetch data and draw the heat map
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then((data) => {
  const baseTemp = data.baseTemperature;
  const monthlyVariance = data.monthlyVariance;

  const width = 1000;
  const height = 500;
  const padding = 60;

  const svg = d3.select("#heatmap").append("svg").attr("width", width).attr("height", height);

  const xScale = d3
    .scaleBand()
    .domain(monthlyVariance.map((d) => d.year))
    .range([padding, width - padding]);

  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([padding, height - padding]);

  const colorScale = d3.scaleSequential(d3.interpolateInferno).domain(d3.extent(monthlyVariance, (d) => baseTemp + d.variance));

  const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter((year) => year % 10 === 0));

  const yAxis = d3.axisLeft(yScale).tickFormat((month) => d3.timeFormat("%B")(new Date(0).setUTCMonth(month)));

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  svg.append("g").attr("id", "y-axis").attr("transform", `translate(${padding}, 0)`).call(yAxis);

  svg
    .selectAll(".cell")
    .data(monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month - 1))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(baseTemp + d.variance))
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => baseTemp + d.variance)
    .on("mouseover", function (event, d) {
      d3.select("#tooltip")
        .style("display", "block")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`)
        .html(`Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(new Date(0).setUTCMonth(d.month - 1))}<br>Temperature: ${(baseTemp + d.variance).toFixed(2)}℃`);
      d3.select("#tooltip").attr("data-year", d.year);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("display", "none");
    });

  const legend = d3.select("#legend").append("svg").attr("width", width).attr("height", 50);

  const legendScale = d3
    .scaleLinear()
    .domain(d3.extent(monthlyVariance, (d) => baseTemp + d.variance))
    .range([padding, width - padding]);

  const legendAxis = d3.axisBottom(legendScale).ticks(10).tickFormat(d3.format(".1f"));

  const legendData = d3.range(d3.min(legendScale.domain()), d3.max(legendScale.domain()), 0.1);

  legend
    .selectAll(".legend-cell")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "legend-cell")
    .attr("x", (d) => legendScale(d))
    .attr("y", 0)
    .attr("width", (width - 2 * padding) / legendData.length)
    .attr("height", 20)
    .attr("fill", (d) => colorScale(d));

  legend.append("g").attr("transform", `translate(0, 20)`).call(legendAxis);
});
