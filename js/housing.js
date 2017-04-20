d3.queue()
    .defer(d3.json, '../json/nhv_shape.json')
    .defer(d3.csv, '../data/cost_burden_neighborhoods.csv')
    .defer(d3.csv, '../data/cost_burden_tenure.csv')
    .await(init);

//////////////////////////// INITIALIZE
function init(error, json, hood, tenure) {
    if (error) throw error;

    hood.forEach(function(d) {
        d.severe_burden = +d.severe_burden;
    });
    // tenure.forEach(function(d) {
    //     d.severe_burden = +d.severe_burden;
    // });

    drawMap(json, hood);
    drawTenure2(tenure);

    d3.selectAll('.dimple-marker')
        .attr('r', 3);
}

function drawTenure2(csv) {
    var fullwidth = 380;
    var fullheight = 210;
    var margin = { top: 12, right: 18, bottom: 40, left: 30 };
    var width = fullwidth - margin.left - margin.right;
    var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#burden-tenure')
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);

    var chart = new dimple.chart(svg, csv);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [
        new dimple.color('#992156'),
        new dimple.color('#739DD0')
    ];


    var x = chart.addCategoryAxis('x', ['Location', 'Tenure']);
    x.addOrderRule(['CT', 'GNH', 'New Haven']);
    x.title = null;

    var y = chart.addMeasureAxis('y', 'Burden');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var bars = chart.addSeries('Tenure', dimple.plot.bar);
    bars.getTooltipText = function(e) {
        var txt = e.xField[0] + ', ' + e.xField[1] + ': ' + d3.format('.0%')(e.y);
        return [txt];
    };

    chart.addLegend('15%', '5%', 100, 20, 'left');
    chart.draw();

}

function drawTenure(csv) {
    // var width = 400;
    // var height = 240;
    var percent = d3.format('.0%');

    // doing this with d3fc components

    var yextent = fc.extentLinear()
        .accessors([function(d) { return d.map(function(d) { return d[1]; }); }])
        .include([0]);

    var group = fc.group()
        .key('Location');
    var series = group(csv);

    var tenures = series.map(function(d) { return d.key; });

    var color = d3.scaleOrdinal()
        .domain(tenures)
        .range(['#992156', '#739DD0']);

    var legend = d3.legendColor()
        .orient('horizontal')
        .shapeWidth(20)
        .shapePadding(20)
        .labelOffset(6)
        .scale(color);

    var bars = fc.seriesSvgGrouped(fc.seriesSvgBar())
        .crossValue(function(d) { return d[0]; })
        .mainValue(function(d) { return d[1]; })
        .decorate(function(sel, data, index) {
            sel.enter()
                .select('path')
                .attr('fill', color(tenures[index]));
        });

    var chart = fc.chartSvgCartesian(d3.scalePoint(), d3.scaleLinear())
        .xDomain(csv.map(function(d) { return d.Location; }))
        .xPadding(0.5)
        .yDomain(yextent(series))
        .yOrient('left')
        .yTickFormat(percent)
        .plotArea(bars)
        .decorate(function(sel) {
            sel.enter()
                .append('svg')
                .attr('class', 'horiz-legend');
                // .attr('transform', 'translate(20,20)');
            sel.select('.horiz-legend')
                .call(legend);
        });

    d3.select('#burden-tenure')
        .datum(series)
        .call(chart);

}



function drawMap(topo, csv) {
    var width = 540;
    var height = 400;

    var svg = d3.select('#burden-map')
        .append('svg')
        .attr('id', 'mapSVG')
        .attr('width', '100%')
        .attr('viewBox', '0 0 ' + width + ' ' + height);
        // .attr('width', mapAttr.fullwidth)
        // .attr('height', mapAttr.fullheight);

    var proj = d3.geoMercator()
        .center([-72.929916, 41.310726])
        .scale(185000)
        .translate([width / 2, height * 1 / 2.5]);

    var path = d3.geoPath().projection(proj);

    var polygons = svg.append('g')
        // .attr('transform', 'translate(12, 12)')
        .selectAll('path')
        .data(topojson.feature(topo, topo.objects.nhv_shape).features)
        .enter().append('path')
            .attr('d', path)
            .attr('class', 'polygon');

    colorMap(csv);
}



function colorMap(csv) {
    var nested = d3.nest()
        .key(function(d) { return d.name; })
        .entries(csv);

    // var vals = d3.map(nested, function(d) { return d.values[0].severe_burden; });
    var vals = nested.map(function(d) { return d.values[0].severe_burden; });
    var breaks = ss.ckmeans(vals, 5).map(function(val) { return val[0]; }).slice(1);

    var color = d3.scaleThreshold()
        .domain(breaks)
        .range(['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156']);
        // .range(d3.schemePurples[5]);

    var hoodMap = {};
    nested.forEach(function(d) {
        hoodMap[d.key] = +d.values[0].severe_burden;
    });

    var polygons = d3.selectAll('.polygon')
        .attr('fill', function(d) {
            var value = hoodMap[d.properties.Neighborhood];
            if (typeof value === 'undefined') {
                return '#bbb';
            } else {
                return color(value);
            }
        });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
            console.log(d);
            return d;
        });

    polygons.call(tip)
        .on('mouseover', function() {
            tip.html(mouseOverPoly(d3.select(this), hoodMap));
            tip.show();
        })
        .on('mouseout', tip.hide);

}


function mouseOverPoly(poly, hoodMap) {
    var hood = poly.datum().properties.Neighborhood;
    var value = hoodMap[hood];
    var valText = typeof value === 'undefined' ? 'N/A' : d3.format('.0%')(value);

    return '<span class="tip-label">' + hood + ': </span>' + valText;
}
