# Commodities Project

A data visualisation project built with D3.js v7, exploring global urea fertiliser and crude oil prices from 2020 to the present. Part of a four-week mentorship collaboration project focused on interactive charts, version control, and data journalism.

---

## Project structure

```
commodities project/
  data/
    Urea_prices2.csv       Monthly urea fertiliser prices ($/mt), World Bank
    Crude_prices.csv       Monthly crude oil prices ($/barrel), World Bank
  css/
    main.css               All styles: layout, typography, chart elements, tooltip, toggle button
  js/
    interactions.js        Shared tooltip logic used by both charts
    line-chart.js          Draws the urea fertiliser line chart
    line-chart oil.js      Draws the crude oil line chart
    toggle.js              Handles switching between the two charts
  index.html               Main page
  README.md                This file
```

---

## Data files

### Urea_prices2.csv
- Date format: DD/MM/YYYY
- Column: `Urea` (price in $/mt)
- Source: World Bank Commodity Markets

### Crude_prices.csv
- Date format: MM/DD/YYYY (note: different order from the urea file)
- Column: `Crude ` (note: trailing space in the header - accessed with `d["Crude "]`)
- Source: World Bank Commodity Markets

---

## JavaScript files

### interactions.js
Contains two functions used by both charts. It does not reference any global variables - instead, each chart passes its own context object.

**`createTooltip(ctx)`**
Appends a tooltip group to the chart's `innerChart` element. The group contains:
- A dashed vertical line spanning the full chart height
- A `.tooltip-year` text element showing the hovered month and year
- A `.tooltip-price` text element showing the price at that date

The tooltip starts hidden and is only shown on mousemove.

**`handleMouseEvents(ctx, data)`**
Listens for `mousemove` and `mouseleave` on the `.area-path` element of a given chart. On mousemove it:
1. Finds the closest data point to the cursor using `d3.bisector`
2. Snaps the tooltip to that data point's x position
3. Positions the text 38-51px above the data point on the y axis
4. Flips the text to the left of the dashed line during periods of high prices (Mar 2021 to Apr 2022, and Sep 2025 onwards), and keeps it on the right otherwise

The `ctx` object passed in must contain: `innerChart`, `xScale`, `yScale`.

---

### line-chart.js
Draws the urea fertiliser chart into `#line-chart`. All variables (`innerChart`, `xScale`, `yScale`, etc.) are local to the `drawLineChart` function. The function returns a context object which is passed to `createTooltip` and `handleMouseEvents`.

Key elements drawn:
- Grid lines (y axis only)
- x axis with year labels and a mid-year "Jul" tick
- y axis with default D3 ticks
- Data points as small circles
- A cardinal curve line
- A gradient-filled area below the line
- Annotated event lines for the Russian invasion of Ukraine (Feb 2022) and US/Israel attacks on Iran (Feb 2026)

---

### line-chart oil.js
Draws the crude oil chart into `#oil-chart`. Follows the same pattern as `line-chart.js`. Uses its own `parseDateOil` function because the CSV date format differs from the urea file.

Differences from the urea chart:
- Colour: blue (`#315ed9ff`) instead of aubergine
- Gradient ID: `area-gradient-oil` (separate from `area-gradient` to avoid conflicts in the SVG defs)
- Accesses data with `d.Crude` (mapped from `d["Crude "]` at parse time)
- Uses `parseDateOil` with `%m/%d/%Y` format

---

### toggle.js
Handles switching between the two charts on the page. On load, only `#line-chart` is visible. When the button is clicked, the script:
1. Flips a `showingUrea` boolean
2. Shows or hides each chart div with `display: block/none`
3. Updates the button label
4. Updates the chart title paragraph above the chart

---

## CSS - main.css

### Layout classes
- `.responsive-svg-container` - centres the article content, max-width 900px
- `.chart-wrapper` - wraps both chart divs, set to `position: relative` so the toggle button can be positioned within it

### Typography classes
- `.section-title` - main article heading, Libre Baskerville serif
- `.subtitle` - italic subheading below the main title
- `.paragraph` - body text, Georgia serif, 14px
- `.chart-title` - small label above the chart
- `.source-note` - data source credit below the chart

### Chart element classes
- `.axis-x`, `.axis-y` - tick and line styles for both axes
- `.chart-label` - the small label rendered inside the SVG (e.g. "Urea prices ($/mt)")
- `.grid` - horizontal grid lines, light grey
- `.event-label` - annotation text for historical events, Arial 11px, grey
- `.event-line` - dashed annotation line for historical events
- `.tooltip-year`, `.tooltip-price` - tooltip text styles, matching `.event-label` but slightly darker (`#444`)

### Toggle button
- `.chart-toggle-btn` - positioned in the top-right corner of `.chart-wrapper`, styled to match the chart's type aesthetic

---

## Event annotations

Both charts include two annotated vertical lines:

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

## Sources

https://tradingeconomics.com/commodity/urea 

https://www.macrotrends.net/1369/crude-oil-price-history-chart

https://www.worldbank.org/en/research/commodity-markets


