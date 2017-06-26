// hover effects
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

function redrawDots() {
    d3.selectAll('.dimple-marker')
        .attr('r', 4)
        .attr('fill', function(d) { return d3.select(this).attr('stroke'); })
        .style('stroke-width', 4);
}

// convenience functions
function p(x) { return d3.format('.2p')(x); }

function yr(x) { return d3.timeFormat('%Y')(x); }

function span(x) { return '<span>' + x + '</span>'; }

// html generators to send to d3-tip.html()

function horizTip(d) {
    return span( d.y + ': ' + p(d.xValue) );
}

function horizTip2(d) {
    return span( d.y + ': ' + d.xValue );
}

function vertTip(d) {
    return span( d.x + ': ' + p(d.yValue) );
}

function horizGroupTip(d) {
    return span( d.cy + ', ' + d.aggField[0] + ': ' + p(d.xValue) );
}

function vertGroupTip(d) {
    return span( d.cx + ', ' + d.aggField[0] + ': ' + p(d.yValue) );
}

function trendTip(d) {
    return span( yr(d.x) + ': ' + p(d.yValue) );
}

function trendGroupTip(d) {
    var name = d.aggField[0] === 'All' ? 'Goal' : d.aggField[0];
    return span( name + ', ' + yr(d.x) + ': ' + p(d.yValue) );
}

function trendTipThous(d) {
    return span( yr(d.x) + ': ' + d3.format(',')(d.yValue) );
}

function pieTip(d) {
    return span( d.aggField[0] + ': ' + d3.format(',')(d.pValue) );
}


// dimple color objects
var pink = new dimple.color('#992156');
var ltblue = new dimple.color('#739DD0');
var dkblue = new dimple.color('#2f588b');
var green = new dimple.color('#359957');

var scale5 = [
    new dimple.color('#b92868'),
    new dimple.color('#b04f86'),
    new dimple.color('#a16ba4'),
    new dimple.color('#8984c5'),
    new dimple.color('#5d9be6'),
    new dimple.color('#555')
];

var scale3 = [
    new dimple.color('#b92868'),
    new dimple.color('#a16ba4'),
    new dimple.color('#5d9be6'),
    new dimple.color('#555')
];

var demoscale = [
    new dimple.color('#992156'),
    new dimple.color('#9d526c'),
    new dimple.color('#9e7682'),
    new dimple.color('#2f588b'),
    new dimple.color('#50678f'),
    new dimple.color('#6a7792'),
    new dimple.color('#818896'),
    new dimple.color('#359957'),
    new dimple.color('#5e9a6d'),
    new dimple.color('#7d9a83')
];

var choroscale = ['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156'];
