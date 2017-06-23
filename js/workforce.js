d3.queue()
    .defer(d3.json, '../json/nhv_neighborhoods.json')
    .defer(d3.json, '../json/nhv_tracts.json')
    .defer(d3.csv, '../data/workforce/underemployment_by_location.csv')
    .defer(d3.csv, '../data/workforce/underemployment_by_year.csv')
    .defer(d3.csv, '../data/workforce/unemployment_rate_by_year.csv')
    .defer(d3.csv, '../data/workforce/acs_public_transit_by_neighborhood.csv')
    .defer(d3.csv, '../data/workforce/acs_median_income_by_tract.csv')
    .await(init);

///////////// INIT
function init(error, hoods, tracts, underempLoc, underempTrend, unempTrend, transit, income) {
    if (error) throw error;

    underempLoc.forEach(function(d) {
        d.value = +d.value;
    });

    underempTrend.forEach(function(d) {
        d.value = +d.value;
    });

    unempTrend.forEach(function(d) {
        d.value = +d.value;
    });

    transit.forEach(function(d) {
        d.value = +d.value;
    });

    income.forEach(function(d) {
        d.value = +d.value;
    });

    var commuteMap = d3map();
    d3.select('#commute-map')
        .datum(topojson.feature(hoods, hoods.objects.shapes))
        .call(commuteMap);
    commuteMap.color(transit, choroscale)
        .tip('d3-tip', d3.format('.2p'), true)
        .legend(d3.format('.0%'), 15, 0);

    var incomeMap = d3map();
    d3.select('#income-map')
        .datum(topojson.feature(tracts, tracts.objects.nhv_tracts))
        .call(incomeMap);
    incomeMap.color(income, choroscale)
        .tip('d3-tip', d3.format('$,'), false)
        .legend(d3.format('$,'), 15, 0);

    var locationChart = makeUnderLocation(underempLoc);
    var underTrend = makeUnderTrend(underempTrend);
    var unTrend = makeUnTrend(unempTrend);

    d3.select(window).on('resize', function() {
        locationChart.draw(0, true);

        underTrend = makeUnderTrend(under_tr);
        unTrend = makeUnTrend(un_tr);

        commuteMap.draw();
        incomeMap.draw();

        redrawDots();
    });

    redrawDots();

}

function makeUnderLocation(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 100 };
    var svg = d3.select('#underemployment-chart')
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
        })
        .on('touchend', function(d) {
            tip.show(d);
            barOver(this);
        });

    return chart;
}


function makeUnderTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };

    var svg = d3.select('#underemployment-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;

    chart.defaultColors = [ ltblue, pink ];

    // var colorline = chart.addSeries('Type', dimple.plot.line);
    // colorline.lineMarkers = true;
    var past = dimple.filterData(data, 'type', 'past');
    var goal = dimple.filterData(data, 'type', 'goal');


    var goalline = chart.addSeries('type', dimple.plot.line);
    var pastline = chart.addSeries(null, dimple.plot.line);
    pastline.lineMarkers = true;
    goalline.lineMarkers = true;
    pastline.data = past;
    goalline.data = goal;

    // chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);
    chart.draw();

    d3.select('#dimple-goal')
        .style('stroke-dasharray', ('5, 5'));

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        })
        .on('touchstart', function(d) {
            d3.event.preventDefault();
            tip.show(d);
            dotOver(this);
        });

    // svg.selectAll('.dimple-marker.dimple-goal:first-child')
    //     .attr('display', 'none');

    return chart;
}

function makeUnTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };

    var svg = d3.select('#unemployment-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 6;

    chart.defaultColors = [ pink, ltblue ];

    var colorline = chart.addSeries('name', dimple.plot.line);
    colorline.lineMarkers = true;

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

    return chart;
}
