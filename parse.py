import json
import xlrd

data = {}

# Xls: https://bbs.nga.cn/read.php?tid=17127421
workbook = xlrd.open_workbook('炮序.xls')

# 三射程、二射程
for name in ('三射程', '二射程', '缺船炮序'):
    table = workbook.sheet_by_name(name)
    for i in range(1, table.nrows):  # skip header
        row = table.row_values(i)
        key = ','.join(row[0:6])
        value = ','.join(
            str(int(item)) if item else ''
            for item in row[6:12])
        if key == (',' * 5):
            continue
        if key in data:
            raise RuntimeError(f'key {key} in data.')
        data[key] = value

with open('sequence.json', 'w', encoding='utf8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
