// Fetch data and draw the choropleth map
const educationDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(educationDataUrl), d3.json(countyDataUrl)]).then((data) => {
  const educationData = data[0];
  const countyData = topojson.feature(data[1], data[1].objects.counties).features;

  const width = 1000;
  const height = 600;
  const padding = 60;

  const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);

  const colorScale = d3
    .scaleQuantize()
    .domain(d3.extent(educationData, (d) => d.bachelorsOrHigher))
    .range(d3.schemeBlues[9]);

  const path = d3.geoPath();

  svg
    .selectAll(".county")
    .data(countyData)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", (d) => {
      const county = educationData.find((ed) => ed.fips === d.id);
      return county ? colorScale(county.bachelorsOrHigher) : "#ccc";
    })
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => {
      const county = educationData.find((ed) => ed.fips === d.id);
      return county ? county.bachelorsOrHigher : 0;
    })
    .on("mouseover", function (event, d) {
      const county = educationData.find((ed) => ed.fips === d.id);
      d3.select("#tooltip")
        .style("display", "block")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`)
        .html(`${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`);
      d3.select("#tooltip").attr("data-education", county.bachelorsOrHigher);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("display", "none");
    });

  const legend = d3.select("#legend").append("svg").attr("width", width).attr("height", 60);

  const legendScale = d3
    .scaleLinear()
    .domain(d3.extent(educationData, (d) => d.bachelorsOrHigher))
    .range([padding, width - padding]);

  const legendAxis = d3.axisBottom(legendScale).ticks(10).tickFormat(d3.format(".1f"));

  const legendData = colorScale.range().map((d) => colorScale.invertExtent(d));

  legend
    .selectAll(".legend-cell")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "legend-cell")
    .attr("x", (d) => legendScale(d[0]))
    .attr("y", 20)
    .attr("width", (d) => legendScale(d[1]) - legendScale(d[0]))
    .attr("height", 20)
    .attr("fill", (d) => colorScale(d[0]));

  legend.append("g").attr("transform", `translate(0, 40)`).call(legendAxis);
});

// Tooltip div
d3.select("body").append("div").attr("id", "tooltip");
