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
