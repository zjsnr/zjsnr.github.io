<template>
  <div class="result-show-box" style="text-align:center">
    <div v-if="ships.length">
      <Button
        v-for="ship in sortedShips"
        :key="ship.shipCid"
        shape="circle"
        :style="style(ship.star)"
        v-text="ship.name"
      />
    </div>
    <div v-else>
      <Button shape="circle" type="dashed">None</Button>
    </div>
  </div>
</template>

<script>

import { Button } from 'view-design'
export default {
  name: 'ResultShowBox',
  props: {
    ships: Array
  },
  components: {
    Button
  },
  computed: {
    sortedShips () {
      const app = this
      return app.ships.sort(
        function (a, b) {
          return a.star - b.star
        }
      )
    }
  },
  methods: {
    style (star) {
      return {
        'background-color': this.getColor(star),
        'border-color': this.getColor(star),
        'color': '#FFFFFF'
      }
    },
    getColor (star) {
      return {
        1: '#74787a', // gray
        2: '#19be6b', // green
        3: '#619ac3', // blue
        4: '#c06f98', // purple
        5: '#f9bd10', // yellow
        6: '#ee2746' // colorful
      }[star]
    }
  }
}
</script>

<style scoped>
Button {
  margin: 1px
}
</style>
