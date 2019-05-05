import json
import xlrd
from collections import Counter

data = {}

# Xls: https://bbs.nga.cn/read.php?tid=17127421
workbook = xlrd.open_workbook('../data/shootingRank.xls')


def verify(shootingRanges, shipIndexes):
    # Each index should be counted once and only once.
    counter = Counter(shipIndexes)
    for index in range(1, max(shipIndexes) + 1):
        if counter[index] != 1:
            raise RuntimeError(
                f'False data: Shooting range {shootingRanges}, shipIndexes {shipIndexes}')

    # assert range descends
    DEFAULT_RANGE = 5
    rangeDict = {
        '超长': 4,
        '长': 3,
        '短': 1,
    }
    lastRange = DEFAULT_RANGE
    for shipIndex in shipIndexes:
        if shipIndex == 0:
            continue
        _range = shootingRanges[shipIndex - 1]
        curRange = rangeDict.get(_range, DEFAULT_RANGE)
        if curRange > lastRange:
            raise RuntimeError(
                f'False data: Shooting range {shootingRanges}, shipIndexes {shipIndexes}')
        lastRange = curRange


# 三射程、二射程
for name in ('三射程', '二射程', '缺船炮序'):
    table = workbook.sheet_by_name(name)
    for i in range(1, table.nrows):  # skip header
        row = table.row_values(i)

        shootingRanges = row[0:6]
        shipIndexes = [(int(item) if item else 0) for item in row[6:12]]
        shipRankings = [0 for _ in range(6)]

        # verify data
        verify(shootingRanges, shipIndexes)

        # Adjust from shipIndexes to shipRankings
        for round, shipIndex in enumerate(shipIndexes):
            if shipIndex == 0:
                break
            shipRankings[shipIndex - 1] = round + 1

        key = ','.join(shootingRanges)
        value = ','.join((str(item) if item else '') for item in shipRankings)

        if key == (',' * 5):  # empty line
            continue
        if key in data:
            raise RuntimeError(f'Duplicate key {key}.')
        data[key] = value

with open('../resources/sequence.json', 'w', encoding='utf8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
