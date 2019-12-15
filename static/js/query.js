Date.prototype.format = function (format) {
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
    };

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
};

Date.prototype.diff = function (t) {
    return Math.abs(this.getTime() - t.getTime()) / (24 * 3600 * 1000);
};

function smooth(array, sigma, val, dt) {
    var w = function (t) {
        if (sigma == 0) {
            return t < 0.001 ? 1 : 0;
        }
        return Math.exp(-t * t / sigma);
    }
    var result = [];
    for (var index = 0; index < array.length; index++) {
        var t = array[index].t;
        var sum1 = 0.0;
        var sum2 = 0.0;
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            sum1 += w(item.t.diff(t)) * val(item);
            sum2 += w(item.t.diff(t)) * dt(item);
        }
        result.push([t, sum1 / sum2]);
    }
    return result;
};

function calcPveData(rawPveData, sigma) {
    var res = smooth(rawPveData, sigma, (item) => item.pve, (item) => 1.0);
    return res;
};

function calcSpeed(rawSpeedData, sigma) {
    // speed = int(w(t) * dPve(t)) dt / int(w(t) * dT(t)) dt
    return smooth(rawSpeedData, sigma, (item) => item.dPve, (item) => item.dT);
};

var myChart = null;
var rawSpeedData = null;
var rawPveData = null;


function saveState(name) {
    history.pushState({ name: name }, "幺明寺 - " + name, "/index?name=" + name);
}

// back button
window.onpopstate = function (e) {
    let name = e.state.name;
    console.log("pop state: ", name);
    $('#queryInput').val(name);
    getDataAndPlot(name);
}

// Init: Get name from url and plot
$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get("name");
    if (name) {
        console.log("Get param from url: ", name);
        $('#queryInput').val(name);
        saveState(name);
        getDataAndPlot(name);
    }
});

function onData(response) {
    if (!response.success) {
        alert(response.msg);
        return;
    }
    var data = response.data.pveData;
    for (item of data) {
        item.dt = new Date(item.ts * 1000);
    }
    // 分离数据、计算实时速度
    rawPveData = [];
    rawSpeedData = [];
    for (index in data) {
        rawPveData.push({
            t: data[index].dt,
            pve: data[index].pve
        });
        if (index > 0) {
            var now = data[index].dt;
            var last = data[index - 1].dt;
            rawSpeedData.push({
                t: new Date((now.getTime() + last.getTime()) / 2),
                dPve: data[index].pve - data[index - 1].pve,
                dT: now.diff(last),
                speed:
                    (data[index].pve - data[index - 1].pve) / now.diff(last)
            });
        }
    }
    var speedData = calcSpeed(rawSpeedData, $('#sigmaRange').val());
    var pveData = calcPveData(rawPveData,
        $("#smoothPve").prop("checked") ?
            1 : 0.0);
    // 作图
    if (!myChart) {
        myChart = echarts.init($('#chartContainer').get(0));
    }

    $("#smoothOption").show();

    myChart.setOption({
        textStyle: { fontSize: 18 },
        title: {
            text: '用户名: ' + response.data.username + '  UID: ' + response.data.uid,
            x: 'center',
            left: 'center',
        },
        grid: { bottom: '12%', left: '14%' },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: function (params) {
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
        legend: { margin: 25, top: 25, data: ['出征', '出征速度'] },
        xAxis: {
            type: 'time',
            axisPointer: {
                label: {
                    formatter: function (params) {
                        return params.seriesData[0].data[0].format(
                            'yy-MM-dd\nhh:mm:ss');
                    }
                }
            }
        },
        yAxis: [
            { name: '出征', type: 'value', scale: true, padding: 10 },
            { name: '出征/天', type: 'value', smooth: true }
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
                data: pveData,
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
                data: speedData,
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
}

function getDataAndPlot(name) {
    const url = 'https://1596403937898061.cn-beijing.fc.aliyuncs.com/2016-08-15/proxy/zjsnr/v2/pve/' + name
    // get data and plot
    $.ajax({
        url: url,
        dataType: 'json',
        success: onData,
        error: function (data) {
            alert(data.responseJSON.msg);
        }
    });
}

// bind query button click
$('#queryButton').click(function () {
    let name = $('#queryInput').val();
    saveState(name);
    getDataAndPlot(name);
});
// bind enter key
$('#queryInput').keypress(function (e) {
    if (e.keyCode == 13) {
        $('#queryButton').click();
    }
});

// update without data changing
function replot() {
    if (rawSpeedData) {
        myChart.setOption({
            series: [
                {
                    yAxisIndex: 0, data: calcPveData(rawPveData,
                        $("#smoothPve").prop("checked") ?
                            1 : 0.0)
                },
                { yAxisIndex: 1, data: calcSpeed(rawSpeedData, $('#sigmaRange').val()) }
            ]
        });
    }
}

$('#sigmaRange').on('input propertychange', replot);

$("#smoothPve").change(replot);
