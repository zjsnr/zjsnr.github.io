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

        shootingRange = row[0:6]
        shipIndexes = [(int(item) if item else 0) for item in row[6:12]]
        shipRanking = [0 for _ in range(6)]
        for round, shipIndex in enumerate(shipIndexes):
            if shipIndex == 0:
                break
            shipRanking[shipIndex - 1] = round + 1

        key = ','.join(shootingRange)
        value = ','.join((str(item) if item else '') for item in shipRanking)

        if key == (',' * 5): # empty line
            continue
        if key in data:
            raise RuntimeError(f'key {key} in data.')
        data[key] = value

with open('resources/sequence.json', 'w', encoding='utf8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
