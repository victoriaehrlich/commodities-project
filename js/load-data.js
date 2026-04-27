const parseDate = d3.timeParse("%d/%m/%Y");

d3.csv("data/Urea_prices2.csv", d => ({
    Date: parseDate(d.Date),
    Urea: +d.Urea
})).then(data => {
    console.log(data);
    drawLineChart(data);
    createTooltip();
    handleMouseEvents(data);
});

const parseDateOil = d3.timeParse("%m/%d/%Y");

d3.csv("data/Crude_prices.csv", d => ({
    DateOil: parseDateOil(d.Date),
    Crude: +d.Crude
})).then(data => {
    console.log(data);
    drawOilChart(data);
    createOilTooltip();
    handleOilMouseEvents(data);
});


Promise.all(
  [
  d3.json("./data/world.json"), 
  d3.csv("data/oil-gdp.csv", d => ({
  Country: d.Entity === "Congo" ? "Congo, Republic of the" : d.Entity,
  Oil_rent: +d.of_GDP,
        })
    ), 
  d3.csv("data/urea-gdp.csv", d=> ({
    Country: d.Country,
    urea_gdp: +d.urea_gdp
  })
)
]
).then(([world, oilData, ureaData]) => {

const top10 = oilData 
    .sort((a, b) => b.Oil_rent - a.Oil_rent)
    .slice(0, 10);
  createVis(world, top10, ureaData);
  populateFilters(world, top10, ureaData)
    
});
