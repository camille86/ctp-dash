$(document).ready(function() {

    var key = '1icln5UH_PknOUcvVenErNrjAR7MDoixmX733iq4NSHE';

    Tabletop.init({
        key: key,
        callback: showInfo,
        simpleSheet: true
    });


    function showInfo(data) {

        // data.forEach(function(d) {
        //     d.current_val = +d.current_val;
        //     d.prev_val = d.prev_val ? +d.prev_val : '';
        //     d.prev_year = d.prev_year ? d.prev_year : '';
        // });

        // bind data to make grid items
        var cards = d3.select('.grid')
            .selectAll('.grid-item')
            .data(data)
            .enter();

        cards.append('div')
            // .classed('grid-item', true)
            .attr('class', function(d) { return 'grid-item col-md-3 ' + d.class; })
            .html(render);





        $('.grid').isotope({
            itemSelector: '.grid-item',
            percentPosition: true,
            masonry: {
                columnWidth: '.grid-sizer'
            }
        });

        $('.grid-item').on('click', function(e) {
            // $(this).toggleClass('big');
            $('.grid-item').not(this).removeClass('big');
            // $('.descript-text').addClass('hidden');
            // $('.descript-text').css('visibility', 'hidden');
            $(this).toggleClass('big');
            // $(this).find('.descript-text').toggleClass('hidden');
            // $(this).find('.descript-text').css('visibility', 'visible');

            $('.grid').isotope();
        }).on('click', 'a', function(e) {
            e.stopPropagation();
        });
    }


});



function makeFormat(format, number) {
    var percent = d3.format('.0%');
    var thousand = d3.format(',.0f');
    var dollar = d3.format('$,.0f');

    switch (format) {
        case 'percent': return percent(number);
        case 'thousand': return thousand(number);
        case 'dollar': return dollar(number);
        default: return '';
    }
}

function render(d, i) {
    var template = Handlebars.compile(d3.select('#card-template').html());
    var card = d;
    card.current_val = makeFormat(d.format, +d.current_val);
    card.prev_val = d.prev_val.length ? makeFormat(d.format, +d.prev_val) : '';
    card.area = '<a class="area" href="/pages/' + d.class + '.html">' + d.area + '</a>';
    card.arrow = '<span class="glyphicon glyphicon-arrow-' + d.arrow + '"></span>';
    console.log(card);

    return template(card);
}
