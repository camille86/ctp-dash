d3.queue()
    .defer(d3.csv, '../data/health/health_bars.csv')
    .defer(d3.csv, '../data/health/health_trends.csv')
    // .defer(d3.csv, '../data/health/asthma_tract.csv')
    // .defer(d3.csv, '../data/health/dental_tract.csv')
    .defer(d3.csv, '../data/health/500_cities_tract_current_asthma_dental_visit.csv')
    .defer(d3.json, '../json/nhv_tracts.json')
    .await(init);

///////////// INIT
function init(error, locs, trend, asthmaDental, json) {
    if (error) throw error;

    var asthmaMap = d3map();
    d3.select('#asthma-map')
        .datum(topojson.feature(json, json.objects.nhv_tracts))
        .call(asthmaMap);
    asthmaMap.color(asthmaDental.filter(function(d) { return d.indicator === 'current asthma'; }), ['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156'])
        .tip('d3-tip', d3.format('.1%'), false)
        .legend(d3.format('.0%'), 20, 20);

    var dentalMap = d3map();
    d3.select('#dental-map')
        .datum(topojson.feature(json, json.objects.nhv_tracts))
        .call(dentalMap);
    dentalMap.color(asthmaDental.filter(function(d) { return d.indicator === 'dental visit'; }), ['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156'])
        .tip('d3-tip', d3.format('.0%'), false)
        .legend(d3.format('.0%'), 20, 20);

    locs.forEach(function(d) {
        d.value = +d.value;
    });
    trend.forEach(function(d) {
        d.value = +d.value;
    });


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

        asthmaMap.draw();
        dentalMap.draw();

        redrawDots();
    });

    redrawDots();
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
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');

    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 4;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

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
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');

    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    // x.title = '';
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

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
    chart.defaultColors = [ ltblue, pink, dkblue ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
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
    chart.defaultColors = [ ltblue, pink, dkblue ];

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

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
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
    chart.defaultColors = [ ltblue, pink, dkblue ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
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
    chart.defaultColors = [ ltblue, pink, dkblue, green ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    colorline.addOrderRule(['New Haven', 'GNH', 'CT']);

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;

}
