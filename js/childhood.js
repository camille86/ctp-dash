d3.queue()
    .defer(d3.csv, '../data/childhood/prek_enrollment_trend.csv')
    .defer(d3.csv, '../data/childhood/prek_enrollment_by_type.csv')
    .defer(d3.csv, '../data/childhood/childcare.csv')
    .defer(d3.csv, '../data/childhood/chronic_absenteeism.csv')
    .defer(d3.csv, '../data/childhood/low_income_under6.csv')
    .await(init);

///////////// INIT
function init(error, prek_trend, prek_type, childcare, absence, low_inc) {
    if (error) throw error;

    prek_trend.forEach(function(d) {
        d.value = +d.value;
    });

    prek_type.forEach(function(d) {
        d.value = +d.value;
    });

    childcare.forEach(function(d) {
        d.value = +d.value;
    });

    absence.forEach(function(d) {
        d.value = +d.value;
    });

    low_inc.forEach(function(d) {
        d.value = +d.value;
    });

    // var enrollmentRings = makeRings(childcare);
    makeEnrollTrend(prek_trend);
    var barplots = [makeRings(childcare), makeAbsBars(absence), makeIncBars(low_inc), makeTypeBars(prek_type)];
    redrawDots();

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        makeEnrollTrend(prek_trend);
        redrawDots();
    });
}

function makeAbsBars(data) {
    var margin = { top: 12, right: 18, bottom: 60, left: 80 };
    var svg = d3.select('#absence-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var y = chart.addCategoryAxis('y', ['grade', 'location']);
    y.title = null;
    y.addOrderRule(['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'], true);


    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    chart.addSeries('location', dimple.plot.bar);
    chart.addLegend('8%', '95%', 200, 20, 'left');

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizGroupTip);

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

function makeIncBars(data) {
    var margin = { top: 12, right: 18, bottom: 60, left: 80 };
    var svg = d3.select('#low-inc-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'race');
    y.title = null;
    y.addOrderRule(['All', 'White', 'Black', 'Hispanic'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 5;
    x.title = null;

    chart.addSeries('race', dimple.plot.bar);

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

function makeEnrollTrend(data) {
    var margin = { top: 12, right: 18, bottom: 45, left: 30 };
    var svg = d3.select('#prek-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ green, ltblue, pink ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;
    x.ticks = 2;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var trend = chart.addSeries(['name'], dimple.plot.line);
    trend.lineMarkers = true;

    chart.addLegend('8%', '95%', '100%', '10%', 'left', trend);

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


function makeRings(data) {
    var margin = { top: 12, right: 10, bottom: 50, left: 80 };
    var svg = d3.select('#childcare-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, dkblue, ltblue ];

    var p = chart.addMeasureAxis('p', 'value');
    var x = chart.addCategoryAxis('x', 'dummy');
    var y = chart.addCategoryAxis('y', 'age');
    var rings = chart.addSeries('measure', dimple.plot.pie);
    rings.innerRadius = 35;
    rings.outerRadius = 60;

    x.hidden = true;
    y.title = null;

    p.addOrderRule(['Center-based', 'Family care', 'Shortage']);
    y.addOrderRule(['Pre-K', 'Infants and toddlers']);

    chart.addLegend('8%', '90%', 200, 20, 'left');

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(pieTip);

    svg.selectAll('path.dimple-pie')
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

function makeTypeBars(data) {
    var margin = { top: 12, right: 18, bottom: 45, left: 30 };
    var svg = d3.select('#prek-type')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ dkblue, ltblue ];

    var x = chart.addCategoryAxis('x', 'name');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);
    bars.addOrderRule(['Private', 'Public']);

    chart.addLegend('8%', '95%', '100%', '10%', 'left', bars);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(vertGroupTip);

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
