import json
import xlrd
from collections import Counter

data = {}

# Xls: https://bbs.nga.cn/read.php?tid=17127421
workbook = xlrd.open_workbook('../data/shootingRank.xls')

# 三射程、二射程
for name in ('三射程', '二射程', '缺船炮序'):
    table = workbook.sheet_by_name(name)
    for i in range(1, table.nrows):  # skip header
        row = table.row_values(i)

        shootingRange = row[0:6]
        shipIndexes = [(int(item) if item else 0) for item in row[6:12]]
        shipRankings = [0 for _ in range(6)]

        counter = Counter(shipIndexes)
        for index in range(1, max(shipIndexes) + 1):
            if counter[index] != 1:
                print(counter)
                raise RuntimeError(f'False data: Shooting range {shootingRange}, shipIndexes {shipIndexes}')

        # Adjust from shipIndexes to shipRankings
        for round, shipIndex in enumerate(shipIndexes):
            if shipIndex == 0:
                break
            shipRankings[shipIndex - 1] = round + 1

        key = ','.join(shootingRange)
        value = ','.join((str(item) if item else '') for item in shipRankings)

        if key == (',' * 5):  # empty line
            continue
        if key in data:
            raise RuntimeError(f'Duplicate key {key}.')
        data[key] = value

with open('../resources/sequence.json', 'w', encoding='utf8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
