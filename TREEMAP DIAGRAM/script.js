const url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

d3.json(url)
  .then((data) => {
    const width = 1000;
    const height = 600;

    const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);

    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).padding(1)(root);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const tiles = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    tiles
      .append("rect")
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => color(d.data.category))
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .on("mouseover", function (event, d) {
        d3.select("#tooltip")
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
          .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`);
        d3.select("#tooltip").attr("data-value", d.data.value);
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("display", "none");
      });

    tiles
      .append("text")
      .attr("class", "tile-text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 13 + i * 10)
      .text((d) => d);

    const categories = root
      .leaves()
      .map((nodes) => nodes.data.category)
      .filter((category, index, self) => self.indexOf(category) === index);

    const legendItemSize = 16;
    const legendSpacing = 4;

    const legend = d3
      .select("#legend")
      .append("svg")
      .attr("width", 200)
      .attr("height", categories.length * (legendItemSize + legendSpacing));

    const legendItems = legend
      .selectAll(".legend-item")
      .data(categories)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`);

    legendItems
      .append("rect")
      .attr("class", "legend-item")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendItemSize)
      .attr("height", legendItemSize)
      .attr("fill", (d) => color(d));

    legendItems
      .append("text")
      .attr("x", legendItemSize + legendSpacing)
      .attr("y", legendItemSize / 1.5)
      .attr("text-anchor", "start")
      .text((d) => d);
  })
  .catch((error) => {
    console.error("Error loading or parsing data:", error);
  });
