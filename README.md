# Commodities Project

A data visualisation project built with D3.js v7, exploring global urea fertiliser and crude oil prices from 2020 to the present. Part of a four-week mentorship collaboration project focused on interactive charts, version control, and data journalism.

---

## Project structure

```
commodities-project/
  data/
    Urea_prices2.csv       Monthly urea fertiliser prices ($/mt), World Bank
    Crude_prices.csv       Monthly crude oil prices ($/barrel), Macrotrends
    Commodities.csv        Combined commodities dataset (reference)
    oil-gdp.csv            Oil rents as a share of GDP by country, Our World in Data
    urea-gdp.csv           Urea exports as a share of GDP by country
    oil-all-years.csv      Extended oil price history (reference)
    world.json             GeoJSON world map (country boundaries and names)
  css/
    main.css               Layout, typography, and shared page styles
    line-charts.css        Axis, grid, tooltip, and annotation styles for the line charts
    bar-chart.css          Styles for the bar chart, world map, and filter buttons
  js/
    shared-constants.js    Shared chart dimensions, colours, scales, and filter state
    line-chart-urea.js     Draws the urea fertiliser line chart
    line-chart-oil.js      Draws the crude oil line chart
    interactions.js        Tooltip logic, line chart toggle, and bar/map filter logic
    load-data.js           Loads all CSVs and calls draw/tooltip/filter functions
    bar-chart.js           Draws the oil rents bar chart and world choropleth map
  index.html               Main page
  README.md                This file
```

---

## Data files

### Urea_prices2.csv
- Date format: DD/MM/YYYY
- Column: `Urea` (price in $/mt)
- Source: World Bank Commodity Markets — https://www.worldbank.org/en/research/commodity-markets

### Crude_prices.csv
- Date format: MM/DD/YYYY (different order from the urea file — handled at parse time in `load-data.js`)
- Column: `Crude` (price in $/barrel)
- Source: Macrotrends — https://www.macrotrends.net/1369/crude-oil-price-history-chart

### Commodities.csv
- Combined dataset, available for reference

### oil-gdp.csv
- Columns: `Entity` (country name), `of_GDP` (oil rents as % of GDP)
- Used by the bar chart to show the top 10 countries by oil rent share, 2021
- Congo is remapped at parse time: `"Congo"` → `"Congo, Republic of the"` to match the world GeoJSON
- Source: Our World in Data — https://ourworldindata.org/grapher/oil-rents-as-a-share-of-gdp

### urea-gdp.csv
- Columns: `Country`, `urea_gdp` (urea exports as % of GDP)
- Used by the bar chart filter to switch the view to urea export share
- Source: collated from World Bank sources

### oil-all-years.csv
- Extended oil price history, available for reference

### world.json
- GeoJSON file containing country boundaries and properties for every country in the world
- Each feature has a `properties.name` field (e.g. `"Iraq"`) matched against `Country` in the data files to join values onto the map
- Used by `bar-chart.js` to render the choropleth world map alongside the bar chart
- Source: Natural Earth / TopoJSON-derived world atlas

---

## Script loading order

Scripts are loaded at the bottom of `index.html` in this order:

```
shared-constants.js   → defines globals used by all other files
line-chart-urea.js    → defines drawLineChart()
interactions.js       → defines tooltip, toggle, and filter functions
load-data.js          → loads CSVs and calls all draw/setup functions
line-chart-oil.js     → defines drawOilChart()
bar-chart.js          → defines createVis()
```

`load-data.js` is the entry point that triggers everything. `interactions.js` must load before `load-data.js` because `load-data.js` calls functions defined there.

---

## JavaScript files

### shared-constants.js
Defines all values shared across chart files.

- `margin`, `width`, `height`, `innerWidth`, `innerHeight` — chart dimensions (1000×500 SVG, with margin offsets)
- `fertiliser` — aubergine colour (`#b52e5fff`) used for the urea line chart
- `Oil` — blue colour (`#315ed9ff`) used for the oil line chart
- `ureaInnerChart`, `oilInnerChart` — global references to each chart's inner `<g>` element, assigned inside each draw function
- `lineXScale`, `lineYScale`, `oilXScale`, `oilYScale` — global scale references, assigned inside each draw function and accessed by the interaction functions
- `oilColourScale` — `d3.scaleSequential` with `d3.interpolateYlGnBu`, domain 10–60, shared between the bar chart and world map so both use the same colour encoding for oil
- `ureaColourScale` — `d3.scaleSequential` with `d3.interpolateRgb("#c3b6ab", "#bd0841")`, domain 0–0.20, used when the Urea filter is active
- `filters` — array of two objects (`{ id, label, isActive, data_name }`) that tracks which bar/map filter is currently active. Oil is active by default.

---

### load-data.js
Handles all data loading and calls the draw and setup functions once data is ready.

- Loads `Urea_prices2.csv` with `%d/%m/%Y` date format, then calls `drawLineChart`, `createTooltip`, and `handleMouseEvents`
- Loads `Crude_prices.csv` with `%m/%d/%Y` date format, remapping `d.Date` to `d.DateOil`, then calls `drawOilChart`, `createOilTooltip`, and `handleOilMouseEvents`
- Uses `Promise.all` to load `world.json`, `oil-gdp.csv`, and `urea-gdp.csv` in parallel. Once all three are ready, sorts oil data descending and slices the top 10, then calls `createVis(world, top10, ureaData)` and `populateFilters(world, top10, ureaData)`

---

### line-chart-urea.js
Draws the urea fertiliser chart into `#line-chart`. Sets the global variables `ureaInnerChart`, `lineXScale`, and `lineYScale` so the tooltip and toggle functions can access them.

Key elements drawn:
- Y-axis grid lines (drawn first so they sit behind the data)
- X axis with year labels at January ticks and `"Jul"` at mid-year ticks — all other ticks are hidden
- Y axis with default D3 ticks
- Data points as small circles (radius 2)
- A cardinal curve line (`d3.curveCardinal`)
- A gradient-filled area below the line — the gradient runs bottom-to-top from opacity 0 to opacity 0.35 (gradient ID: `area-gradient`)
- An in-chart label (`"Urea prices ($/mt)"`) positioned in the top-left corner of the SVG
- Two annotated event lines with text labels (see Event annotations section)

---

### line-chart-oil.js
Draws the crude oil chart into `#line-chart-oil`. Follows the same pattern as `line-chart-urea.js`. Sets the global variables `oilInnerChart`, `oilXScale`, and `oilYScale`.

Differences from the urea chart:
- Colour: blue (`#315ed9ff`) instead of aubergine
- Data fields: `d.DateOil` and `d.Crude` instead of `d.Date` and `d.Urea`
- In-chart label: `"Crude prices ($/barrel)"`
- Gradient ID: `area-gradient-oil` (must be separate from `area-gradient` to avoid conflicts in the shared SVG `<defs>`)

---

### interactions.js
Contains all interactive logic: tooltips for both line charts, the toggle buttons that switch between them, and the filter buttons that switch the bar chart and map between oil and urea data.

**`createTooltip()`**
Appends a tooltip group (`.tooltip`) to `ureaInnerChart`. The group contains:
- A dashed vertical line spanning the full chart height
- A nested group (`.tooltip-box`) with a white rounded rectangle
- A `.tooltip-date` text element showing the hovered month and year
- A `.tooltip-price` text element showing the urea price in $/mt

**`handleMouseEvents(data)`**
Appends an invisible overlay rect to `ureaInnerChart` to capture mouse events. On `mousemove`:
1. Gets cursor x position using `d3.pointer`
2. Inverts the x scale to find the hovered date
3. Uses `d3.bisector` to snap to the nearest data point
4. Moves the tooltip group to that point's x position and the tooltip box to its y position
5. Updates the date and price text

On `mouseleave`, hides the tooltip by setting `display: none`.

**`createOilTooltip()`**
Same as `createTooltip` but appends to `oilInnerChart` with classes `.tooltip-oil`, `.tooltip-box-oil`, `.tooltip-date-oil`, and `.tooltip-price-oil`.

**`handleOilMouseEvents(data)`**
Same as `handleMouseEvents` but uses `d.DateOil` and `d.Crude`.

**`setupToggle()`**
Controls the two buttons (`#btnUrea`, `#btnOil`) that switch between the line charts. Calls `switchCharts` on click and toggles the `.active` class on the buttons.

**`switchCharts(fromEls, toEls)`**
Handles the animated transition between chart groups. Runs sequentially — fades out the outgoing elements first, then fades in the incoming ones — so both chart groups are never visible at the same time (which would cause a layout jump since the charts are stacked vertically).
1. Fades each outgoing element to `opacity: 0` over 200ms with `d3.easeCubicOut`
2. Tracks completions with a counter; once all outgoing elements have finished, sets `display: none` on each
3. Makes incoming elements visible in layout (`display: ""`), sets `opacity: 0`, then fades them up to `opacity: 1` over 200ms

The `.active` class on the buttons is handled separately via a CSS `transition` in `main.css` (500ms, `cubic-bezier(0.33, 1, 0.68, 1)`).

**`populateFilters(world, rent, ureaData)`**
Creates the two filter buttons (`#filters`) for the bar chart and map — "Oil rent" (active by default) and "Urea rent". On click:
1. Updates the `filters` array's `isActive` state
2. Toggles the `.active` class on the buttons
3. If **Urea** is selected: sorts `ureaData` descending by `urea_gdp`, slices the top 10, and transitions bar widths and fills to the urea colour scale over 500ms. Updates country name labels, value labels, and transitions the map fill to `ureaColourScale`. Swaps the visible chart title, subtitle, and source note.
4. If **Oil** is selected: restores bar widths and fills to the oil data and `oilColourScale` over 500ms. Updates labels and map fill. Swaps titles and source note back.

---

### bar-chart.js
Defines `createVis(world, rent, ureaData)`, called from `load-data.js` once all three datasets are ready.

Sorts the oil data descending and slices the top 10 countries by oil rent share. Sets up x (linear) and y (band) scales.

**Left half — horizontal bar chart**
- Vertical gridlines along the x axis (drawn before bars)
- Each bar is a `<g class="bar">` containing a rect, a country name label (left of bar), and a percentage value label (right of bar)
- Bars are coloured by `oilColourScale` at 70% opacity with rounded corners
- A vertical baseline at the left edge of the bars (`x = labelColWidth`)
- `"Congo, Republic of the"` is displayed as `"Congo, Rep."` to fit the label column

**Right half — world choropleth map**
- Appended as `<g class="world">` translated to x=500 (the midpoint of the SVG)
- `d3.geoMercator` projection, scaled and centred to fit the right half
- `d3.geoPath` draws each country as `<path class="country-path">`
- Before drawing, loops through `world.features` and joins `Oil_rent` values from the top-10 data onto each country's `properties` object (unmatched countries get `Oil_rent: 0`)
- Top-10 countries are filled using `oilColourScale`; all others are filled with neutral grey (`#eae8e8ff`)

**Bar hover interaction**
- `mouseenter`: dims all other bars to 10% opacity; on the map, greys out all non-matching countries and keeps the matching country fully visible
- `mouseleave`: restores all bars to full opacity; restores the map fill based on which filter is currently active (checks `filters` array to decide whether to use `oilColourScale` or `ureaColourScale`)

---

## CSS files

### main.css
Page-level layout and typography.

- `.responsive-svg-container` — centres the article content, max-width 900px
- `.about-week` — intro blog section above the charts
- `.about-label` — small uppercase section label
- `.paragraph-blog` — body text for the intro section
- `.article-start` — the `<hr>` divider between intro and article
- `.section-title` — main article heading, Libre Baskerville serif
- `.subtitle` — italic subheading below the main title
- `.paragraph` — body text, Georgia serif
- `.chart-title` — small label above each chart
- `.source-note` — data source credit below each chart
- `.chart-header` — wrapper for the chart title and button row
- `.chart-buttons` — flex row holding the two toggle buttons
- `.chart-btn` — shared base style for both toggle buttons (light grey, black text). Transitions `background`, `color`, and `border-color` over 500ms with `cubic-bezier(0.33, 1, 0.68, 1)` (CSS equivalent of D3's `easeCubicOut`)
- `#btnUrea.active` — rose background (`#b52e5f`) with white text, applied when urea chart is active
- `#btnOil.active` — blue background (`#315ed9`) with white text, applied when oil chart is active

### line-charts.css
Styles scoped to the line chart SVG elements.

- `.axis-x`, `.axis-y` — tick and line styles for both axes
- `.chart-label` — small label rendered inside the SVG (e.g. `"Urea prices ($/mt)"`)
- `.grid` — horizontal grid lines, light grey, domain path hidden
- `.event-label` — annotation text for historical events
- `.event-line` — dashed annotation line for historical events
- `.tooltip-date`, `.tooltip-price`, `.tooltip-date-oil`, `.tooltip-price-oil` — tooltip text styles for both charts

### bar-chart.css
Styles scoped to the bar chart, world map, and filter buttons.

- `.chart-subtitle` — italic caption below the chart title
- `.bar-country` — country name labels to the left of each bar
- `.bar-value` — percentage value labels to the right of each bar
- `#filters` — flex row holding the two filter buttons
- `.filter` — shared base style for filter buttons (same appearance as `.chart-btn`)
- `.filter[data-id="Oil"].active` — blue background when Oil filter is active
- `.filter[data-id="Urea"].active` — rose background when Urea filter is active
- `.filter.active` — disables pointer events on the currently active filter button

---

## Event annotations

Both line charts include two annotated vertical dashed lines:

| Event | Date |
|---|---|
| Russian invasion of Ukraine | 24 February 2022 |
| US and Israel launch attacks on Iran | 28 February 2026 |

---

## Technologies

- D3.js v7 (loaded from CDN)
- Vanilla JavaScript (ES6)
- HTML5 / CSS3
- No build tools or bundlers — files are served directly
