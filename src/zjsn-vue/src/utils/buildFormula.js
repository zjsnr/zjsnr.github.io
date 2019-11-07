export function calculateShipsForFormula (A, B, C, D, rules) {
  let ships = []
  for (const rule of rules) {
    const minABCD = rule.min.ABCD
    const minThresholdSatisfied =
      A >= minABCD[0] &&
      B >= minABCD[1] &&
      C >= minABCD[2] &&
      D >= minABCD[3]
    if (!minThresholdSatisfied) { continue }

    const maxRule = rule.max
    let maxThresholdSatisfied = true
    // calculate if max threshold is satisfied
    if (maxRule != null) {
      const ABCD = [A, B, C, D]
      let singleBlocked = []
      for (const index in maxRule.ABCD) {
        if (maxRule.ABCD[index] == null) {
          continue
        }
        singleBlocked.push(ABCD[index] >= maxRule.ABCD[index])
      }
      if (maxRule.type === 'or') {
        maxThresholdSatisfied = !singleBlocked.some(x => x)
      } else if (maxRule.type === 'and') {
        maxThresholdSatisfied = !singleBlocked.every(x => x)
      }
    }
    if (maxThresholdSatisfied) {
      const ship = {
        type: rule.shipType,
        name: rule.shipName,
        star: rule.star,
        cid: rule.shipCid
      }
      ships.push(ship)
    }
  }
  return ships
}
