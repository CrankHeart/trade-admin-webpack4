<template>
  <el-col :span="24" class="layout-component">
    错误
    <slot></slot>
  </el-col>
</template>

<script>
// import SubHeader from '@/components/SubHeader'
import templateMixins from './templateMixins'
import promotionProduct from '../components/pc/promotionProduct'
import { formatMyDate } from '@/utils'

export default {
  name: 'Normal_0_0',
  components: {
    promotionProduct
  },
  mixins: [ templateMixins ],
  methods: {
    formatMyDate
  }
}
</script>
