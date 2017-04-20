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

    makeRings(childcare);
}


function makeRings(data) {
    var fullwidth = 500;
    var fullheight = 320;
    var margin = { top: 30, right: 12, bottom: 24, left: 24 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#childcare-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
        // .attr('width', '100%')
        // .attr('height', '100%')
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#992156'),
        new dimple.color('#2F588B'),
        new dimple.color('#739DD0')
    ];

    console.log(data);
    var p = chart.addMeasureAxis('p', 'value');
    var x = chart.addCategoryAxis('x', 'age');
    var y = chart.addCategoryAxis('y', 'dummy');
    var rings = chart.addSeries('measure', dimple.plot.pie);
    rings.innerRadius = 50;
    rings.outerRadius = 80;

    y.hidden = true;
    p.addOrderRule(['Center-based', 'Family care', 'Shortage']);

    chart.addLegend('5%', '5%', 200, 20, 'left');

    rings.getTooltipText = function(e) {
        var txt = e.cx + ', ' + e.aggField[0] + ': ' + e.pValue;
        return [txt];
    };

    chart.draw();

}
