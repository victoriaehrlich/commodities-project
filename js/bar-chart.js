const barBlue = "#4682b4";
const middleEast = new Set(["Iraq", "Saudi Arabia", "Oman", "Iran"]);

d3.csv("data/oil-gdp.csv", d => ({
  Country: d.Entity,
  Oil_rent: +d.of_GDP,
})).then(data => {

  // Sort all countries by Oil_rent descending, then keep only the top 10.
  // .slice() does not mutate the original array.
  const top10 = data
    .sort((a, b) => b.Oil_rent - a.Oil_rent)
    .slice(0, 10);

  createVis(top10);
});

function createVis(rent) {

  const labelColWidth = 90;

  const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(rent, d => d.Oil_rent)])
    .range([labelColWidth, width / 2]);

  const yScale = d3.scaleBand()
    .domain(rent.map(d => d.Country))
    .range([0, innerHeight])
    .paddingInner(0.15);

  const fmt = d3.format(".1f");

  const chart = svg.append("g")
    .attr("transform", `translate(0, ${margin.top})`);

  // Gridlines (drawn before bars so they sit behind)
  chart.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(
      d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(-innerHeight)
        .tickFormat("")
    );

  // Each bar group holds the rect + country name + value label together
  const barGroup = chart.selectAll("g.bar")
    .data(rent)
    .join("g")
      .attr("class", "bar")
      .attr("transform", d => `translate(0, ${yScale(d.Country)})`);

  barGroup
    .append("rect")
        .attr("x", labelColWidth)
        .attr("width", d => xScale(d.Oil_rent) - labelColWidth)
        .attr("height", yScale.bandwidth())
        .attr("fill", barBlue)
        .attr("fill-opacity", d => middleEast.has(d.Country) ? 1 : 0.4)
        .attr("rx", 2)
        .attr("ry", 2);

  chart
    .append("line")
        .attr("x1", labelColWidth)
        .attr("x2", labelColWidth)
        .attr("y1", -5)
        .attr("y2", innerHeight + 5)
        .attr("stroke", barBlue)
        .attr("stroke-width", 1);

  barGroup.append("text")
    .text(d => d.Country)
    .attr("class", "bar-country")
    .attr("x", labelColWidth - 10)
    .attr("y", yScale.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle");

  barGroup.append("text")
    .text(d => `${fmt(d.Oil_rent)}%`)
    .attr("class", "bar-value")
    .attr("x", d => xScale(d.Oil_rent) + 8)
    .attr("y", yScale.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "start");

}
