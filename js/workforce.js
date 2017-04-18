$(document).ready(function() {

    d3.csv('../data/underemployment.csv', function(csv) {
        csv.forEach(function(d) {
            d.Underemployment = +d.Underemployment;
        });

        var bars = fc.seriesSvgBar()
            // .orient('horizontal')
            .crossValue(function(d) { return d.Location; })
            .mainValue(function(d) { return d.Underemployment; })
            .decorate(function(sel) {
                sel.enter()
                    .append('text')
                    .attr('class', 'bar-label')
                    .attr('transform', 'translate(0, -5)')
                    .text(function(d) { return d3.format('.0%')(d.Underemployment); });
            });

        var yExtent = fc.extentLinear()
            .include([0])
            .pad([0, 0.1])
            .accessors([function(d) { return d.Underemployment; }]);

        var xaxis = fc.axisBottom(d3.scaleBand())
            .decorate(function(sel) {
                sel.enter()
                    .select('text')
                    .style('text-anchor', 'start')
                    .attr('transform', 'rotate(45 -10 10)');
            });

        var chart = fc.chartSvgCartesian(d3.scalePoint(), d3.scaleLinear())
            .xDomain(csv.map(function(d) { return d.Location; }))
            .xPadding(0.5)
            .yDomain(yExtent(csv))
            .yOrient('none')
            // .xDecorate(function(sel) {
            //     sel.enter()
            //         .select('text')
            //         .style('text-anchor', 'start')
            //         .attr('transform', 'rotate(45 -10 10)');
            // })
            .plotArea(bars);
        //
        // var series = fc.seriesSvgBar()
        //     .orient('horizontal')
        //     .crossValue(function(d) { return d.Location; })
        //     .mainValue(function(d) { return d.Underemployment; });
        //
        // var xextent = fc.extentLinear()
        //     .include([0])
        //     .pad([0, 0.1])
        //     .accessors([function(d) { return d.Underemployment; }]);
        //
        // var chart = fc.chartSvgCartesian(d3.scaleLinear(), d3.scalePoint())
        //     .xDomain(xextent(csv))
        //     .yDomain(csv.map(function(d) { return d.Location; }))
        //     .yOrient('left')
        //     .yPadding([0.5])
        //     .xTicks(6)
        //     .xTickFormat(d3.format('.0%'))
        //     .plotArea(series);


        d3.select('#underemployment-chart')
            .datum(csv)
            .call(chart);


    });



});
