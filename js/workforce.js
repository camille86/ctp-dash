$(document).ready(function() {

    d3.csv('../data/underemployment.csv', function(csv) {
        console.log(csv);
        csv.forEach(function(d) {
            d.Underemployment = +d.Underemployment;
        });

        var yExtent = fc.extentLinear()
            .include([0])
            .pad([0, 0.1])
            .accessors([function(d) { return d.Underemployment; }]);

        var chart = fc.chartSvgCartesian(d3.scalePoint(), d3.scaleLinear())
            // .xDomain(['Connecticut', 'Greater New Haven', 'New Haven', 'NHV low-income neighborhoods', 'Other NHV neighborhoods'])
            .xDomain(csv.map(function(d) { return d.Location; }))
            .xPadding(0.5)
            .yDomain(yExtent(csv))
            .yTicks(6)
            .yNice()
            .yTickFormat(d3.format('.0%'))
            .chartLabel('Underemployment rate by location');

        var series = fc.seriesSvgBar()
            .crossValue(function(d) { return d.Location; })
            .mainValue(function(d) { return d.Underemployment; });

        chart.plotArea(series);

        d3.select('#underemployment-chart')
            .datum(csv)
            .call(chart);
    });



});
