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


// this section covers the button interactions to mvoe betwene line and oil chart // 

let showingOil = false; 

const setupToggle = () => { // the grab HTML elements in the html file, they exist when the page loads 
    const button       = document.getElementById("toggleOverlay");
    const ureaChart    = document.getElementById("line-chart");
    const oilChart     = document.getElementById("line-chart-oil");
    const titles       = document.querySelectorAll(".chart-title"); // calls both titles in this class (there's only two)
    const ureaTitle    = titles[0];   // "Monthly global urea fertiliser prices" index title order
    const oilTitle     = titles[1];   // "Monthly global crude oil prices"

    // hide oil chart and its title to start
    oilChart.style.display  = "none"; //removes element from the page 
    oilTitle.style.display  = "none";

    button.addEventListener("click", () => {
        showingOil = !showingOil; //every click flips the let showingOil button to the opposit

        if (showingOil) {
            ureaChart.style.display = "none";
            ureaTitle.style.display = "none";
            oilChart.style.display  = "";
            oilTitle.style.display  = "";
            oilTitle.after(button);  // move button to sit after the oil title
            button.textContent      = "Urea prices";
        } else {
            ureaChart.style.display = "";
            ureaTitle.style.display = "";
            oilChart.style.display  = "none";
            oilTitle.style.display  = "none";
            ureaTitle.after(button);  // move button back to after the urea title
            button.textContent      = "Oil prices";
        }
    });
};

setupToggle(); // then you just call the function at the end 
