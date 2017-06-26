// $(document).ready(function() {

    var key = '1icln5UH_PknOUcvVenErNrjAR7MDoixmX733iq4NSHE';

    Tabletop.init({
        key: key,
        callback: showInfo,
        simpleSheet: false,
        wanted: ['data', 'sources']
    });

// });

function showInfo(data, tabletop) {
    var cardData = tabletop.sheets('data').all();
    var sourceData = tabletop.sheets('sources').all().sort(function(a, b) {
        return a.name < b.name ? -1 : 1;
    });
    makeCards(cardData);
    makeSources(sourceData);
}

function makeCards(data) {
    var cards = d3.select('.grid')
        .selectAll('.grid-item')
        .data(data)
        .enter();

    cards.append('div')
        // .classed('grid-item', true)
        .attr('class', function(d) { return 'grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3 ' + d.class; })
        .html(renderCard);

    $('.spinner div').removeClass('lds-default');

    setupIsotope();
}

function makeSources(data) {
    // probably not worth it to use Handlebars template since these are so small
    d3.select('#source-list')
        .selectAll('li')
        .data(data)
        .enter()
        .append('li')
        .append('a')
        .attr('href', function(d) { return d.url; })
        .text(function(d) { return d.name; });
}

function setupIsotope() {
    var $grid = $('.grid');
    $grid.isotope({
        itemSelector: '.grid-item',
        percentPosition: true,
        masonry: {
            columnWidth: '.grid-sizer'
        }
    });

    $('.grid-item').on('click', function(e) {
        // $(this).toggleClass('big');
        $('.grid-item').not(this).removeClass('big');
        $(this).toggleClass('big');
        $('.grid-item .show-more').text('+');
        $('.big').find('.show-more').text('-');

        // redraw
        $grid.isotope('layout');
    }).on('click', 'a.area', function(e) {
        e.stopPropagation();
    }).on('mouseover', function(e) {
        $(this).find('.learn-more').removeClass('hidden');
    }).on('mouseout', function(e) {
        $(this).find('.learn-more').addClass('hidden');
    });

    var $filters = $('#filters');
    $filters.on('click', '.btn', function(e) {
        e.preventDefault();

        $('.grid-item').removeClass('big');

        var filterVal = $(this).data('filter');
        $grid.isotope({ filter: filterVal });
        $filters.find('.active').removeClass('active');
        $(this).addClass('active');

    });

}



function makeFormat(format, number) {
    var percent = d3.format('.0%');
    var thousand = d3.format(',.0f');
    var dollar = d3.format('$,.0f');

    switch (format) {
        case 'percent': return percent(+number);
        case 'thousand': return thousand(+number);
        case 'dollar': return dollar(+number);
        case 'text': return number;
        default: return '';
        // default: return number;
    }
}

function renderCard(d, i) {
    var template = Handlebars.compile(d3.select('#card-template').html());
    var card = d;
    card.current_val = makeFormat(d.format, d.current_val);
    card.prev_val = d.prev_val.length ? makeFormat(d.format, d.prev_val) : '';
    // card.hasLink = card.class === 'cross' ? false : true;
    card.hasLink = true;
    // card.area = '<a class="area" href="pages/' + d.class + '.html"><span class="hidden learn-more">Learn more about </span>' + d.area + '</a>';
    // card.arrow = '<span class="glyphicon glyphicon-arrow-' + d.arrow + '"></span>';

    return template(card);
}
