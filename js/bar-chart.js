const barBlue = "#4682b4";
// //const middleEast = new Set(["Iraq", "Saudi Arabia", "Oman", "Iran"]);


// // A promise all to handle the loading of two datasets
// Promise.all([
//   d3.json("./data/world.json"), // first dataset becomes the "world" argument, second becomes oilData 
//   d3.csv("data/oil-gdp.csv", d => ({
//   Country: d.Entity === "Congo" ? "Congo, Republic of the" : d.Entity,
//   Oil_rent: +d.of_GDP,
//         })
//     ) // closing bracket for oilData
//   ]
// ).then(([world, oilData]) => { // loading both parameters
  
// const top10 = oilData // Idea potentially that this could be dynamic based on a slider - would be an event handler type input like a button
//     .sort((a, b) => b.Oil_rent - a.Oil_rent)
//     .slice(0, 10);

//   createVis(world, top10);
// })
// .catch(error => {
//   console.error("Error loading JSON files:", error);
// });


const createVis = (world, rent, ureaData) => {

  const labelColWidth = 90;


  // Scales
  const CountryColourScale = d3.scaleSequential() // Colour scale for used for both the bars and the map
          .domain([10,60])
          .interpolator(d3.interpolateYlGnBu);
         //.interpolator(d3.interpolateRgbBasis(["#d5dadfff", "#4682b4", "#08306b"])); // light blue → mid blue → dark navy

  
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

/*----------------------------- */  

// Bar Chart Visual

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
        .attr("fill", d=> CountryColourScale(d.Oil_rent))
        .attr("fill-opacity", 0.7)
        //.attr("fill-opacity", d => middleEast.has(d.Country) ? 1 : 0.4)
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

  const displayName = name => name === "Congo, Republic of the" ? "Congo, Rep." : name;

  barGroup.append("text")
    .text(d => displayName(d.Country))
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

/*----------------------------- */  
  // Bar chart hover for bar + world map 
  barGroup
    .style("cursor", "default")
    .on("mouseenter", function(_event, d) {
      // Greys out all bars except the country hovering over for the bar chart only 
      chart.selectAll("g.bar")
        .filter(b => b.Country !== d.Country)
        .style("opacity", 0.15);
      // Greys out the map as well based on the match from the bar chart country name = world map name 
      worldMap.selectAll(".country-path")
        .filter(p => p.properties.name !== d.Country)
        .attr("fill", "#eae8e8ff")
        .attr("fill-opacity", 0.6);
      worldMap.selectAll(".country-path")
        .filter(p => p.properties.name === d.Country)
        .attr("fill-opacity", 1); // the country that's matched is fully visible 
    })
    .on("mouseleave", function() { //restores all bars with event mouse leaves 
      chart.selectAll("g.bar").style("opacity", 1);
      // and also to restore colors from map colour scale for top 10 countries and grey for the rest
      worldMap.selectAll(".country-path")
        .attr("fill", d => d.properties.Oil_rent > 0 ? CountryColourScale(d.properties.Oil_rent) : "#eae8e8ff")
        .attr("fill-opacity", 0.8);
    });


 /*----------------------------- */  
  // World Map Visual   
  const worldMap = svg.append("g")
    .attr("class", "world")
    .attr("transform", `translate(500,0)`); // Position at the start of the hal way point on the SVG


  const projectionMercator = d3.geoMercator() 
                    .translate([width/4.5, height/1.5]) // Translates the centre of the map e.g. 1000/4.5 = 220 but its from the starting point of 500 of the grouped element
                    .scale(100); // determines how zoomed in the map in combination with the size of grouped element or svg 


  const geoPathGenerator = d3.geoPath() // intitialises a path generator using the function d3.geoPath(). Same process as a line or area generator
    .projection(projectionMercator); // pass the projectionMercator declared above to the projection() accessor function.


  world.features.forEach(country=> {  // looping through each feature and saying that's country
    const props = country.properties;  // naming a variable props that captures the little object(like a dataset) at the end of each Country row called properties - "properties":{"name":"Bahrain"},"id":"BH"},
    const match = rent.find(r => r.Country === props.name); // in the loop we then look to find in the rent data if the current country being looped matches. If it does thats then assigned to match constant 
    props.Oil_rent = match ? match.Oil_rent : 0; // Finally here we go 2 lines up when we created props and add another property to that called Oil_rent
    // "properties":{"name":"Bahrain"},{Oil_rent: 50}, "id":"BH"},
    });


worldMap.selectAll(".country-path")
    .data(world.features) // I missed out the .features here which is why it didnt load, it has to be world.features as that's what the geopath generator is looking to plot 
    .join("path")
        .attr("class", "country-path")
        .attr("d", geoPathGenerator) // drawing a path using the generator above. All the cordinaes part - "geometry":{"type":"MultiPolygon","coordinates":[[[
        .attr("fill", d =>  d.properties.Oil_rent > 0 ? CountryColourScale(d.properties.Oil_rent) : "#eae8e8ff" ) // Fill based on the condition that oils_rent is bigger than 0, all countries apart from the top 10 will be 0 because of the const match part in the above loop
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#afaeaeff" )
        .attr("stroke-opacity", 0.7);

}

