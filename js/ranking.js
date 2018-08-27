$().ready(function() {
    $.getJSON(
        'https://1596403937898061.cn-beijing.fc.aliyuncs.com/2016-08-15/proxy/zjsnr/query/?ranking=1',
        function(resp) {
            if (resp.code) {
                alert(resp.msg);
                return;
            }
            var option = resp.data;
            option.pageSize = 10;
            for (let item of option.data) {
                item.ranking = '<a href="mailto:cs@moefantasy.com?' + 
                'subject=举报' + item.serverName + '服用户 ' + item.username + ' 疑似使用外挂&' +
                'body=服务器:' +item.serverName + '%0d%0aUID:' + item.uid + '%0d%0a用户名:' + item.username +
                '%0d%0a%0d%0a通过查询狗牌，该用户最近每天出征在'+ Math.floor(item.speed / 100) * 100 +'次以上，有使用外挂嫌疑。' + 
                '希望幻萌可以查一下，如果是外挂请进行处理。%0d%0a%0d%0a祝好。%0d%0a%0d%0a">' + item.ranking + '</a>';
            }
            $('#table').bootstrapTable(option);
        })
})
