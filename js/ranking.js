$().ready(function() {
    $.getJSON(
        'https://1596403937898061.cn-beijing.fc.aliyuncs.com/2016-08-15/proxy/zjsnr/query/?ranking=1',
        function(resp) {
            if (resp.code) {
                alert(resp.msg);
                return;
            }
            let option = resp.data;
            console.log(option);
            for (let item of option.data) {
                // 发送邮件
                // item.ranking = '<a href="mailto:cs@moefantasy.com?' + 
                //     'subject=举报' + item.serverName + '服用户 ' + item.username + ' 疑似使用外挂&' +
                //     'body=服务器:' +item.serverName + '%0d%0aUID:' + item.uid + '%0d%0a用户名:' + item.username +
                //     '%0d%0a%0d%0a通过查询狗牌，该用户最近每天出征在'+ Math.floor(item.speed / 100) * 100 +'次以上，有使用外挂嫌疑。' + 
                //     '希望幻萌可以查一下，如果是外挂请进行处理。%0d%0a%0d%0a祝好。%0d%0a%0d%0a">' + item.ranking + '</a>';
                // 计算是否依然活跃
                let lastActiveTime = new Date(item.lastActiveTime);
                let now = new Date(Date.now());
                let maxT = new Date(now.getFullYear() + '-' + item.maxT);
                if ((now - maxT) > (9 * 3600 * 1000)) { // 可能不在榜上了
                    item.username += '<span class="badge badge-info">下榜</span>'
                } else if ((maxT - lastActiveTime) < (1000 * 3600 * 4)) { // 出征停止在 4 小时内
                    item.username += '<span class="badge badge-warning">活跃</span>'
                } else {
                    item.username += '<span class="badge badge-secondary">出征停止</span>'
                }
                // 计算是否是 new 或 老贼
                let firstTime = new Date(item.firstTime);
                let passedHours = (now - firstTime) / (1000 * 3600);
                if (passedHours < 24) { // 24 小时内新上榜
                    item.username += '<span class="badge badge-danger">new!</span>';
                } else if (passedHours >= 5 * 24) { // 出现超过 5 天
                    item.username += '<span class="badge badge-danger">老贼!</span>';
                }
            }
            $('#table').bootstrapTable(option);
        })
})
