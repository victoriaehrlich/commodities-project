const createTooltip = () => {

  const textColor = "#666";

  const tooltip = ureaInnerChart
    .append("g")
      .attr("class", "tooltip")
      .style("display", "none");

  tooltip
    .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", textColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4");

  const tooltip_box = tooltip
    .append("g")
      .attr("class", "tooltip-box")
      .style("display", "none")

  tooltip_box
    .append("rect")
      .attr("class", "tooltip-rect")
      .attr("x", 2)          // small offset from  line
      .attr("y", 4)          // small offset from  top -- reference the y scale 
      .attr("width", 74)     
      .attr("height", 38)    
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .attr("rx", 3)        
      .attr("ry", 3);

  tooltip_box // wrap the text into the box 
    .append("text")
      .attr("class", "tooltip-date")
      .attr("x", 8)
      .attr("y", 9)
      .attr("dominant-baseline", "hanging");

  tooltip_box
    .append("text")
      .attr("class", "tooltip-price")
      .attr("x", 8)
      .attr("y", 27)
     .attr("dominant-baseline", "hanging");

}

const handleMouseEvents = (data) => {

  const bisect = d3.bisector(d => d.Date).left;
  // https://d3js.org/d3-array/bisect allows to choose the nearest date
  // .left returns the index to the left of it (i.e. that point itself).

  ureaInnerChart
    .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", e => {

        const xPos = d3.pointer(e)[0]; //d3.pointer(e)[0] — gives you the cursor's position in pixels (just the x axis, hence [0])
        const hoveredDate = lineXScale.invert(xPos); // x scale normally converts dates → pixels. .invert goes backwards: pixels → date. to get the right data from the mouse hover

        // Snap to nearest data point
        const index = bisect(data, hoveredDate); //bisect finds the insertion index for your hovered date.
        const d0 = data[index - 1]; //index before
        const d1 = data[index]; // index ahead
        let d;
        if (!d0) d = d1;
        else if (!d1) d = d0;
        else d = (hoveredDate - d0.Date) < (d1.Date - hoveredDate) ? d0 : d1;
        // describes scenarios where you are at beginning of line chart i.e., !d0 doesn't exist - use d1
        // !d1 doesn't exist, you are at the end of the chart - use d0
        // both exist - pick whichever is mathematically closer to the cursor

        d3.select(".tooltip")
          .style("display", null) //makes toolip visible
          .attr("transform", `translate(${lineXScale(d.Date)}, 0)`); // moves the tooltip to wherever your mouse is, by referencing the Date position not the cursor position

        d3.select(".tooltip-box")
          .style("display", null) //makes toolip visible
          .attr("transform", `translate(0, ${lineYScale(d.Urea) - 50})`); // makes the tooltip box dynamic and responding to the Urea cost

        d3.select(".tooltip-date").text(d3.timeFormat("%b %Y")(d.Date)); //adds the date to tooltip
        d3.select(".tooltip-price").text(`$${d3.format(",.0f")(d.Urea)}/mt`); // adds the price to tooltip 

      })
      .on("mouseleave", () => {
        d3.select(".tooltip").style("display", "none"); // tooltip make to invisible when mouse leaves
      });

}

const createOilTooltip = () => {

  const textColor = "#666";

  const tooltip = oilInnerChart
    .append("g")
      .attr("class", "tooltip-oil")
      .style("display", "none");

  tooltip
    .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", textColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4");

  const tooltip_box = tooltip
    .append("g")
      .attr("class", "tooltip-box-oil")
      .style("display", "none")

  tooltip_box
    .append("rect")
      .attr("class", "tooltip-rect")
      .attr("x", 2)
      .attr("y", 4)
      .attr("width", 74)
      .attr("height", 38)
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .attr("rx", 3)
      .attr("ry", 3);

  tooltip_box
    .append("text")
      .attr("class", "tooltip-date-oil")
      .attr("x", 8)
      .attr("y", 9)
      .attr("dominant-baseline", "hanging");

  tooltip_box
    .append("text")
      .attr("class", "tooltip-price-oil")
      .attr("x", 8)
      .attr("y", 27)
      .attr("dominant-baseline", "hanging");

}

const handleOilMouseEvents = (data) => {

  const bisect = d3.bisector(d => d.DateOil).left;

  oilInnerChart
    .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", e => {

        const xPos = d3.pointer(e)[0];
        const hoveredDate = oilXScale.invert(xPos);

        const index = bisect(data, hoveredDate);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d;
        if (!d0) d = d1;
        else if (!d1) d = d0;
        else d = (hoveredDate - d0.DateOil) < (d1.DateOil - hoveredDate) ? d0 : d1;

        d3.select(".tooltip-oil")
          .style("display", null)
          .attr("transform", `translate(${oilXScale(d.DateOil)}, 0)`);
        
        d3.select(".tooltip-box-oil")
          .style("display", null)
          .attr("transform", `translate(0, ${oilYScale(d.Crude)- 50 })`);

        d3.select(".tooltip-date-oil").text(d3.timeFormat("%b %Y")(d.DateOil));
        d3.select(".tooltip-price-oil").text(`$${d3.format(",.0f")(d.Crude)}/barrel`);

      })
      .on("mouseleave", () => {
        d3.select(".tooltip-oil").style("display", "none");
      });

}


// Button toggle — switches between the urea and oil line charts //
// Two buttons sit permanently in the chart header. Only the active one
// gets a coloured background (urea: rose, oil: blue). The inactive button
// falls back to the default grey style defined in main.css.

const setupToggle = () => {

    // Grab the two buttons and all chart elements that need to show/hide
    const btnUrea    = document.getElementById("btnUrea");
    const btnOil     = document.getElementById("btnOil");
    const ureaChart  = document.getElementById("line-chart");
    const oilChart   = document.getElementById("line-chart-oil");
    const ureaSource = document.getElementById("source-urea");
    const oilSource  = document.getElementById("source-oil");
    const ureaTitle  = document.getElementById("urea-chart-title");
    const oilTitle   = document.getElementById("oil-chart-title");

    // Fades out fromEls, then once all are hidden, fades in toEls
    // Sequential (not simultaneous) so both chart groups are never visible at once
    const switchCharts = (fromEls, toEls) => {
        let done = 0; // tracks how many fade-outs have finished
        fromEls.forEach(el => {
            d3.select(el)
                .transition().duration(200).ease(d3.easeCubicOut) // animate over 200ms with a cubic ease-out curve
                .style("opacity", 0) // fade to invisible
                .on("end", function() { // fires once this element's transition completes
                    d3.select(this).style("display", "none"); // fully remove from layout
                    if (++done === fromEls.length) { // only proceed once every fromEl has finished
                        toEls.forEach(t => d3.select(t)
                            .style("display", "").style("opacity", 0) // put back in layout but invisible
                            .transition().duration(200).ease(d3.easeCubicOut) // same curve and duration
                            .style("opacity", 1)); // fade up to fully visible
                    }
                });
        });
    };

    // Oil chart is hidden on page load — urea is shown by default
    oilChart.style.display = "none";
    oilTitle.style.display = "none";

    // Clicking "Urea prices" shows the urea chart and marks it active
    btnUrea.addEventListener("click", () => {
        switchCharts(
            [oilChart, oilTitle, oilSource],
            [ureaChart, ureaTitle, ureaSource]
        );
        btnUrea.classList.add("active");    // apply rose highlight
        btnOil.classList.remove("active");  // remove blue highlight - active section from html/css file
    });

    // Clicking "Oil prices" shows the oil chart and marks it active
    btnOil.addEventListener("click", () => {
        switchCharts(
            [ureaChart, ureaTitle, ureaSource],
            [oilChart, oilTitle, oilSource]
        );
        btnOil.classList.add("active");     // apply blue highlight
        btnUrea.classList.remove("active"); // remove rose highlight - active section from html/css file
    });
};

setupToggle();

/* ---------------------------*/
// Populate filters

const populateFilters =(world, rent, ureaData) => {
  const labelColWidth = 90;

  d3.select("#filters")
    .selectAll(".filter")
    .data(filters)
    .join("button")
      .attr("class", d=> `filter ${d.isActive ? "active" : ""}`)
      .attr("data-id", d => d.id)
      .text(d=> d.label)
    .on("click", (e,d) => {
      // console.log("DOM event", e);
      // console.log("attached datum", d)
    if (!d.isActive) {
      filters.forEach(filter => // for every row in filter array where theres two of them, if d isnot active then we change the filter active to the d.id that was clicked
        filter.isActive = (d.id === filter.id) ? true : false
      )
      d3.select("#filters").selectAll("button.filter")
        .attr("class", f => `filter ${f.isActive ? "active" : ""}`);
        //added button filters 
      }


    if (d.id === "Urea") {
  
    const ureaDataSorted = ureaData
                    .sort((a, b) => b.urea_gdp - a.urea_gdp)
                    .slice(0, 10);  
    
    const ureaXScale = d3.scaleLinear()
    .domain([0, d3.max(ureaData, d => d.urea_gdp)])
    .range([labelColWidth, width / 2]);

   d3.selectAll("#bar-chart g.bar").data(ureaDataSorted);
   // we want the sorted Urea data in the bars

   d3.selectAll("#bar-chart rect")
      .data(ureaDataSorted)
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("width", d=> ureaXScale(d.urea_gdp)- labelColWidth)
      .attr("fill", d=> ureaColourScale(d.urea_gdp));
      // if it is Urea we use the urea colour scale

     world.features.forEach(country=> {
    const props = country.properties;
    const match = ureaDataSorted.find(r => r.Country === props.name);
    props.urea_gdp = match ? match.urea_gdp : 0;
    });

  d3.selectAll(".bar-country")
    .data(ureaDataSorted)
    .text(d=> d.Country);

  d3.selectAll(".bar-value")
    .data(ureaDataSorted)
    .text(d => `${d3.format("0.2f")(d.urea_gdp)}%`)
    .attr("x", d => ureaXScale(d.urea_gdp) + 8)

d3.selectAll(".country-path")
        .transition()
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr("fill", d => d.properties.urea_gdp > 0 ? ureaColourScale(d.properties.urea_gdp) : "#eae8e8ff");

    // added elements outside of map that we want to update with button (title, subtile, and source)
    // any changes we want to make to those items need to be made in html file 
    document.getElementById("bar-title-oil").style.display = "none";
    document.getElementById("bar-title-urea").style.display = "";
    document.getElementById("bar-subtitle-oil").style.display = "none";
    document.getElementById("bar-subtitle-urea").style.display = "";
    document.getElementById("bar-source-oil").style.display = "none";
    document.getElementById("bar-source-urea").style.display = "";
 } else {

   const labelColWidth = 90;
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(rent, d => d.Oil_rent)])
      .range([labelColWidth, width / 2]);

  const yScale = d3.scaleBand()
    .domain(rent.map(d => d.Country))
    .range([0, innerHeight])
    .paddingInner(0.15);

   d3.selectAll("#bar-chart g.bar").data(rent);
   // we want the oil data here - already the top 10 so no need to reference sorted like for Urea rent

   d3.selectAll("#bar-chart rect")
      .data(rent)
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("width", d=> xScale(d.Oil_rent) - labelColWidth)
      .attr("fill", d=> oilColourScale(d.Oil_rent));

  d3.selectAll(".bar-country")
    .data(rent)
    .text(d => d.Country === "Congo, Republic of the" ? "Congo, Rep." : d.Country);
    // make sure the name for Congo stays the same across button interaction

      d3.selectAll(".bar-value")
    .data(rent)
    .text(d => `${d3.format(".1f")(d.Oil_rent)}%`)
    .attr("x", d => xScale(d.Oil_rent) + 8)

     world.features.forEach(country=> {
    const props = country.properties;
    const match = rent.find(r => r.Country === props.name);
    props.Oil_rent = match ? match.Oil_rent : 0;
    });

  d3.selectAll(".country-path")
          .transition()
          .duration(500)
          .ease(d3.easeCubicOut)
          .attr("fill", d => d.properties.Oil_rent > 0 ? oilColourScale(d.properties.Oil_rent) : "#eae8e8ff")
          .attr("fill-opacity", 0.8)
          .attr("stroke", "#afaeaeff")
          .attr("stroke-opacity", 0.7);

    // and again makes sure title, subtitle and source are also updated
    document.getElementById("bar-title-oil").style.display = "";
    document.getElementById("bar-title-urea").style.display = "none";
    document.getElementById("bar-subtitle-oil").style.display = "";
    document.getElementById("bar-subtitle-urea").style.display = "none";
    document.getElementById("bar-source-oil").style.display = "";
    document.getElementById("bar-source-urea").style.display = "none";
      }
    })
}
