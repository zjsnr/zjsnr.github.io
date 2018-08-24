function convolution(data, kernal) {
    var kSize = kernal.length;
    var hkSize = Math.floor(kSize / 2);
    if (kSize % 2 != 1) {
        throw 'kernal.length should be an odd number!';
        }

    // padding 数组
    var _padding = Array.apply(null, Array(kSize)).map(() => 0.0);

    // data padded
    var padded = _padding.concat(data.map(item => item[1]), _padding);

    // 权重数组
    var rights = _padding.concat(
        Array.apply(null, Array(data.length)).map(() => 1.0), _padding);

    var result = [];
    for (var index = 0; index < data.length; index++) {
        var sum = 0.0;
        var rightsSum = 0.0;
        for (var pos = 0; pos < kSize; pos++) {
            sum += kernal[pos] * padded[index + pos + hkSize + 1];
            rightsSum += kernal[pos] * rights[index + pos + hkSize + 1];
        }
        result.push([data[index][0], sum / rightsSum]);
        }
    return result;
}

Date.prototype.format = function(format) {
    /*
    * 使用例子:format="yyyy-MM-dd hh:mm:ss";
    */
    var o = {
        'M+': this.getMonth() + 1,                    // month
        'd+': this.getDate(),                         // day
        'h+': this.getHours(),                        // hour
        'm+': this.getMinutes(),                      // minute
        's+': this.getSeconds(),                      // second
        'q+': Math.floor((this.getMonth() + 3) / 3),  // quarter
        'S': this.getMilliseconds()
        // millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(
            RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }

    for (var k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ?
                    o[k] :
                    ('00' + o[k]).substr(('' + o[k]).length));
        }
        }
    return format;
}

var myChart = null;

$('#queryButton').click(function() {
    var url =
        'https://1596403937898061.cn-beijing.fc.aliyuncs.com/2016-08-15/proxy/zjsnr/query/'
    url += '?name=' + encodeURIComponent($('#queryInput').val());
    $.getJSON(url, function(response) {
        if (response.code != 0) {
            alert(response.msg);
            return;
            }
        var data = response.data;
        // 分离数据、计算实时速度
        var pveNum = [];
        var pveSpeed = [];
        for (index in data) {
            pveNum.push([new Date(data[index].dt), data[index].pve]);
            if (index > 0) {
                var now = new Date(data[index].dt);
                var last = new Date(data[index - 1].dt);
                var duration =
                    (now.getTime() - last.getTime()) / (24 * 3600 * 1000);
                pveSpeed.push([
                    new Date((now.getTime() + last.getTime()) / 2),
                    (data[index].pve - data[index - 1].pve) / duration
                ]);
            }
        }
        // 速度加一个卷积，平滑一下
        pveSpeed = convolution(
            pveSpeed, [0.1, 0.2, 0.3, 0.5, 0.8, 0.5, 0.3, 0.2, 0.1]);

        if (!myChart) {
            myChart = echarts.init($('#chartContainer').get(0));
        }

        myChart.setOption({
            textStyle: {fontSize: 18},
            title: {
                text: '用户名: ' + response.username + '  UID: ' + response.uid,
                x: 'center',
                left: 'center',
            },
            grid: {bottom: '12%', left: '14%'},
            tooltip: {
                trigger: 'axis',
                axisPointer: {type: 'cross'},
                formatter: function(params) {
                    var item = params[0];
                    var result = item.data[0].format('yyyy-MM-dd hh:mm:ss') +
                        '</br>' + item.seriesName + ': ' +
                        item.data[1].toFixed(0);
                    result = '<font color="' + item.color + '">' + result +
                        '</font>';
                    return result
                },
                backgroundColor: 'rgba(50, 50, 50, 0.2)'
            },
            legend: {margin: 25, top: 25, data: ['出征', '出征速度']},
            xAxis: {
                type: 'time',
                axisPointer: {
                    label: {
                        formatter: function(params) {
                            return params.seriesData[0].data[0].format('yy-MM-dd\nhh:mm:ss');
                        }
                    }
                }
            },
            yAxis: [
                {name: '出征', type: 'value', scale: true, padding: 10},
                {name: '出征/天', type: 'value', smooth: true}
            ],
            dataZoom: [{
                id: 'dataZoomX',
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter',
            }],
            series: [
                {
                  name: '出征',
                  type: 'line',
                  yAxisIndex: 0,
                  data: pveNum,
                  itemStyle: {
                      normal: {
                          color: '#0099CC',  //圈圈的颜色
                          lineStyle: {
                              color: '#0099CC'  //线的颜色
                          }
                      }
                  }
                },
                {
                  name: '出征速度',
                  type: 'line',
                  yAxisIndex: 1,
                  data: pveSpeed,
                  itemStyle: {
                      normal: {
                          color: '#FF6666',  //圈圈的颜色
                          lineStyle: {
                              color: '#FF6666'  //线的颜色
                          }
                      }
                  }
                }
            ]
        });
        window.onresize = myChart.resize;
    });
});
$('#queryInput').keypress(function(e) {
    if (e.keyCode == 13) {
        $('#queryButton').click();
    }
})