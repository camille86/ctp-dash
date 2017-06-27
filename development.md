# City Transformation Plan dashboard -- Development

This document contains an overview of the tools used to build draft 1 of the CTP dashboard, and guidance for its maintenance.

## Basic structure

All code is pushed to the `master` branch. The `dist` folder is then pushed as a subtree to the `gh-pages` branch, following these directions: https://gist.github.com/cobyism/4730490. The folder structure is as follows:

```
├── R
|  ├── R_scripts
|  ├── Rmd
|  ├── input
├── README.md
├── development.md
└── dist
   ├── bower_components
   ├── css
   ├── data
   ├── favicon-16x16.png
   ├── favicon-32x32.png
   ├── img
   ├── index.html
   ├── js
   ├── json
   ├── pages
   └── svg
```

Note that the `gh-pages` branch begins at `/dist`.

## Major dependencies

* All pages are made responsive with [Bootstrap](http://getbootstrap.com/), and built on top of [Keen.io](https://github.com/keen/dashboards) templates.
* A few javascript libraries, including Bootstrap's javascript components, depend on jQuery.
* All charts depend on [D3.js v4](https://github.com/d3/d3). Most charts are drawn with [dimple.js](https://github.com/PMSI-AlignAlytics/dimple), though maps are drawn with an in-house chart in the `d3map.js` file. Other D3 plugins are used as well.
* CSS is compiled from Sass.
* Data on the front page is fetched from a Google Spreadsheet using tabletop.js, allowing for easy updating of the overview indicators.

## Pages

In addition to the `index.html` file which gives the overview indicators, each sector has an html file in the `pages` folder. Each html file has an associated javascript file with the same name. Containers for charts are each hard-coded in the html files---this could be improved upon and made more flexible.

The front page is largely made up of a container for the [Isotope](https://isotope.metafizzy.co/) jQuery plugin. Using tabletop, data is pulled in from a Google sheet; that data is bound to an html element using D3 and formatted using Handlebars.js. These cards can be filtered with Isotope.

The sector pages depend primarily on jQuery, Bootstrap, D3, dimple, and the [d3-tip plugin](https://github.com/Caged/d3-tip). Pages that contain maps also use topojson, [d3-legend](http://d3-legend.susielu.com/), and our d3map chart. [Simple Statistics](https://simplestatistics.org/) calculates Jenks breaks for coloring maps.

One major improvement would be to write generic functions to build dimple charts; as of now, each chart is built with its own function called by that sector page.

An additional file, `globals.js`, has generic functions for charts, such as mouse events, formatting shortcuts, tooltips for different types of data, and dimple color objects.   

## Data

As of June 2017, most of the data in the dashboard comes from the US Census Bureau's American Community Survey; some additional data comes from other Census programs, state agencies, or DataHaven's Community Wellbeing Survey. Scripts used for downloading, analyzing, and saving data for use here are written in R and saved in the [`R`](R) folder, both as RMarkdown documents for easy viewing on GitHub, and as plain .R files. Census data is mostly downloaded via APIs, but any files that need to be read by R scripts are in the `input` folder. Analysis of ACS tables depends on DataHaven's [`acsprofiles`](https://github.com/CT-Data-Haven/acsprofiles) package. Data from the Community Wellbeing Survey, such as the financial security measures, was calculated in Excel from the survey crosstabs, available on DataHaven's website.

Running R scripts will write csv files to the folder `R/output`, which should then be copied to the folder `dist/data/` and sorted for the appropriate sector.

All shapefiles are saved as topojson files in the `json` folder. These are written in R, but [Mapshaper](http://mapshaper.org/) is also useful for simplifying shapefiles.

Please contact DataHaven for access to the Google spreadsheet that powers the front page indicators.

## Miscellaneous

Because of data sharing agreements, a few health maps are shown as static image files, as developed for the Greater New Haven Community Index.

Icons for the front page are included in a SVG sprite sheet in the `svg` folder.

As of June 2017, the shapefiles used here give breakdowns of New Haven by neighborhood, tract, and block group. Each is stored in its own topojson file.

## Improvements / long-term to-do

* Find an *actual* web designer to improve styling
* Move to a build tool such as Gulp---would allow to build libraries from node modules, including custom smaller builds of D3, instead of pulling everything from CDNs
* Encapsulate creation of dimple charts into reusable functions
* Build html files from templates for more flexibility
* There are probably plenty of small UI/UX tweaks to make, especially in charts
* Add cute touches like icons
