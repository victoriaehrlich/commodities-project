# Commodities Project

A data visualisation project built with D3.js v7, exploring global urea fertiliser and crude oil prices from 2020 to the present. Part of a four-week mentorship collaboration project focused on interactive charts, version control, and data journalism.

---

## Project structure

```
commodities project/
  data/
    Urea_prices2.csv       Monthly urea fertiliser prices ($/mt), World Bank
    Crude_prices.csv       Monthly crude oil prices ($/barrel), World Bank
    Commodities.csv        Combined commodities dataset
    oil-gdp.csv            Oil rents as a share of GDP by country, Our World in Data
    oil-all-years.csv      Extended oil price history
  css/
    main.css               Layout, typography, and shared page styles
    line-charts.css        Axis, grid, tooltip, and annotation styles for the line charts
    bar-chart.css          Styles specific to the bar chart
  js/
    shared-constants.js    Shared chart dimensions, colours, and global scale variables
    load-data.js           Loads CSVs and calls draw/tooltip functions for each chart
    line-chart-urea.js     Draws the urea fertiliser line chart
    line-chart-oil.js      Draws the crude oil line chart
    interactions.js        Tooltip logic for both charts and toggle button logic
    bar-chart.js           Draws the oil rents bar chart
  index.html               Main page
  README.md                This file
```

---

## Data files

### Urea_prices2.csv
- Date format: DD/MM/YYYY
- Column: `Urea` (price in $/mt)
- Source: World Bank Commodity Markets - https://www.worldbank.org/en/research/commodity-markets

### Crude_prices.csv
- Date format: MM/DD/YYYY (note: different order from the urea file)
- Column: `Crude` (price in $/barrel)
- Source: Macrotrends - https://www.macrotrends.net/1369/crude-oil-price-history-chart

### Commodities.csv
- Combined dataset used for reference

### oil-gdp.csv
- Columns: `Entity` (country name), `of_GDP` (oil rents as % of GDP)
- Used by the bar chart to show the top 10 countries by oil rent share, 2021
- Source: Our World in Data - https://ourworldindata.org/grapher/oil-rents-as-a-share-of-gdp

### oil-all-years.csv
- Extended oil price history, available for reference

---

## JavaScript files

### shared-constants.js
Defines all values shared across the chart files so they don't need to be repeated or passed around.

- `margin`, `width`, `height`, `innerWidth`, `innerHeight` — chart dimensions
- `fertiliser` — aubergine colour (`#b52e5fff`) used for the urea chart
- `Oil` — blue colour (`#315ed9ff`) used for the oil chart
- `ureaInnerChart`, `oilInnerChart` — global references to each chart's inner `<g>` element, set inside the draw functions
- `lineXScale`, `lineYScale`, `oilXScale`, `oilYScale` — global scale references, set inside each draw function and accessed by the interaction functions

---

### load-data.js
Handles all CSV loading. Parses dates and numeric values, then calls the draw and tooltip functions in sequence.

- Loads `Urea_prices2.csv` with `%d/%m/%Y` date format, then calls `drawLineChart`, `createTooltip`, and `handleMouseEvents`
- Loads `Crude_prices.csv` with `%m/%d/%Y` date format, then calls `drawOilChart`, `createOilTooltip`, and `handleOilMouseEvents`

---

### line-chart-urea.js
Draws the urea fertiliser chart into `#line-chart`. Sets the global variables `ureaInnerChart`, `lineXScale`, and `lineYScale` so the interaction functions can access them.

Key elements drawn:
- Grid lines (y axis only)
- x axis with year labels and a mid-year "Jul" tick
- y axis with default D3 ticks
- Data points as small circles
- A cardinal curve line
- A gradient-filled area below the line (gradient ID: `area-gradient`)
- Annotated event lines for the Russian invasion of Ukraine (Feb 2022) and US/Israel attacks on Iran (Feb 2026)

---

### line-chart-oil.js
Draws the crude oil chart into `#line-chart-oil`. Follows the same pattern as `line-chart-urea.js`. Sets the global variables `oilInnerChart`, `oilXScale`, and `oilYScale`.

Differences from the urea chart:
- Colour: blue (`#315ed9ff`) instead of aubergine
- Gradient ID: `area-gradient-oil` (separate from `area-gradient` to avoid conflicts in the SVG defs)
- Uses `d.DateOil` (mapped from `d.Date` at parse time in `load-data.js`)

---

### interactions.js
Contains tooltip functions for each chart and the toggle button logic.

**`createTooltip()`**
Appends a tooltip group (`.tooltip`) to `ureaInnerChart`. The group contains:
- A dashed vertical line spanning the full chart height
- A white rounded rectangle (`.tooltip-box`)
- A `.tooltip-date` text element showing the hovered month and year
- A `.tooltip-price` text element showing the urea price

**`handleMouseEvents(data)`**
Appends an invisible overlay rect to `ureaInnerChart` to capture mouse events. On mousemove it:
1. Finds the closest data point to the cursor using `d3.bisector` on `d.Date`
2. Snaps the tooltip to that data point's x position
3. Formats the date as "Mon YYYY" and the price as `$X/mt`

**`createOilTooltip()`**
Same as `createTooltip` but appends to `oilInnerChart` with classes `.tooltip-oil`, `.tooltip-date-oil`, and `.tooltip-price-oil`.

**`handleOilMouseEvents(data)`**
Same as `handleMouseEvents` but uses `d.DateOil` and `d.Crude`, and updates the `.tooltip-oil` group.

**`setupToggle()`**
Controls the two buttons that switch between the urea and oil line charts. On page load it hides the oil chart and its title (urea is shown by default). Each button has its own click handler that:
1. Toggles `display` on both chart divs, their titles, and their source notes
2. Adds the `.active` class to the clicked button and removes it from the other
3. The `.active` class triggers a coloured background — rose for Urea prices, blue for Oil prices — with white text. The inactive button falls back to light grey with black text.

---

### bar-chart.js
Loads `oil-gdp.csv`, sorts countries by oil rent descending, and draws a horizontal bar chart of the top 10 into `#bar-chart`. Uses the shared `margin`, `width`, `height`, and `innerHeight` constants from `shared-constants.js`.

Key elements drawn:
- Vertical gridlines along the x axis
- Horizontal bars with full opacity for Middle Eastern countries (Iraq, Saudi Arabia, Oman, Iran) and reduced opacity for others
- Country name labels to the left of each bar
- Percentage value labels to the right of each bar
- A vertical baseline at the left edge of the bars

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
- `.chart-btn` — shared base style for both buttons (light grey, black text)
- `#btnUrea.active` — rose background (`#b52e5f`) with white text, applied when urea chart is active
- `#btnOil.active` — blue background (`#315ed9`) with white text, applied when oil chart is active

### line-charts.css
Styles scoped to the line chart SVG elements.

- `.axis-x`, `.axis-y` — tick and line styles for both axes
- `.chart-label` — the small label rendered inside the SVG (e.g. "Urea prices ($/mt)")
- `.grid` — horizontal grid lines, light grey
- `.event-label` — annotation text for historical events
- `.event-line` — dashed annotation line for historical events
- `.tooltip-date`, `.tooltip-price` — tooltip text styles for the urea chart
- `.tooltip-date-oil`, `.tooltip-price-oil` — tooltip text styles for the oil chart

### bar-chart.css
Styles scoped to the bar chart SVG elements.

- `.bar-country` — country name labels
- `.bar-value` — percentage value labels to the right of each bar

---

## Event annotations

Both line charts include two annotated vertical lines:

| Event | Date |
|---|---|
| Russian invasion of Ukraine | 24 February 2022 |
| US and Israel launch attacks on Iran | 28 February 2026 |

---

## Technologies

- D3.js v7 (loaded from CDN)
- Vanilla JavaScript (ES6)
- HTML5 / CSS3
- No build tools or bundlers - files are served directly
