// Create the line chart here
const drawLineChart = (data) => {

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    ureaInnerChart = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const firstDate = d3.min(data, d => d.Date);
    const lastDate = d3.max(data, d => d.Date);

    lineXScale = d3.scaleTime()
        .domain([firstDate, lastDate])
        .range([0, innerWidth]);
    const xScale = lineXScale;

    const maxPrice = d3.max(data, d => d.Urea);
    lineYScale = d3.scaleLinear()
        .domain([0, maxPrice * 1.05]) // adding some headroom
        .range([innerHeight, 0]);
    const yScale = lineYScale;

    // grid first
    ureaInnerChart.append("g")
        .attr("class", "grid")
        .call(
            d3.axisLeft(yScale)
                .ticks(6) // need to test to review its logic, into 6 areas? 
                .tickSize(-innerWidth) // negative to then go right and follow the entire ureaInnerChart length 
                .tickFormat("")
        );

    const bottomAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(6)) // every 6 month, values you put a tick 
        .tickFormat(d => {
            const month = d.getMonth();
            if (month === 0) return d3.timeFormat("%Y")(d);
            if (month === 6) return "Jul";
            return "";
        });

    const leftAxis = d3.axisLeft(yScale);

    ureaInnerChart
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("r", 2)
        .attr("cx", d => xScale(d.Date))
        .attr("cy", d => yScale(d.Urea))
        .attr("fill", fertiliser);

    ureaInnerChart
        .append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis);

    ureaInnerChart
        .append("g")
        .attr("class", "axis-y")
        .call(leftAxis);

    const lineGenerator = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.Urea))
        .curve(d3.curveCardinal);

    ureaInnerChart
        .append("path")
        .attr("d", lineGenerator(data))
        .attr("stroke", fertiliser)
        .attr("stroke-width", 1.8)
        .attr("fill", "none");

    const areaGenerator = d3.area()
        .x(d => xScale(d.Date))
        .y0(yScale(0))
        .y1(d => yScale(d.Urea))
        .curve(d3.curveCardinal);

    ureaInnerChart
        .append("path")
        .attr("d", areaGenerator(data))
        .attr("fill", fertiliser)
        .attr("fill", "url(#area-gradient)");

    //try and append area gradient fill
    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient") // this part sets the direction of the gradient from bottom to top rather than x1 to x2
        .attr("id", "area-gradient") // id's work like division id's or #to define a style or reference something
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    gradient.append("stop") // defines the opacity at y2 
        .attr("offset", "0%")
        .attr("stop-color", fertiliser)
        .attr("stop-opacity", 0);

    gradient.append("stop") // defines opacity at y1
        .attr("offset", "100%")
        .attr("stop-color", fertiliser)
        .attr("stop-opacity", 0.35);

    svg
        .append("text")
        .attr("class", "chart-label")
        .text("Urea prices ($/mt)")
        .attr("x", margin.left)
        .attr("y", 20);

    // add russian invasion of Ukraine to marke rise of prices

    const invasionDate = new Date(2022, 1, 24); // 24 Feb 2022 Russia Ukraine
    
    ureaInnerChart
        .append("line")
        .attr("class", "event-line")
        .attr("x1", xScale(invasionDate))
        .attr("x2", xScale(invasionDate))
        .attr("y1", yScale(0))
        .attr("y2", 0)
        .attr("stroke", "#777")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

    ureaInnerChart
        .append("text")
        .attr("class", "event-label")
        .attr("x", xScale(invasionDate) + 6)
        .attr("y", 350)
        .text("Russian invasion of Ukraine");

    const invasionDateUS = new Date(2026, 1, 28); // 15 Feb 2026 US launch attacks on Iran

    ureaInnerChart
        .append("line")
        .attr("class", "event-line")
        .attr("x1", xScale(invasionDateUS))
        .attr("x2", xScale(invasionDateUS))
        .attr("y1", yScale(0))
        .attr("y2", 0)
        .attr("stroke", "#777")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

    const usLabel = ureaInnerChart
    .append("text")
    .attr("class", "event-label")
    .attr("x", xScale(invasionDateUS) - 106)
    .attr("y", 320);

    usLabel.append("tspan")
        .attr("x", xScale(invasionDateUS) - 106)
        .attr("dy", "0em")
        .text("US and Israel launch");

    usLabel.append("tspan")
        .attr("x", xScale(invasionDateUS) - 106)
        .attr("dy", "1.1em")
        .text("attacks on Iran");
};