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

    // var obesity_loc = locs.filter(function(d) { return d.indicator === 'obesity'; });
    // var smoking_loc = locs.filter(function(d) { return d.indicator === 'smoking'; });
    // var obesity_trend = trend.filter(function(d) { return d.indicator === 'obesity'; });
    // var smoking_trend = trend.filter(function(d) { return d.indicator === 'smoking'; });
    // var food_trend = trend.filter(function(d) { return d.indicator === 'food_insecurity'; });
    // var insurance_trend = trend.filter(function(d) { return d.indicator === 'insurance'; });

    // makeObesityBars(obesity_loc);
    // makeSmokingBars(smoking_loc);
    // makeObesityTrend(obesity_trend);
    // makeSmokingTrend(smoking_trend);
    // makeFoodTrend(food_trend);
    // makeInsuranceTrend(insurance_trend);

    // var plots = [makeObesityBars(locs), makeSmokingBars(locs), makeObesityTrend(trend),
    //     makeSmokingTrend(trend), makeFoodTrend(trend), makeInsuranceTrend(trend)
    // ];
    var barplots = [makeObesityBars(locs), makeSmokingBars(locs)];
    makeObesityTrend(trend);
    makeSmokingTrend(trend);
    makeFoodTrend(trend);
    makeInsuranceTrend(trend);

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        makeObesityTrend(trend);
        makeSmokingTrend(trend);
        makeFoodTrend(trend);
        makeInsuranceTrend(trend);
    });

    d3.selectAll('.dimple-marker')
        .attr('r', 3);
}

function makeObesityBars(locs) {
    var data = locs.filter(function(d) { return d.indicator === 'obesity'; });
    var margin = { top: 12, right: 18, bottom: 40, left: 90 };
    var svg = d3.select('#obesity-loc')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

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

    return chart;

}

function makeSmokingBars(locs) {
    var data = locs.filter(function(d) { return d.indicator === 'smoking'; });
    var margin = { top: 12, right: 18, bottom: 40, left: 90 };
    var svg = d3.select('#smoking-loc')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
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

    return chart;
}

function makeObesityTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'obesity'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');

    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#obesity-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

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

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    // var shapes = baseline.shapes.selectAll('path');
    // console.log(shapes);
    d3.select('#obesity-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;
}

function makeSmokingTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'smoking'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#smoking-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

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

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    d3.select('#smoking-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;
}

function makeFoodTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'food_insecurity'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#food-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
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

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    // var shapes = baseline.shapes.selectAll('path');
    // console.log(shapes);
    d3.select('#food-trend #dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;
}

function makeInsuranceTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'insurance'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#insurance-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
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

    colorline.addOrderRule(['New Haven', 'GNH', 'CT']);

    colorline.getTooltipText = function(e) {
        // console.log(e);
        var txt = e.aggField[0] + ', ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };
    baseline.getTooltipText = function(e) {
        var txt = 'Goal, ' + d3.timeFormat('%Y')(e.x) + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

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

    return chart;

}
