// game related
DATA = {
    enemies: {
        "pi-1": { hp: 19, armor: 7, level: 1 },
        "pi-2": { hp: 27, armor: 21, level: 17 },
        "pi-3": { hp: 37, armor: 30, level: 35 },
        "pi-4": { hp: 47, armor: 39, level: 53 },
        "sigma-1": { hp: 33, armor: 15, level: 9 },
        "sigma-2": { hp: 45, armor: 30, level: 36 },
        "sigma-3": { hp: 50, armor: 45, level: 64 },
        "rho-1": { hp: 24, armor: 9, level: 14 },
        "rho-2": { hp: 34, armor: 27, level: 45 },
        "rho-3": { hp: 44, armor: 36, level: 64 },
        "rho-4": { hp: 54, armor: 45, level: 80 },
        "phi-1": { hp: 34, armor: 30, level: 42 },
        "phi-2": { hp: 40, armor: 34, level: 61 },
        "phi-3": { hp: 48, armor: 40, level: 75 },
        "phi-4": { hp: 56, armor: 46, level: 89 },
    },
    enemyBoss: {
        "6-1": "pi-4",
        "8-1": "phi-2"
    },
    depthCharges: [
        { name: "无", value: 0 },
        { name: "土豆(3)", value: 3 },
        { name: "绿弹(5)", value: 5 },
        { name: "紫弹(8)", value: 8 },
        { name: "捕鼠(9)", value: 9 },
        { name: "先进(10)", value: 10 },
        { name: "刺猬(15)", value: 15 }
    ],
    sonars: [
        { name: "无", value: 0 },
        { name: "633鱼雷(3)", value: 3 },
        { name: "绿声纳(6)", value: 6 },
        { name: "紫声纳(10)", value: 10 }
    ]
};

function calcDamage(rawAnti, depthCharge, sonar, broken, armor) {
    kFloat = 0.89;
    kSonar = 1.0 + sonar / 10.0;
    kBroken = broken ? 0.6 : 1.0;
    kPenetration = 2.0;

    baseAtk = rawAnti / 3.0 + ((depthCharge == 0) ? 0 : (depthCharge * 1.3 + 30.0));
    atk = baseAtk * kFloat * kSonar * kBroken;
    damage = Math.ceil(atk * (1 - armor / (0.5 * armor + kPenetration * atk)));
    return damage;
}

function sinkable(rawAnti, depthCharge, sonar, broken, armor, hp) {
    return calcDamage(rawAnti, depthCharge, sonar, broken, armor) >= hp;
}

function getMinRawAntiForSuit(depthCharge, sonar, broken, armor, hp) {
    let START_FROM = 150;
    let last = START_FROM + 1;
    for (let rawAnti = START_FROM; rawAnti >= 0; rawAnti--) {
        if (sinkable(rawAnti, depthCharge, sonar, broken, armor, hp)) {
            last = rawAnti;
        } else {
            break;
        }
    }
    return last;
}

function getResultsForEnemyWithBrokenInfo(enemy, broken) {
    // TODO:
    return [
        { rawAnti: 100, depthCharge: DATA.depthCharges[0], sonar: DATA.sonars[0] }
    ]
}

function getResultsForEnemy(enemy) {
    let normal = getResultsForEnemyWithBrokenInfo(enemy, false);
    let broken = getResultsForEnemyWithBrokenInfo(enemy, true);
    return {
        "normal": normal,
        "broken": broken
    };
}


// html related

$('.btn-outline-dark').click(function (event) {
    let btn = $(event.target);
    btn.siblings().each(function () {
        $(this).removeClass('active');
    });
    btn.addClass('active');
    recalc();
});

$(document).ready(function () {
    recalc();
})

function recalc() {
    // get map id first
    let mapid = $('#map_id>button.active').attr('mapid');
    let bossName = DATA.enemyBoss[mapid];
    let boss = DATA.enemies[bossName];

    let results = getResultsForEnemy(boss);

    // insert into normal table
    let tableBody = $('#normal-table>tbody').empty(); // clear
    for (record of results.normal) {
        console.log(record);
        let row = $('<tr></tr>');
        row.append($('<td></td>').text(record.rawAnti)[0]);
        row.append($('<td></td>').text(record.depthCharge.name)[0]);
        row.append($('<td></td>').text(record.sonar.name)[0]);
        tableBody.append(row[0]);
    }
}
