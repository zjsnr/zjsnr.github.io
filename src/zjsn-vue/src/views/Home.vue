<template>
  <div class="home">
    <FormulaCalculateBox/>
    <p>
      计算结果仅作参考
    </p>
  </div>
</template>

<script>
// @ is an alias to /src
import FormulaCalculateBox from '@/components/FormulaCalculateBox.vue'

export default {
  name: 'home',
  components: {
    FormulaCalculateBox
  },
  data () {
    return {
    }
  }
}
</script>
