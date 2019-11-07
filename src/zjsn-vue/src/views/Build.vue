<template>
  <div class="build">
    <FormulaCalculateBox/>
    <p style="margin-top:20px">
      计算结果仅作参考
    </p>
  </div>
</template>

<script>
// @ is an alias to /src
import FormulaCalculateBox from '@/components/FormulaCalculateBox.vue'

export default {
  name: 'build',
  components: {
    FormulaCalculateBox
  },
  data () {
    return {
    }
  }
}
</script>
