var d3map = function() {
    var aspect = 1.0;
    var width, height;
    var proj, path;
    var svg, parent;
    var b;
    var color;
    var mapData = {};

    var values = function(d) { return +d.value; };

    function chart(selection) {

        selection.each(function(topo) {
            parent = d3.select(this);
            init(this, topo);

        });
    }

    var init = function(selection, topo) {
        width = width || parseInt(parent.style('width'));
        height = width * aspect;

        proj = d3.geoMercator()
            .scale(1)
            .translate([0, 0]);

        path = d3.geoPath().projection(proj);

        b = path.bounds(topo);
        var s = 0.95 / ((b[1][0] - b[0][0]) / width);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        proj
            .scale(s)
            .translate(t);

        svg = d3.select(selection)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        var polygons = svg.append('g')
            .selectAll('path')
            // .data(topojson.feature(topo, topo.objects.shape).features)
            .data(topo.features)
            .enter().append('path')
                .attr('d', path)
                .attr('class', 'polygon');
        chart.draw();
    };

    function mouseOverPoly(poly, format, hasName) {
        var name = poly.datum().properties.name;
        var value = mapData[name];
        var valText = typeof value === 'undefined' ? 'N/A' : format(value);

        var nametag = hasName ? '<span class="tip-label">' + name + ': </span>' : '';
        return nametag + valText;
    }

    /////////// PUBLIC FUNCTIONS /////////////

    chart.draw = function() {
        var w = parseInt(parent.style('width'));
        var h = w * aspect;
        this.width(w).height(h);

        var s = 0.95 / ((b[1][0] - b[0][0]) / width);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        proj
            .scale(s)
            .translate(t);
        path = d3.geoPath().projection(proj);
        svg
            .attr('width', w)
            .attr('height', h)
            .selectAll('.polygon')
            .attr('d', path);

        return chart;
    };

    chart.color = function(csv, scheme, hasLegend) {
        // if only csv given, sets scheme to purples & n to 5
        if (!arguments.length) { return chart; }

        scheme = scheme || d3.schemePurples[5];
        n = scheme.length;

        csv.forEach(function(d) { d.value = +d.value; });

        var nested = d3.nest()
            .key(function(d) { return d.name; })
            .entries(csv);
        var vals = nested.map(function(d) { return d.values[0].value; });
        var breaks = ss.ckmeans(vals, n).map(function(val) { return val[0]; }).slice(1);
        color = d3.scaleThreshold()
            .domain(breaks)
            .range(scheme);

        nested.forEach(function(d) {
            mapData[d.key] = d.values[0].value;
        });

        var polygons = parent.selectAll('.polygon')
            .attr('fill', function(d) {
                var value = mapData[d.properties.name];
                if (typeof value === 'undefined') {
                    return '#bbb';
                } else {
                    return color(value);
                }
            });


        return chart;
    };

    chart.tip = function(tipClass, format, hasName) {
        tipClass = tipClass || 'd3-tip';
        format = format || d3.format('');
        var tip = d3.tip()
            .attr('class', tipClass);

        parent.selectAll('.polygon')
            .call(tip)
            .on('mouseover', function() {
                tip.html(mouseOverPoly(d3.select(this), format, hasName));
                tip.show();
            })
            .on('mouseout', tip.hide);

        return chart;
    };

    chart.legend = function(format, left, bottom, legendClass) {
        legendClass = legendClass || 'legendQuant';
        format = format || d3.format('');

        left = left || 20;
        bottom = bottom || 20;

        var legendSvg = parent.append('div')
            .style('position', 'absolute')
            .style('left', left + 'px')
            .style('bottom', bottom + 'px')
            .style('pointer-events', 'none')
            .append('svg');

        var g = legendSvg.append('g')
            .attr('class', legendClass);

        var legend = d3.legendColor()
            .labelFormat(format)
            .labels(thresholdLabels)
            .useClass(false)
            .scale(color);
        g.call(legend);

        // shrink legendSvg to size of g
        var bbox = g.node().getBBox();
        legendSvg.attr('width', bbox.width).attr('height', bbox.height);

        return chart;
    };

    function thresholdLabels(l) {
        if (l.i === 0) {
            return l.generatedLabels[l.i].replace('NaN% to', 'Less than').replace('$NaN to', 'Less than');
        } else if (l.i === l.genLength - 1) {
            var str = 'More than ' + l.generatedLabels[l.genLength - 1];
            return str.replace(' to NaN%', '').replace(' to $NaN', '');
        }
        return l.generatedLabels[l.i];
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    return chart;
};
