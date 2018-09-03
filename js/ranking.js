var mail = false;
$('#mail').hide();

function genTable(resp) {
    if (resp.code) {
        alert(resp.msg);
        return;
    }
    let option = resp.data;

    mail = resp.mail || mail;
    if (mail) {
        option.clickToSelect = true;
        option.columns.unshift({checkbox: true});
        $('#mail').show();
    }
    
    for (let item of option.data) {
        // 计算是否依然活跃
        let lastActiveTime = new Date(item.lastActiveTime.replace(/-/g, "/"));
        let now = new Date(
            (new Date()).getTime() + (new Date()).getTimezoneOffset() * 60000 +
            3600000 * 8);  // 东八区
        let maxT = new Date(item.maxT.replace(/-/g, "/"));
        if ((now - maxT) > (9 * 3600 * 1000)) {  // 可能不在榜上了
            item.username += '<span class="badge badge-info">下榜</span>';
        } else if ((maxT - lastActiveTime) < (1000 * 3600 * 4)) {  // 出征停止在
            // 4 小时内
            item.username += '<span class="badge badge-warning">活跃</span>';
        } else {
            item.username +=
                '<span class="badge badge-secondary">出征停止</span>';
        }
        // 计算是否是 new 或 老贼
        let firstTime = new Date(item.firstTime.replace(/-/g, "/"));
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
    $.getJSON(
        'https://1596403937898061.cn-beijing.fc.aliyuncs.com/2016-08-15/proxy/zjsnr/query/?ranking=1',
        genTable);
});

$('#mail').click(function() {
    let selections = $("#table").bootstrapTable("getSelections");
    console.log(selections);
    console.log(selections.length);
    if (selections.length == 0) {
        return;
    }
    let mailUrl = "mailto:cs@moefantasy.com?";
    mailUrl += 'subject=举报' + selections.length + '名用户疑似使用外挂&';
    let body = ''
    selections.forEach(item => {
        let para = '用户名: ' + item.username.replace(/<span.*\/span>/g,"") + '\n';
        para += '服务器: ' + item.serverName + '\n';
        para += 'UID: ' + item.uid + '\n';
        para += '说明: 通过查询狗牌，该用户最近' + Math.floor(item.lenT) + 
            '天内，每天平均出征在' + Math.floor(item.speed / 100) * 100 + '次以上，有使用外挂嫌疑。\n\n';
        body += para;
    });
    mailUrl += 'body=' + body;
    mailUrl = encodeURI(mailUrl);
    window.location.href = mailUrl;
});
