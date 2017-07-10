d3.queue()
    .defer(d3.csv, '../data/cross/financial_wellbeing.csv')
    .defer(d3.csv, '../data/cross/personal_wellbeing_index.csv')
    .defer(d3.csv, '../data/cross/total_population.csv')
    .defer(d3.csv, '../data/cross/gcc_grads_by_residency_trend.csv')
    .defer(d3.csv, '../data/cross/gcc_grads_by_race.csv')
    .defer(d3.csv, '../data/cross/poverty_by_age_race.csv')
    .await(init);

//////////////////// INIT
function init(error, financial, personal, pop, gccRes, gccRace, poverty) {
    if (error) throw error;

    financial.forEach(function(d) {
        d.value = +d.value;
    });

    personal.forEach(function(d) {
        d.value = +d.value;
    });

    pop.forEach(function(d) {
        d.value = +d.value;
    });

    gccRes.forEach(function(d) {
        d.value = +d.value;
    });

    gccRace.forEach(function(d) {
        d.value = +d.value;
    });

    poverty.forEach(function(d) {
        d.value = +d.value;
    });

    var finNested = nestData(financial);
    var rows = finNested.length;
    var plots = [];
    finNested.forEach(function(indic, i) {
        var chart = makeFinancialBars(indic, i, rows);
        plots.push(chart);
    });

    plots.push(makePersonalBars(personal), makeAgeRace(poverty), makeGccRes(gccRes), makeGccRace(gccRace));

    makePopTrend(pop);

    d3.select(window).on('resize', function() {
        plots.forEach(function(plot) { plot.draw(0, true); });

        makePopTrend(pop);

        redrawDots();
    });

    redrawDots();
}

function nestData(data) {
    var nested = d3.nest()
        .key(function(d) { return d.indicator; })
        .entries(data);
    // var rows = nested.length;
    // nested.forEach(function(indic, i) {
    //     makeBars(indic, i, rows);
    // });
    return nested;
}

function makeFinancialBars(data, i, rows) {
    // if this is the last row, have big bottom margin
    var margin = { top: 12, right: 18, left: 40 };
    margin.bottom = i === rows - 1 ? 100 : 20;
    var height = 100 + margin.bottom;
    // var margin = { top: 12, right: 18, bottom: 20, left: 40 };
    var div = d3.select('#fin-wellbeing')
        .append('div')
        .attr('class', 'multiple')
        .text(data.key)
        .append('div');
    var svg = div.append('svg')
        .attr('width', '100%')
        .attr('height', height);

    var values = data.values;

    var colorscale = d3.scaleOrdinal()
        .domain(dimple.getUniqueValues(values, 'type'))
        .range([pink.fill, dkblue.fill, green.fill]);

    var chart = new dimple.chart(svg, values);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addCategoryAxis('x', 'name');
    // x.title = null;
    x.hidden = i === rows - 1 ? false : true;
    // x.addOrderRule(['1 - location', '2 - age', '3 - income']);
    x.addOrderRule(['Connecticut', 'Greater New Haven', 'New Haven',
        'Ages 18-34', 'Ages 35-49', 'Ages 50-64', 'Ages 65+',
        'Income below $30K', '$30K-$75K', '$75K+']);

    var y = chart.addMeasureAxis('y', 'value');
    y.title = null;
    y.ticks = 4;
    y.tickFormat = '.0%';
    y.overrideMax = 1.0;

    var bars = chart.addSeries('type', dimple.plot.bar);
    chart.draw();

    svg.selectAll('rect.dimple-bar')
        .style('fill', function(d) { return colorscale(d.aggField[0]); })
        .style('stroke', function(d) {
            var fill = d3.color(colorscale(d.aggField[0]))
            return fill.darker();
        });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(vertTip);

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




function makeMultiples(dataAll) {
    var nestRows = d3.nest()
        .key(function(d) { return d.indicator; })
        .entries(dataAll);

    d3.select('#fin-wellbeing2')
        .selectAll('div.multiple')
        .data(nestRows)
        .enter().append('div')
            .attr('class', 'multiple')
            .call(makeRow);
}

function makePersonalBars(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 100 };
    // var width = fullwidth - margin.left - margin.right;
    // var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#per-wellbeing')
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
    x.ticks = 5;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip2);

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

function makePopTrend(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 40 };

    var svg = d3.select('#total-pop-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;
    x.timePeriod = d3.timeYear;
    x.timeInterval = 5;

    var y = chart.addMeasureAxis('y', 'value');
    y.title = null;
    y.ticks = 6;

    var line = chart.addSeries(null, dimple.plot.line);
    line.lineMarkers = true;

    chart.defaultColors = [ pink ];

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendTipThous);

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

    return chart;
}

function makeAgeRace(data) {
    var margin = { top: 12, right: 18, bottom: 60, left: 60 };
    var svg = d3.select('#poverty-age-race')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = scale3;

    var y = chart.addCategoryAxis('y', 'name');
    y.title = null;
    y.addOrderRule(['All races', 'White', 'Black', 'Hispanic'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var dots = chart.addSeries('type', dimple.plot.bubble);
    dots.addOrderRule(['Under 18', 'Ages 18-64', 'Ages 65+', 'All ages']);
    chart.addLegend('8%', '95%', '100%', '40%', 'left', dots);

    chart.draw();

    svg.selectAll('circle.dimple-bubble')
        .attr('r', 9);

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(horizGroupTip);

    svg.selectAll('circle.dimple-bubble')
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

function makeGccRes(data) {
    var margin = { top: 12, right: 18, bottom: 90, left: 40 };
    var svg = d3.select('#gcc-res')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var x = chart.addCategoryAxis('x', 'name');
    x.title = null;
    x.addOrderRule(function(a, b) {
        return a.name < b.name ? -1 : 1;
    }, false);

    var y = chart.addMeasureAxis('y', 'value');
    y.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);
    bars.addOrderRule(['New Haven', 'Other towns']);
    chart.addLegend('8%', '95%', '100%', '40%', 'left', bars);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(vertGroupTip2);

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

function makeGccRace(data) {
    var margin = { top: 12, right: 18, bottom: 80, left: 60 };
    var svg = d3.select('#gcc-race')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, green, dkblue, ltblue ];

    var x = chart.addMeasureAxis('x', 'value');
    x.title = null;
    x.tickFormat = '.0%';
    x.ticks = 5;

    var y = chart.addCategoryAxis('y', 'name');
    y.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);
    chart.addLegend('8%', '85%', '100%', '40%', 'left', bars);

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


// function makeFinancialDots(data) {
//     var margin = { top: 12, right: 18, bottom: 60, left: 150 };
//     var svg = d3.select('#fin-wellbeing')
//         .append('svg')
//         .attr('width', '100%')
//         .attr('height', '100%');
//
//     var chart = new dimple.chart(svg, data);
//     chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
//     chart.defaultColors = demoscale;
//
//     var y = chart.addCategoryAxis('y', 'indicator');
//     y.title = null;
//
//     var x = chart.addMeasureAxis('x', 'value');
//     x.tickFormat = '.0%';
//     x.ticks = 6;
//     x.title = null;
//
//     var dots = chart.addSeries('group', dimple.plot.bubble);
//
//     chart.draw();
//
//     svg.selectAll('circle.dimple-bubble')
//         .attr('r', 9);
// }
