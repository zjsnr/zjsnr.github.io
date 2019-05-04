// Add click callback
$('.btn-outline-dark').click(function (event) {
    let btn = $(event.target);

    btn.siblings().each(function () {
        $(this).removeClass('active');
    })
    btn.addClass('active');

    recalc();
})

// global data
var sequenceData = {};

$(document).ready(function () {
    $.getJSON('resources/sequence.json', function (data) {
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

// Recalc ranking
function recalc() {
    let selections = [];
    foreachGroup(function (index, group) {
        let btn = group.children().filter('.active')[0];
        let text = $(btn).text().trim();
        text = text == '空' ? '' : text;

        selections.push(text);
    });
    let key = selections.join(',');
    console.log(key);
    if (sequenceData.hasOwnProperty(key)) {
        updateSquence(sequenceData[key]);
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

function updateSquence(ans) {
    console.log('update sequence to ' + ans);
    let roundInfo = ans.split(',');
    foreachGroup(function (index, group) {
        let btn = group.children().filter(':disabled')[0];
        let text = roundInfo[index];
        $(btn).removeClass('btn-danger');
        $(btn).addClass('btn-success');
        $(btn).text(text || '_');
    });
    $('.alert').fadeOut(500);

    // 按照船只序号排序
    let len = ans.split(',').join('');
    let shipIndexes = new Array(len).fill(null);
    for (let shipIndex in roundInfo) {
        let round = roundInfo[shipIndex];
        shipIndexes[round - 1] = parseInt(shipIndex) + 1;
    }
    console.log('按照船只序号排序: ' + shipIndexes);
    $('#shipIndex').text(shipIndexes.join(','));

}
