function genTable(resp) {
    if (resp.code) {
        alert(resp.msg);
        return;
    }
    let option = resp.data;

    if (mail) {
        option.clickToSelect = true;
        option.columns.unshift({checkbox: true});
    }

    for (let item of option.data) {
        // 计算是否依然活跃
        let lastActiveTime = new Date(item.lastActiveTime.replace(/-/g, '/'));
        let now = new Date(
            (new Date()).getTime() + (new Date()).getTimezoneOffset() * 60000 +
            3600000 * 8);  // 东八区
        let maxT = new Date(item.maxT.replace(/-/g, '/'));
        if ((now - maxT) > (24 * 3600 * 1000)) {
            // 可能不在榜上了
            item.username += '<span class="badge badge-info">下榜</span>';
        } else if ((maxT - lastActiveTime) < (13 * 3600 * 1000)) {
            // 出征停止在 13 小时内
            item.username += '<span class="badge badge-warning">活跃</span>';
        } else {
            item.username += '<span class="badge badge-secondary">出征停止</span>';
        }
        // 计算是否是 new 或 老贼
        let firstTime = new Date(item.firstTime.replace(/-/g, '/'));
        let passedHours = (now - firstTime) / (1000 * 3600);
        if (passedHours < 24) {  // 24 小时内新上榜
            item.username += '<span class="badge badge-danger">new!</span>';
        } else if (passedHours >= 5 * 24) {  // 出现超过 5 天
            item.username += '<span class="badge badge-danger">老贼!</span>';
        }
        // slice
        item.maxT = item.maxT.slice(5, 16);
        item.minT = item.minT.slice(5, 16);

        item.lenT = item.lenT.toFixed(2);
    }
    $('#table').bootstrapTable(option);
}

$().ready(function() {
    mail = (Cookies.get('history').indexOf('AABBABAB') >= 0);
    console.log(mail);
    if (!mail) {
        $('#mail').hide();
    } else {
        $('#mail').show();
    }
    $.getJSON(
        'https://1596403937898061.cn-beijing.fc.aliyuncs.com/2016-08-15/proxy/zjsnr/query/?ranking=1',
        genTable);
});

$('#mail').click(function() {
    let selections = $('#table').bootstrapTable('getSelections');
    console.log(selections);
    console.log(selections.length);
    if (selections.length == 0) {
        return;
    }
    let mailUrl = 'mailto:cs@moefantasy.com?';
    mailUrl += 'subject=举报' + selections.length + '名用户疑似使用外挂&';
    let body = ''
    selections.forEach(item => {
        let para =
            '用户名: ' + item.username.replace(/<span.*\/span>/g, '') + '\n';
        para += '服务器: ' + item.serverName + '\n';
        para += 'UID: ' + item.uid + '\n';
        para += '该用户近' + Math.floor(item.lenT) + '日日均出征在' +
            Math.floor(item.speed / 100) * 100 + '次以上。\n\n';
        body += para;
    });
    mailUrl += 'body=' + body;
    mailUrl = encodeURI(mailUrl);
    window.location.href = mailUrl;
});
