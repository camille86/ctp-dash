function dotOver(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .attr('r', 7);
}

function dotOut(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .attr('r', 4);
}

function barOver(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .style('stroke-width', 4);
}

function barOut(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .style('stroke-width', 1);
}

function barTip(d) {
    return '<span>' + d.y + ': ' + d3.format('.0%')(d.xValue) + '</span>';
}

function colGroupTip(d) {
    return '<span>' + d.cx + ', ' + d.aggField[0] + ': ' + d3.format('.0%')(d.yValue) + '</span>';
}

function lineTip(d) {
    return '<span>' + d3.timeFormat('%Y')(d.x) + ': ' + d3.format('.0%')(d.yValue) + '</span>';
}

function lineTip2(d) {
    var name = d.aggField[0] === 'All' ? 'Goal' : d.aggField[0];
    return '<span>' + name + ', ' + d3.timeFormat('%Y')(d.x) + ': ' + d3.format('.1%')(d.yValue) + '</span>';
}

function pieTip(d) {
    return '<span>' + d.aggField[0] + ': ' + d3.format(',')(d.pValue) + '</span>';
}

function lineTipNhv(d) {
    return '<span>New Haven, ' + d3.timeFormat('%Y')(d.x) + ': ' + d3.format('.0%')(d.yValue) + '</span>';
}
