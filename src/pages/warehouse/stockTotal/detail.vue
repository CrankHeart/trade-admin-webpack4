<template>
  <lc-dataset :dataset="dataset">
    <template slot="table-center">{{`SKU编码：${'22000583401'} 商品名称：${'加发 牙胶尖'} 规格：${'06锥度，35#'}`}}</template>
  </lc-dataset>
</template>

<script>
import { Reserve, Locked, Lack, Onway } from './detailConfig'
const config = {
  1: Reserve,
  2: Locked,
  3: Lack,
  4: Onway
}
export default {
  name: "stockTotalDetail",
  data() {
    return {
      dataset: ''
    };
  },
  computed: {},
  methods: {},
  created() {
    let code = this.$route.query.code
    this.dataset = this.$dataSet( config[ code ] )
    this.dataset.value = [ {} ]
  },
  deactivated() {
    this.$destroy()
  }
};
</script>

<style lang="stylus" scoped>
</style>