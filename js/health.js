d3.queue()
    .defer(d3.csv, '../data/health_bars.csv')
    .defer(d3.tsv, '../data/health_trends.csv')
    .await(init);

///////////// INIT
function init(error, locs, trend) {
    if (error) throw error;

    locs.forEach(function(d) {
        d.value = +d.value;
    });
    trend.forEach(function(d) {
        d.value = +d.value;
    });

    var obesity_loc = locs.filter(function(d) { return d.indicator === 'obesity'; });
    var smoking_loc = locs.filter(function(d) { return d.indicator === 'smoking'; });
    var obesity_trend = trend.filter(function(d) { return d.indicator === 'obesity'; });
    var smoking_trend = trend.filter(function(d) { return d.indicator === 'smoking'; });
    var food_trend = trend.filter(function(d) { return d.indicator === 'food_insecurity'; });
    var insurance_trend = trend.filter(function(d) { return d.indicator === 'insurance'; });

    makeObesityBars(obesity_loc);
    makeSmokingBars(smoking_loc);
    makeObesityTrend(obesity_trend);
    makeSmokingTrend(smoking_trend);
    makeFoodTrend(food_trend);
    makeInsuranceTrend(insurance_trend);

    d3.selectAll('.dimple-marker')
        .attr('r', 3);
}

function makeObesityBars(data) {
    var fullwidth = 400;
    var fullheight = 200;
    var margin = { top: 12, right: 18, bottom: 40, left: 90 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#obesity-loc')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#992156')
    ];

    var y = chart.addCategoryAxis('y', 'name');

    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    // x.title = '';
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    bars.getTooltipText = function(e) {
        var txt = e.y + ': ' + d3.format('.0%')(e.xValue);
        return [txt];
    };

    chart.draw();

}

function makeSmokingBars(data) {
    var fullwidth = 400;
    var fullheight = 200;
    var margin = { top: 12, right: 18, bottom: 40, left: 90 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#smoking-loc')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#992156')
    ];

    var y = chart.addCategoryAxis('y', 'name');

    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    // x.title = '';
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    bars.getTooltipText = function(e) {
        var txt = e.y + ': ' + d3.format('.0%')(e.xValue);
        return [txt];
    };

    chart.draw();
}

function makeObesityTrend(data) {
    // var nhv = dimple.filterData(data, 'name', 'New Haven');
    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var fullwidth = 400;
    var fullheight = 200;
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#obesity-trend')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#739DD0'),
        new dimple.color('#992156'),
        new dimple.color('#2F588B')
    ];
    var color = d3.scaleOrdinal()
        .domain(d3.extent(data, function(d) { return d.value; }))
        .range(['#739dd0', '#992156', '#2f588b']);


    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 6;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    colorline.getTooltipText = function(e) {
        var txt = e.aggField[0] + ', ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };
    baseline.getTooltipText = function(e) {
        // console.log(e);
        var txt = 'Goal, ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };

    chart.addLegend('75%', '5%', 100, 20, 'left', colorline);

    chart.draw();

    // var shapes = baseline.shapes.selectAll('path');
    // console.log(shapes);
    d3.select('#obesity-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    // d3.selectAll('#obesity-trend .dimple-marker')
    //     .attr('fill', function(d) {
    //         console.log(d);
    //         // console.log(color(d))
    //         return color(d.aggField[0]);
    //     });
    // d3.selectAll('#obesity-trend .dimple-line')
    //     .attr('stroke', function(d) {
    //         // return color(d.aggField[0]);
    //         console.log(d);
    //     });
}

function makeSmokingTrend(data) {
    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var fullwidth = 400;
    var fullheight = 200;
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#smoking-trend')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#739DD0'),
        new dimple.color('#992156'),
        new dimple.color('#2F588B')
    ];


    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 6;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    colorline.getTooltipText = function(e) {
        var txt = e.aggField[0] + ', ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };
    baseline.getTooltipText = function(e) {
        // console.log(e);
        var txt = 'Goal, ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };

    chart.addLegend('75%', '5%', 100, 20, 'left', colorline);

    chart.draw();

    // var shapes = baseline.shapes.selectAll('path');
    // console.log(shapes);
    d3.select('#smoking-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));
}

function makeFoodTrend(data) {
    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var fullwidth = 400;
    var fullheight = 200;
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#food-trend')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#739DD0'),
        new dimple.color('#992156'),
        new dimple.color('#2F588B')
    ];


    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 6;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    colorline.getTooltipText = function(e) {
        var txt = e.aggField[0] + ', ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };
    baseline.getTooltipText = function(e) {
        console.log(e);
        var txt = 'Goal, ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };

    chart.addLegend('75%', '5%', 100, 20, 'left', colorline);

    chart.draw();

    // var shapes = baseline.shapes.selectAll('path');
    // console.log(shapes);
    d3.select('#food-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));
}

function makeInsuranceTrend(data) {
    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var fullwidth = 400;
    var fullheight = 200;
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#insurance-trend')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#739DD0'),
        new dimple.color('#992156'),
        new dimple.color('#2F588B'),
        new dimple.color('#359957')
    ];


    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 6;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    colorline.getTooltipText = function(e) {
        // console.log(e);
        var txt = e.aggField[0] + ', ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };
    baseline.getTooltipText = function(e) {
        var txt = 'Goal, ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };

    chart.addLegend('50%', '10%', 200, 50, 'left', colorline);

    colorline.afterDraw = function(shp, d) {
        var paths = d3.select(shp);
        // console.log(paths.style('stroke'));

        // svg.append('circle')
        //     .attr('x', shape.attr('x'))
        //     .attr('y', shape.attr('y'))
        //     .attr('r')
    };

    baseline.afterDraw = function(shp, d) {
        var shape = d3.select(shp);
        shape.style('stroke-dasharray', ('5, 5'));
    };

    chart.draw();

    // var markers = colorline.shapes.filter('circle.dimple-marker');
    // console.log(markers);
    // var markers = d3.selectAll('#insurance-trend circle.dimple-marker');
    // markers.attr('r', 3);

    // colorline.shapes.filter('circle.dimple-marker')
    //     .attr('fill', function(d) { console.log(d); return 'blue'; });

    // var shapes = baseline.shapes.selectAll('path');
    // console.log(shapes);
    // d3.select('#insurance-trend #dimple-all')
    //     .style('stroke-dasharray', ('5, 5'));

}
