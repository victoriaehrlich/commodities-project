const createTooltip = (data) => {

    const textColor = "#666";

    const tooltip = innerChart
        .append("g")
            .attr("class", "tooltip")
            .style("visibility", "hidden");

    tooltip
        .append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", -30)
            .attr("y2", innerHeight)
            .attr("stroke", textColor)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4 4");

    tooltip
        .append("text")
            .attr("class", "tooltip-year")
            .attr("x", 8);

    tooltip
        .append("text")
            .attr("class", "tooltip-price")
            .attr("x", 8);

};

const handleMouseEvents = (data) => {

    const bisect = d3.bisector(d => d.Date).left;

    d3.selectAll(".area-path")
        .on("mousemove", e => {

            const xPosition = d3.pointer(e)[0];
            const date = xScale.invert(xPosition);
            const index = bisect(data, date);
            const d0 = data[index - 1];
            const d1 = data[index];
            const closest = !d0 ? d1 : !d1 ? d0 : date - d0.Date < d1.Date - date ? d0 : d1;

            const snappedX = xScale(closest.Date);
            const priceY = yScale(closest.Urea);

            const d = closest.Date;
            const isLeft = (d >= new Date(2021, 2, 1) && d < new Date(2022, 3, 1))
                        || (d >= new Date(2025, 8, 1));
            const xOffset = isLeft ? -8 : 8;
            const anchor = isLeft ? "end" : "start";

            d3.select(".tooltip")
                .style("visibility", "visible")
                .attr("transform", `translate(${snappedX}, 0)`);

            d3.select(".tooltip-year")
                .attr("x", xOffset)
                .attr("text-anchor", anchor)
                .attr("y", priceY - 51)
                .text(d3.timeFormat("%b %Y")(closest.Date));

            d3.select(".tooltip-price")
                .attr("x", xOffset)
                .attr("text-anchor", anchor)
                .attr("y", priceY - 38)
                .text(`${d3.format(",.0f")(closest.Urea)} $/mt`);
        })
        .on("mouseleave", () => {
            d3.select(".tooltip").style("visibility", "hidden");
        });

};
