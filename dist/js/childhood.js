d3.queue()
    .defer(d3.csv, '../data/childhood/acs_prek_enrollment_trend.csv')
    .defer(d3.csv, '../data/childhood/acs_prek_enrollment_by_type.csv')
    .defer(d3.csv, '../data/childhood/childcare.csv')
    .defer(d3.csv, '../data/childhood/chronic_absenteeism.csv')
    .defer(d3.csv, '../data/childhood/low_income_kids_by_race.csv')
    .await(init);

///////////// INIT
function init(error, prekTrend, prekType, childcare, absence, lowIncome) {
    if (error) throw error;

    prekTrend.forEach(function(d) {
        d.value = +d.value;
    });

    prekType.forEach(function(d) {
        d.value = +d.value;
    });

    childcare.forEach(function(d) {
        d.value = +d.value;
    });

    absence.forEach(function(d) {
        d.value = +d.value;
    });

    lowIncome.forEach(function(d) {
        d.value = +d.value;
    });

    // var enrollmentRings = makeRings(childcare);
    makeEnrollTrend(prekTrend);
    var barplots = [makeChildcareRings(childcare), makeAbsBars(absence), makeIncomeBars(lowIncome), makeTypeBars(prekType)];
    redrawDots();

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        makeEnrollTrend(prekTrend);
        redrawDots();
    });
}

function makeAbsBars(dataAll) {
    // this dataset has values for all grades & multiple school years. filtering for K-3, SY 2015-16
    var grades = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'];
    var year = '2015-2016';
    var data = dimple.filterData(dimple.filterData(dataAll, 'year', year), 'name', grades);
    console.log(data);
    var margin = { top: 12, right: 18, bottom: 60, left: 80 };
    var svg = d3.select('#absence-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var y = chart.addCategoryAxis('y', ['name', 'type']);
    y.title = null;
    y.addOrderRule(['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    chart.addSeries('type', dimple.plot.bar);
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

function makeIncomeBars(data) {
    var margin = { top: 12, right: 18, bottom: 60, left: 80 };
    var svg = d3.select('#low-inc-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var y = chart.addCategoryAxis('y', ['name', 'type']);
    y.title = null;
    y.addOrderRule(['All races', 'White', 'Black', 'Hispanic'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 5;
    x.title = null;

    chart.addSeries('type', dimple.plot.bar);
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


function makeChildcareRings(data) {
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
    var y = chart.addCategoryAxis('y', 'name');
    var rings = chart.addSeries('type', dimple.plot.pie);
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
