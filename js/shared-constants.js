// Chart
const margin = { top: 40, right: 170, bottom: 55, left: 40 };

const width = 1000;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const fertiliser = "#b52e5fff";
const Oil = "#315ed9ff";
let ureaInnerChart, oilInnerChart;

// Scales set inside each draw function, available globally for interactions
let lineXScale, lineYScale;
let oilXScale, oilYScale;