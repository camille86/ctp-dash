d3.queue()
    .defer(d3.csv, '../data/workforce/underemployment.csv')
    .defer(d3.csv, '../data/workforce/underemployment_time.csv')
    .defer(d3.csv, '../data/workforce/unemployment_trend.csv')
    .await(init);

///////////// INIT
function init(error, rates, under_tr, un_tr) {
    if (error) throw error;

    rates.forEach(function(d) {
        d.Underemployment = +d.Underemployment;
    });

    under_tr.forEach(function(d) {
        d.Underemployment = +d.Underemployment;
    });

    un_tr.forEach(function(d) {
        d.rate = +d.rate;
    });

    var locationChart = makeUnderLocation(rates);
    var underTrend = makeUnderTrend(under_tr);
    var unTrend = makeUnTrend(un_tr);

    d3.select(window).on('resize', function() {
        locationChart.draw(0, true);

        underTrend = makeUnderTrend(under_tr);
        unTrend = makeUnTrend(un_tr);

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

    var y = chart.addCategoryAxis('y', 'Location');
    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'Underemployment');
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

    var x = chart.addTimeAxis('x', 'Year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'Underemployment');
    y.tickFormat = '.0%';
    y.ticks = 6;

    chart.defaultColors = [ ltblue, pink ];

    // var colorline = chart.addSeries('Type', dimple.plot.line);
    // colorline.lineMarkers = true;
    var past = dimple.filterData(data, 'type', 'past');
    var goal = dimple.filterData(data, 'type', 'goal');


    var goalline = chart.addSeries(['type'], dimple.plot.line);
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

    var x = chart.addTimeAxis('x', 'date', '%Y-%m-%d', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'rate');
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
