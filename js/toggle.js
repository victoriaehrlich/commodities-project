const ureaChart = document.getElementById("line-chart");
const oilChart  = document.getElementById("oil-chart");
const toggleBtn = document.getElementById("chart-toggle");
const chartTitle = document.getElementById("chart-title-label");

let showingUrea = true;

toggleBtn.addEventListener("click", () => {
    showingUrea = !showingUrea;

    ureaChart.style.display  = showingUrea ? "block" : "none";
    oilChart.style.display   = showingUrea ? "none"  : "block";

    toggleBtn.textContent    = showingUrea ? "View crude oil prices"      : "View urea prices";
    chartTitle.textContent   = showingUrea ? "Monthly global urea fertiliser prices ($/mt)" : "Monthly global crude oil prices ($/barrel)";
});
