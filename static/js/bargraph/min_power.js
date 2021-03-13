﻿const config = {
  // 数据源的编码方式。
  // 默认为GBK,按需可修改为UTF-8等。
  // 如果输入的数据是用Excel编写的csv文件，那么大概率应该使用GBK。
  encoding: "utf8",

  // 每个时间节点最多显示的条目数。
  max_number: 30,

  // 控制是否显示顶部附加信息文字。
  showMessage: false,

  // !!!请确保打开此项时，使用的是标准日期格式！!!(即：YYYY-MM-DD HH:MM)
  // 时间自动排序。
  // 如果关闭，排序顺序为csv表格的时间字段自上而下的出现顺序。
  // 如果你的日期格式为标准的日期格式，则可以无视数据排序，达到自动按照日期顺序排序的效果。
  // 开启auto_sort可以实现时间的自动补间。
  auto_sort: false,
  timeFormat: "%Y-%m-%d",

  // 倒序，使得最短的条位于最上方
  reverse: false,

  // 颜色根据什么字段区分？
  divide_by: 'type',

  // 字段的值与其对应的颜色值
  color: {
    'iOS': '#d62728',
    'Andriod': '#2ca02c'
  },

  // 颜色绑定增长率
  changeable_color: false,

  // 附加信息内容。
  itemLabel: "守门员实力最高",
  typeLabel: "类型",
  // 榜首项目信息的水平位置 。
  item_x: 400,

  // 时间点间隔时间。
  interval_time: 0.5,

  // 上方文字水平高度。
  text_y: -50,

  // 右侧文字横坐标
  text_x: 700,
  // 偏移量
  offset: 150,

  // 长度小于display_barInfo的bar将不显示barInfo。
  display_barInfo: 200,

  // 使用计数器
  // 注意！使用计时器和使用类型目前不能兼容，即不能同时开启！
  // 计数器会出现在右上角，记录着当前榜首的持续时间。
  use_counter: false,
  // 每个时间节点对于计数器的步长。
  // 比如时间节点日期的间隔可能为1周（七天），那么step的值就应该为7。
  step: 7,

  // 格式化数值
  // 这里控制着数值的显示位数。主要靠修改中间的数字完成，如果为1则为保留一位小数。
  format: ".0f",

  // 图表左右上下间距。
  left_margin: 200,
  right_margin: 150,
  top_margin: 150,
  bottom_margin: 0,

  // 时间标签坐标。
  dateLabel_x: 1440,
  dateLabel_y: 750,

  // 允许大于平均值的条消失时上浮。
  allow_up: false,

  // 设置动画效果，如果为true，则新进入的条目从0开始。
  enter_from_0: false,

  // 如果所有数字都很大，导致拉不开差距则开启此项使得坐标原点变换为（最小值）*2-（最大值）
  big_value: false,

  // 如果要使用半对数坐标，则开启此项
  use_semilogarithmic_coordinate: false,

  // barinfo太长？也许可以试试这个
  long: false,

  // 延迟多少个时间节点开始
  wait: 2

};

$(document).ready(function () {
  let plot = $('#plot');
  plot.attr('width', plot.width());
  plot.attr('height', plot.height());
  console.log('Set plot size: ' + plot.width() + ', ' + plot.height());
  $.ajax({
    url: 'static/resources/min_power.csv',
    type: 'GET',
    success: (r) => draw(d3.csvParse(r))
  });
});
