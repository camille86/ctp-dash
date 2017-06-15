d3.queue()
    .defer(d3.json, '../json/nhv_shape2.json')
    .defer(d3.csv, '../data/housing/cost_burden_neighborhoods.csv')
    .defer(d3.csv, '../data/housing/cost_burden_tenure.csv')
    .defer(d3.csv, '../data/housing/tenure_by_age.csv')
    // .defer(d3.csv, '../data/housing/homeownership_1970-2010.csv')
    .defer(d3.csv, '../data/housing/tenure_by_race_age.csv')
    .await(init);

//////////////////////////// INITIALIZE
function init(error, json, hood, burden, age, age_race) {
    if (error) throw error;

    burden.forEach(function(d) {
        d.Burden = +d.Burden;
    });

    age.forEach(function(d) {
        d.rate = +d.rate;
    });

    age_race.forEach(function(d) {
        d.value = +d.value;
    });

    // map from d3map
    var city = topojson.feature(json, json.objects.shapes);
    var nhv = d3map();
    d3.select('#burden-map')
        .datum(city)
        .call(nhv);
    nhv.color(hood, ['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156'])
        .tip('d3-tip', d3.format('.0%'), true)
        .legend(d3.format('.0%'), 15, 0);

    // var homeTrend = drawTenureTrend(trend);
    var barplots = [drawBurdenBars(burden), drawAge(age), drawAgeRace(age_race)];

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        // burdenBars.draw(0, true);
        // ageBars.draw(0, true);
        nhv.draw();
    });

}

function drawBurdenBars(data) {
    // var fullwidth = 380;
    // var fullheight = 210;
    var margin = { top: 12, right: 18, bottom: 40, left: 30 };
    // var width = fullwidth - margin.left - margin.right;
    // var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#burden-tenure')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var x = chart.addCategoryAxis('x', ['Location', 'Tenure']);
    x.addOrderRule(['CT', 'GNH', 'New Haven']);
    x.title = null;

    var y = chart.addMeasureAxis('y', 'Burden');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var bars = chart.addSeries('Tenure', dimple.plot.bar);

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

function drawAge(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 60 };
    var svg = d3.select('#age-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'group');
    y.title = null;

    var x = chart.addMeasureAxis('x', 'rate');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    chart.addSeries(null, dimple.plot.bar);

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

function drawAgeRace(data) {
    var data = data.filter(function(d) { return d.race !== 'All races'; });
    var margin = { top: 12, right: 18, bottom: 60, left: 60 };
    var svg = d3.select('#tenure-age-race')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = scale5;

    var y = chart.addCategoryAxis('y', 'race');
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var dots = chart.addSeries('age', dimple.plot.bubble);
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

function drawTenureTrend(data) {

}
