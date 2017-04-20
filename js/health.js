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
    d3.select('#obesity-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));
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
        console.log(e);
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
        new dimple.color('#d483a7')
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
        console.log(e);
        var txt = e.aggField[0] + ', ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };
    baseline.getTooltipText = function(e) {
        var txt = 'Goal, ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };

    chart.addLegend('50%', '10%', 200, 50, 'left', colorline);

    chart.draw();

    // var shapes = baseline.shapes.selectAll('path');
    // console.log(shapes);
    d3.select('#insurance-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));
}
