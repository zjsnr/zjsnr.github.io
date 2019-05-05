import json
import xlrd
from collections import Counter

data = {}

# Xls: https://bbs.nga.cn/read.php?tid=17127421
workbook = xlrd.open_workbook('../data/shootingRank.xls')


def verify(shootingRanges, shipIndexes):
    try:
        # Each index should be counted once and only once.
        counter = Counter(shipIndexes)
        for index in range(1, max(shipIndexes) + 1):
            if counter[index] != 1:
                raise RuntimeError

        # assert range descends
        DEFAULT_RANGE = 5
        lastRange = DEFAULT_RANGE
        for shipIndex in shipIndexes:
            curRange = shootingRanges[shipIndex - 1]
            if curRange > lastRange:
                raise RuntimeError
            lastRange = curRange

    except Exception as ex:
        raise RuntimeError(
            f'False data: Shooting range {shootingRanges}, shipIndexes {shipIndexes}') from ex


def range2Int(rangeName):
    return {
        '超长': 4,
        '长': 3,
        '中': 2,
        '短': 1,
        '': 0
    }[rangeName]


def compressRanges(ranges):
    keys = sorted(set(ranges))  # remove duplicates, sort
    mapDict = {key: index for index, key in enumerate(keys)}
    return [mapDict[_range] for _range in ranges]


# 三射程、二射程
for name in ('三射程', '二射程', '缺船炮序'):
    table = workbook.sheet_by_name(name)
    for i in range(1, table.nrows):  # skip header
        row = table.row_values(i)

        # Calc length
        length = len([item for item in row[0:6] if item != ''])
        if length == 0:
            continue

        shootingRanges = compressRanges(list(map(range2Int, row[0:length])))
        shipIndexes = [int(item) for item in row[6:6+length]]
        shipRankings = [0 for _ in range(length)]

        # verify data
        verify(shootingRanges, shipIndexes)

        # Adjust from shipIndexes to shipRankings
        for round, shipIndex in enumerate(shipIndexes):
            shipRankings[shipIndex - 1] = round + 1

        key = ''.join(str(_range) for _range in shootingRanges)
        value = ''.join(str(item) for item in shipRankings)

        if key in data:
            raise RuntimeError(f'Duplicate key {key}.')
        data[key] = value

with open('../resources/sequence.json', 'w', encoding='utf8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
