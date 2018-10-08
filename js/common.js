$('#mail-A').click(function() {
    console.log(Cookies.get('history') + '->');
    Cookies.set('history', "" + Cookies.get('history') + 'A');
    console.log(Cookies.get('history'));
});
$('#mail-B').click(function() {
    console.log(Cookies.get('history') + '->');
    Cookies.set('history', "" + Cookies.get('history') + 'B');
    console.log(Cookies.get('history'));
});
