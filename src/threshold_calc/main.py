from pathlib import Path
import json
import math
import collections
from operator import itemgetter
from matplotlib import pyplot as plt

import requests
import xlrd

A = 'oil'
B = 'ammo'
C = 'steel'
D = 'al'


def nameToLongCid(name: str):
    path = Path('cache') / 'convert.json'
    if path.exists():
        with path.open() as f:
            data = json.load(f)
    else:
        url = 'http://static.jianrmod.cn/ShortShipInfo.json?v=1'
        items = requests.get(url).json()
        data = {
            item['title']: int(item['cid'])
            for item in items
            if 'evo' in item and int(item['evo']) == 0 and
            not str(item['cid']).startswith('18')
            # if 'ship_index' in item and int(item['evo']) == 0
        }
        with path.open('w') as f:
            json.dump(data, f)
    return data[name]


def shortIDToLongID(shortID: int):
    path = Path('cache') / 'convert.json'
    if path.exists():
        with path.open() as f:
            data = json.load(f)
    else:
        url = 'http://static.jianrmod.cn/ShortShipInfo.json?v=1'
        data = {}
        items = requests.get(url).json()
        for item in items:
            if int(item.get('evo', '1')) != 0:
                continue
            if str(item['cid']).startswith('18'):
                continue
            short = str(item['cid'])[3:6]
            long = int(item['cid'])
            # print(f'short = {short}, long = {long}')
            if short not in data:
                data[short] = long

        with path.open('w') as f:
            json.dump(data, f)
    return data[f'{shortID:03d}']


def getBuildDataFromJianrMod(longCid):
    url = 'http://www.jianrmod.cn/data/queryBuildTable.do?type=0&cid={}'.format(
        longCid)
    # url += '&timePart=00000000_v,20161017_v,20161111_sj,20161114_v,20161216_hd,20161230_v,20170120_v,20170306_v,20170310_sj,20170317_v,20170428_v,20170512_hd,20170526_v,20170619_v,20170721_sj,20170724_v,20170807_v,20170921_v,20170925_hd,20171009_v,20171110_sj,20171113_v,20171207_v,20171208_hd,20171222_v,20171223_v,20180119_sj,20180122_v,20180131_v,20180330_v,20180404_v,20180412_hd,20180426_v,20180504_sj,20180507_v,20180531_v,20180607_v,20180706_v,20180720_sj,20180723_v,20180817_hd,20180824_v,20180920_v,20180921_hd,20181012_v,20181109_sj,20181113_0_19,20181112_v,20181120_v,20181207_hd,20181221_v,20181224_v,20190108_v,20190110_hd,20190117_v,20190130_hd,20190117_v,20190306_v,20190308_sj,20190315_v,20190319_v,20190328_hd,20190411_v,20190430_hd,20190507_v,20190515_v'
    resp = requests.get(url).json()
    data = resp['data']
    print('{} items got.'.format(len(data)))
    if len(data) == 0:
        print(url)
        raise RuntimeError
    if isinstance(data, str):
        print(url)
        # print(data)
        raise RuntimeError
    return data


def getBuildData(longCid):
    path = Path('cache') / '{}.json'.format(longCid)
    if path.exists():
        with path.open() as f:
            data = json.load(f)
    else:
        data = getBuildDataFromJianrMod(longCid)
        with path.open('w') as f:
            json.dump(data, f)
    return data


def calcMin(data):
    'Return [A, B, C, D]'
    # print(data)
    def getMinForKey(res):
        counter = collections.defaultdict(int)
        for item in data:
            counter[item[res]] += item['C']
        for key in sorted(counter.keys()):
            if counter[key] <= 3:
                del counter[key]
        return min(counter.keys())

    return [
        getMinForKey(res) for res in (A, B, C, D)
    ]


def verifyRule(type_, record, rule_ABCD):
    "Return if rule is satisfied"
    singleBreak = (
        rule_ABCD[i] <= record[i]
        for i in range(4)
        if rule_ABCD[i] is not None)
    if type_ == 'and':  # allow one breaks
        # so any satisfied makes result satisfied
        return not all(singleBreak)
    elif type_ == 'or':  # any breaks breaks all
        # must satisfy all
        return not any(singleBreak)
    else:
        raise RuntimeError()


def verifyMax(data, rule, shipID, shipName):
    """
        rule: {
            "type": "and/or",
            "ABCD": []
        }
    """
    for item in data:
        record = [item[A], item[B], item[C], item[D]]
        satisfied = verifyRule(
            rule['type'], record, rule['ABCD'])
        if not satisfied:
            if item['C'] <= 1:
                continue
            msg = f'[WARNING] {shipName}({shipID}) record {record} '\
                + f'>= {rule["type"].upper()} {rule["ABCD"]}'
            print(msg)
            print(item)


def plotData(data, rule):
    for item in data:
        record = [item[A], item[B], item[C], item[D]]
        s = math.log(0.1 + item['C']) * 2
        plt.plot(record, '.-', linewidth=s)
    plt.show()


def main():
    workbook = xlrd.open_workbook('threshold.xlsx')
    table = workbook.sheet_by_name('threshold')

    START = 1
    # START = 150

    rules = []

    for i in range(START, table.nrows):  # skip header
        # verify i
        row = table.row_values(i)
        shipType, star, shortID, shipName = row[:4]
        shortID = int(shortID)
        star = int(star)
        longCid = shortIDToLongID(shortID)
        min_ABCD = [int(item) for item in row[4:8]]
        max_ABCD = [int(item) if item else None for item in row[8:12]]
        max_type = row[12].lower() if row[12] else None
        max_rule = {
            'type': max_type,
            'ABCD': max_ABCD
        } if max_type else None
        print(f'verify ship {shipName}({longCid})')

        data = getBuildData(longCid)

        _min = calcMin(data)
        if _min != min_ABCD:
            print(f'[WARNING] min: jianrmod {_min}, excel: {min_ABCD}')
        else:
            print('min formula matched.')

        if max_rule:
            # plotData(data, max_rule)
            verifyMax(data, max_rule, longCid, shipName)
        # return

        rules.append({
            'shipType': shipType,
            'shipName': shipName,
            'star': star,
            'shipCid': longCid,
            'min': {
                'ABCD': min_ABCD,
            },
            'max': max_rule
        })
        # input()

    with Path('rules.json').open('w', encoding='utf8') as f:
        json.dump(rules, f, ensure_ascii=False, indent=2)


main()
