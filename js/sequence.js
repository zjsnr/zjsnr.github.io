// Add click callback
$('.btn-outline-dark').click(function (event) {
    EV = event;
    let btn = $(event.target);
    for (let sibling of btn.siblings()) {
        $(sibling).removeClass('active');
    }
    btn.addClass('active');
    recalc();
})

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
    $('#alert-msg').text('无此数据');
    let alertItem = $('.alert');
    alertItem.removeClass('alert-warning');
    alertItem.addClass('alert-danger');
    // alertItem.show();
    alertItem.fadeIn(200);
    setTimeout(function () {
        alertItem.fadeOut(500);
    }, 2000);
}

function updateSquence(ans) {
    console.log('update sequence to ' + ans);
    let ranking = ans.split(',');
    foreachGroup(function (index, group) {
        let btn = group.children().filter(':disabled')[0];
        let text = ranking[index];
        $(btn).removeClass('btn-danger');
        $(btn).addClass('btn-success');
        $(btn).text(text == '' ? '_' : text);
    });
    $('.alert').fadeOut(500);
}
