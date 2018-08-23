$().ready(function() {
    $.getJSON(
        'https://1596403937898061.cn-shanghai.fc.aliyuncs.com/2016-08-15/proxy/zjsnr/query/?ranking=1',
        function(resp) {
            if (resp.code) {
                alert(resp.msg);
                return;
            }
            $('#table').bootstrapTable(resp.data);
        })
})