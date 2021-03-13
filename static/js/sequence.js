// Add click callback
$('.btn-outline-dark').click(function (event) {
    let btn = $(event.target);

    btn.siblings().each(function () {
        $(this).removeClass('active');
    });
    btn.addClass('active');

    recalc();
})

// global data
var sequenceData = {};

$(document).ready(function () {
    $.getJSON('static/resources/sequence.json', function (data) {
        sequenceData = data;
        recalc();
    });
});

function foreachGroup(fn) {
    for (let i = 0; i < 6; i++) {
        let group = $('#btn-group-' + (i + 1));
        fn(i, group);
    }
}

/**
 * Generate key from ranges, result starts from 0 and ignore empty ranges.
 */
function getKeyFromRanges(ranges) {
    // remove empty ranges
    ranges = ranges.filter((name) => { return name != '空'; });
    // map to int
    ranges = ranges.map((range) => {
        return {
            '超长': 4,
            '长': 3,
            '中': 2,
            '短': 1
        }[range];
    });

    // generate mapper
    // remove duplicates
    let keys = Array.from(new Set(ranges)).sort();
    let mapper = {};
    for (let index in keys) {
        mapper[keys[index]] = index;
    }

    // map (compress) ranges
    let mappedRanges = ranges.map((range) => mapper[range]);
    return mappedRanges.join('');
}

// Recalc ranking
function recalc() {
    let selections = [];
    foreachGroup(function (index, group) {
        let btn = group.children().filter('.active')[0];
        let text = $(btn).text().trim();
        selections.push(text);
    });

    // let length = selections.filter((range) => { return range != '空'; }).length;
    let indexes = Array.from(Array(6).keys()).filter(
        (index) => selections[index] != '空');
    let key = getKeyFromRanges(selections);
    console.log('Current key: ' + key);
    if (sequenceData.hasOwnProperty(key)) {
        updateSquence(indexes, sequenceData[key]);
    } else {
        alertNoSuchData();
    }

}

function alertNoSuchData() {
    foreachGroup(function (index, group) {
        let btn = group.children().filter(':disabled')[0];
        $(btn).removeClass('btn-success');
        $(btn).addClass('btn-danger');
        $(btn).text('?');
    });

    // 按照船只序号排序
    $('#shipIndex').text('()')

    // Alert
    $('#alert-msg').text('无此数据');
    let alertItem = $('.alert');
    alertItem.removeClass('alert-warning');
    alertItem.addClass('alert-danger');
    alertItem.fadeIn(200);
    setTimeout(() => alertItem.fadeOut(500), 2000);
}

function updateSquence(indexes, ans) {
    console.log('update sequence to ' + ans);
    let roundInfo = ans.split('');
    let counter = 0;
    foreachGroup(function (index, group) {
        let btn = group.children().filter(':disabled')[0];
        let text = '_'; // default, for empty shooting range
        if (indexes[counter] == index) {
            text = roundInfo[counter];
            counter++;
        }
        $(btn).removeClass('btn-danger');
        $(btn).addClass('btn-success');
        $(btn).text(text);
    });
    $('.alert').fadeOut(500);

    // 按照船只序号排序
    let len = ans.split(',').join('');
    let shipIndexes = new Array(len).fill(null);
    for (let shipIndex in roundInfo) {
        let round = roundInfo[shipIndex];
        shipIndexes[round - 1] = indexes[parseInt(shipIndex)] + 1;
    }
    console.log('按照船只序号排序: ' + shipIndexes);
    $('#shipIndex').text(shipIndexes.join(','));

}
