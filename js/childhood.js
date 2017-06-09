d3.queue()
    .defer(d3.csv, '../data/childcare.csv')
    .defer(d3.csv, '../data/chronic_absenteeism.csv')
    .await(init);

///////////// INIT
function init(error, childcare, absence) {
    if (error) throw error;

    childcare.forEach(function(d) {
        d.value = +d.value;
    });

    absence.forEach(function(d) {
        d.value = +d.value;
    });

    // var enrollmentRings = makeRings(childcare);
    var enrollmentRings = makeRings2(childcare);
    var absenceBars = makeBars(absence);

    d3.select(window).on('resize', function() {
        enrollmentRings.draw(0, true);
        absenceBars.draw(0, true);
    });
}

function makeBars(data) {
    var margin = { top: 12, right: 18, bottom: 60, left: 80 };
    var svg = d3.select('#absence-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#992156'),
        new dimple.color('#2F588B')
    ];

    var y = chart.addCategoryAxis('y', ['grade', 'location']);
    y.title = null;
    y.addOrderRule(['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'], true);
    y.addOrderRule('location', false);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    chart.addSeries('location', dimple.plot.bar);
    chart.addLegend('8%', '95%', 200, 20, 'left');

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(barTip);

    svg.selectAll('rect')
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


// function makeRings(data) {
//     // var fullwidth = 575;
//     // var fullheight = 400;
//     var margin = { top: 50, right: 12, bottom: 40, left: 24 };
//     // var width = fullwidth - margin.left - margin.right;
//     // var height = fullheight - margin.top - margin.bottom;
//     var svg = d3.select('#childcare-chart')
//         .append('svg')
//         .attr('width', '100%')
//         .attr('height', '100%');
//
//     var chart = new dimple.chart(svg, data);
//     chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
//     chart.defaultColors = [
//         new dimple.color('#992156'),
//         new dimple.color('#2F588B'),
//         new dimple.color('#739DD0')
//     ];
//
//     var p = chart.addMeasureAxis('p', 'value');
//     var x = chart.addCategoryAxis('x', 'age');
//     var y = chart.addCategoryAxis('y', 'dummy');
//     var rings = chart.addSeries('measure', dimple.plot.pie);
//     rings.innerRadius = 50;
//     rings.outerRadius = 80;
//
//     y.hidden = true;
//     x.title = null;
//     p.addOrderRule(['Center-based', 'Family care', 'Shortage']);
//
//     chart.addLegend('5%', '5%', 200, 20, 'left');
//
//     // rings.getTooltipText = function(e) {
//     //     var txt = e.cx + ', ' + e.aggField[0] + ': ' + e.pValue;
//     //     return [txt];
//     // };
//
//     chart.draw();
//
//     var tip = d3.tip()
//         .attr('class', 'd3-tip')
//         .html(pieTip);
//
//     svg.selectAll('path')
//         .call(tip)
//         // .on('mouseover', tip.show)
//         // .on('mouseout', tip.hide);
//         .on('mouseover', function(d) {
//             tip.show(d);
//             barOver(this);
//         })
//         .on('mouseout', function(d) {
//             tip.hide(d);
//             barOut(this);
//         });
//
//     return chart;
// }

function makeRings2(data) {
    var margin = { top: 12, right: 10, bottom: 50, left: 80 };
    var svg = d3.select('#childcare-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#992156'),
        new dimple.color('#2F588B'),
        new dimple.color('#739DD0')
    ];

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

    svg.selectAll('path')
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
