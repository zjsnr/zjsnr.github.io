<template>
  <Card class="formula-calculate-box">
    <Row>
      <i-col :span="colSpan" v-for="(formula, index) in formulas" :key="inputBoxID(index)">
        <input-number :min="1" :max="999" :step="1" v-model="formula.A" />
        <input-number :min="1" :max="999" :step="1" v-model="formula.B" />
        <input-number :min="1" :max="999" :step="1" v-model="formula.C" />
        <input-number :min="1" :max="999" :step="1" v-model="formula.D" />
        <div>
        <Button
          v-if="formulas.length > 1"
          type="error" shape="circle" style="margin-top: 4px"
          icon="md-remove" @click="removeGroup(index)">
          Remove
        </Button>
        </div>
      </i-col>
    </Row>
    <Button
      v-if="formulas.length < 4"
      type="primary" shape="circle" style="margin-top: 4px"
      icon="md-add" @click="addGroup">
      Add
    </Button>
    <Divider/>
    <Row>
      <i-col :span="colSpan" v-for="(formula, index) in formulas" :key="showBoxID(index)">
        <ResultShowBox :ships="specialShips(formula)" />
      </i-col>
    </Row>
    <Divider/>
    <ResultShowBox :ships="commonShips()" />
  </Card>
</template>

<script>
import axios from 'axios'
import { Card, InputNumber, Divider, Button, Row, Col } from 'view-design'
import ResultShowBox from '@/components/ResultShowBox.vue'
import { calculateShipsForFormula } from '@/utils/buildFormula'

export default {
  name: 'FormulaCalculateBox',
  components: {
    Card,
    InputNumber,
    Divider,
    ResultShowBox,
    Button,
    Row,
    'i-col': Col
  },
  data () {
    return {
      formulas: [{
        A: 120,
        B: 120,
        C: 120,
        D: 120
      }],
      rules: []
    }
  },
  mounted () {
    const app = this
    axios
      .get('./buildRules.json')
      .then(function (res) {
        app.rules = res.data
      })
  },
  computed: {
    colSpan () {
      return {
        1: 24,
        2: 12,
        3: 8,
        4: 6
      }[this.formulas.length]
    }
  },
  methods: {
    inputBoxID (id) {
      return 'index' + id
    },
    showBoxID (id) {
      return 'showbox' + id
    },
    addGroup () {
      const app = this
      let last = app.formulas[app.formulas.length - 1]
      let newFormula = {
        A: last.A, B: last.B, C: last.C, D: last.D
      }
      app.formulas.push(newFormula)
    },
    removeGroup (index) {
      const app = this
      app.formulas.splice(index, 1)
    },
    calculateShips (formula) {
      return calculateShipsForFormula(
        formula.A, formula.B, formula.C, formula.D, this.rules
      )
    },
    commonShips () {
      const app = this
      let shipsDict = {} // map cid to ship
      let shipCidGroups = [] // cids
      for (const formula of app.formulas) {
        const ships = app.calculateShips(formula)
        for (const ship of ships) {
          shipsDict[ship.cid] = ship
        }
        shipCidGroups.push(new Set(ships.map(s => s.cid)))
      }
      const commonCids = [...shipCidGroups.reduce(
        function (a, b) {
          return new Set(
            [...a].filter(x => b.has(x)))
        }
      )]
      return commonCids.map(cid => shipsDict[cid])
    },
    specialShips (formula) {
      const app = this
      const ships = app.calculateShips(formula)
      const commonCid = new Set(
        app.commonShips().map(s => s.cid))
      const result = ships.filter(s => !commonCid.has(s.cid))
      return result
    }
  }
}
</script>

<style scoped>
.formula-calculate-box {
  max-width: 1400px;
  text-align: center;
  margin: auto;
}
</style>
