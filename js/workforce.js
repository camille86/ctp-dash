d3.queue()
    .defer(d3.csv, '../data/underemployment.csv')
    .defer(d3.csv, '../data/underemployment_time.csv')
    .await(init);

///////////// INIT
function init(error, rates, trend) {
    if (error) throw error;

    rates.forEach(function(d) {
        d.Underemployment = +d.Underemployment;
    });

    trend.forEach(function(d) {
        d.Underemployment = +d.Underemployment;
    });

    makeBars3(rates);
    makeTrend(trend);
}


function makeBars3(csv) {
    var fullwidth = 380;
    var fullheight = 200;
    var margin = { top: 12, right: 18, bottom: 40, left: 100 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#underemployment-chart')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var bars = new dimple.chart(svg, csv);
    bars.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    bars.defaultColors = [
        new dimple.color('#992156')
    ];

    var y = bars.addCategoryAxis('y', 'Location')
        .addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    // y.title = '';

    var x = bars.addMeasureAxis('x', 'Underemployment');
    // x.title = '';
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;


    bars.addSeries(null, dimple.plot.bar);
    bars.draw();
    // x.titleShape.remove();

}


function makeTrend(csv) {
    var fullwidth = 380;
    var fullheight = 280;
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#underemployment-trend')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);

    var lines = new dimple.chart(svg, csv);
    lines.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = lines.addTimeAxis('x', 'Year', '%Y-%m-%d', '%Y');
    x.title = null;

    var y = lines.addMeasureAxis('y', 'Underemployment');
    y.tickFormat = '.0%';
    y.ticks = 6;

    lines.defaultColors = [
        new dimple.color('#739DD0'),
        new dimple.color('#992156')
    ];

    var baseline = lines.addSeries(null, dimple.plot.line);
    var colorline = lines.addSeries('Type', dimple.plot.line);
    colorline.lineMarkers = true;
    baseline.lineMarkers = false;

    lines.addLegend('75%', '5%', 100, 20, 'left', colorline);
    lines.draw();

    var shapes = baseline.shapes.selectAll('path.dimple-line');
    console.log(shapes);
    d3.select('#dimple-all')
        .style('stroke-dasharray', ('5, 5'));
}


// using d3fc
// function makeBars(csv) {
//     var bars = fc.seriesSvgBar()
//         // .orient('horizontal')
//         .crossValue(function(d) { return d.Location; })
//         .mainValue(function(d) { return d.Underemployment; })
//         .decorate(function(sel) {
//             sel.enter()
//                 .append('text')
//                 .attr('class', 'bar-label')
//                 .attr('transform', 'translate(0, -5)')
//                 .text(function(d) { return d3.format('.0%')(d.Underemployment); });
//         });
//
//     var yExtent = fc.extentLinear()
//         .include([0])
//         .pad([0, 0.1])
//         .accessors([function(d) { return d.Underemployment; }]);
//
//     // var xaxis = fc.axisBottom(d3.scaleBand())
//     //     .decorate(function(sel) {
//     //         sel.enter()
//     //             .select('text')
//     //             .style('text-anchor', 'start')
//     //             .attr('transform', 'rotate(45 -10 10)');
//     //     });
//
//     var chart = fc.chartSvgCartesian(d3.scalePoint(), d3.scaleLinear())
//         .xDomain(csv.map(function(d) { return d.Location; }))
//         .xPadding(0.5)
//         .yDomain(yExtent(csv))
//         .yOrient('none')
//         // .xDecorate(function(sel) {
//         //     sel.enter()
//         //         .select('text')
//         //         .style('text-anchor', 'start')
//         //         .attr('transform', 'rotate(45 -10 10)');
//         // })
//         .plotArea(bars);
//     //
//     // var series = fc.seriesSvgBar()
//     //     .orient('horizontal')
//     //     .crossValue(function(d) { return d.Location; })
//     //     .mainValue(function(d) { return d.Underemployment; });
//     //
//     // var xextent = fc.extentLinear()
//     //     .include([0])
//     //     .pad([0, 0.1])
//     //     .accessors([function(d) { return d.Underemployment; }]);
//     //
//     // var chart = fc.chartSvgCartesian(d3.scaleLinear(), d3.scalePoint())
//     //     .xDomain(xextent(csv))
//     //     .yDomain(csv.map(function(d) { return d.Location; }))
//     //     .yOrient('left')
//     //     .yPadding([0.5])
//     //     .xTicks(6)
//     //     .xTickFormat(d3.format('.0%'))
//     //     .plotArea(series);
//
//
//     d3.select('#underemployment-chart')
//         .datum(csv)
//         .call(chart);
// }
