d3.queue()
    .defer(d3.csv, '../data/childcare.csv')
    // .defer(d3.csv, '../data/cost_burden_tenure_wide.csv')
    .await(init);

///////////// INIT
function init(error, childcare) {
    if (error) throw error;

    childcare.forEach(function(d) {
        d.value = +d.value;
    });

    var enrollmentRings = makeRings(childcare);
    d3.select(window).on('resize', function() {
        enrollmentRings.draw(0, true);
    });
}


function makeRings(data) {
    // var fullwidth = 575;
    // var fullheight = 400;
    var margin = { top: 50, right: 12, bottom: 40, left: 24 };
    // var width = fullwidth - margin.left - margin.right;
    // var height = fullheight - margin.top - margin.bottom;
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
    var x = chart.addCategoryAxis('x', 'age');
    var y = chart.addCategoryAxis('y', 'dummy');
    var rings = chart.addSeries('measure', dimple.plot.pie);
    rings.innerRadius = 50;
    rings.outerRadius = 80;

    y.hidden = true;
    x.title = null;
    p.addOrderRule(['Center-based', 'Family care', 'Shortage']);

    chart.addLegend('5%', '5%', 200, 20, 'left');

    // rings.getTooltipText = function(e) {
    //     var txt = e.cx + ', ' + e.aggField[0] + ': ' + e.pValue;
    //     return [txt];
    // };

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(pieTip);

    svg.selectAll('path')
        .call(tip)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    return chart;
}

function pieTip(d) {
    return '<span>' + d.aggField[0] + ': ' + d3.format(',')(d.pValue) + '</span>';
}
