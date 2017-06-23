d3.queue()
    .defer(d3.json, '../json/nhv_neighborhoods.json')
    .defer(d3.csv, '../data/housing/acs_cost_burden_by_neighborhood.csv')
    .defer(d3.csv, '../data/housing/acs_cost_burden_by_tenure.csv')
    .defer(d3.csv, '../data/housing/acs_tenure_by_age.csv')
    // .defer(d3.csv, '../data/housing/homeownership_1970-2010.csv')
    .defer(d3.csv, '../data/housing/homeownership_by_race_age.csv')
    .await(init);

//////////////////////////// INITIALIZE
function init(error, json, burdenHood, burdenTenure, tenureAge, tenureAgeRace) {
    if (error) throw error;

    burdenTenure.forEach(function(d) {
        d.value = +d.value;
    });

    tenureAge.forEach(function(d) {
        d.value = +d.value;
    });

    tenureAgeRace.forEach(function(d) {
        d.value = +d.value;
    });

    // map from d3map
    var city = topojson.feature(json, json.objects.shapes);
    var nhv = d3map();
    d3.select('#burden-map')
        .datum(city)
        .call(nhv);
    nhv.color(burdenHood, choroscale)
        .tip('d3-tip', d3.format('.2p'), true)
        .legend(d3.format('.0%'), 15, 0);

    // var homeTrend = makeTenureTrend(trend);
    var barplots = [makeBurdenBars(burdenTenure), makeAge(tenureAge), makeAgeRace(tenureAgeRace)];

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        // burdenBars.draw(0, true);
        // ageBars.draw(0, true);
        nhv.draw();
    });

}

function makeBurdenBars(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 30 };
    console.log(data);

    var svg = d3.select('#burden-tenure')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var x = chart.addCategoryAxis('x', ['name', 'type']);
    x.addOrderRule(['CT', 'GNH', 'New Haven']);
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);

    chart.addLegend('25%', '8%', '10%', '20%', 'right');
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

function makeAge(dataAll) {
    var data = dimple.filterData(dataAll, 'name', ['New Haven', 'CT']);
    var margin = { top: 12, right: 18, bottom: 45, left: 60 };
    var svg = d3.select('#age-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    chart.defaultColors = [ pink, ltblue, dkblue ];

    var y = chart.addCategoryAxis('y', ['name', 'type']);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 4;
    x.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);
    chart.addLegend('8%', '95%', '100%', 20, 'left');
    bars.addOrderRule(['Ages 15-34', 'Ages 35-64', 'Ages 65+']);

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

function makeAgeRace(data) {
    var data = data.filter(function(d) { return d.name !== 'All races' & d.name !== 'Other'; });
    var margin = { top: 12, right: 18, bottom: 60, left: 60 };
    var svg = d3.select('#tenure-age-race')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = scale5;

    var y = chart.addCategoryAxis('y', 'name');
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var dots = chart.addSeries('type', dimple.plot.bubble);
    dots.addOrderRule(['Under 35', 'Ages 35-44', 'Ages 45-54', 'Ages 55-64', 'Ages 65+']);
    chart.addLegend('8%', '85%', '100%', '20%', 'left', dots);

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

function makeTenureTrend(data) {

}
