<template>
  <div>
    <lc-dataset :bindId="bindId">
      <template slot="card-bottom" slot-scope="{card}">
        <div v-if="card === 'card2'">
          <lc-card title="商品信息">
            <template slot="title">
              <el-button type="primary" size="mini">导入</el-button>
              <el-button type="primary" size="mini" @click="addLine">添加行</el-button>
            </template>
            <el-form :inline="true" class="demo-form-inline">
              <el-form-item label="批量设置到货日期：">
                <el-input></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary">确认</el-button>
              </el-form-item>
              <el-form-item label="优惠金额：">
                <el-input></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary">优惠均衡</el-button>
              </el-form-item>
            </el-form>
            <lc-dataset :bindId="tableId"></lc-dataset>
            <div class="table-amount-content">
              <div class="table-amount">
                <lc-dataset :bindId="tableAmountId"></lc-dataset>
              </div>
            </div>
          </lc-card>
          <lc-card title="直发订单信息">
            <lc-dataset :bindId="zhiFaDingDanId"></lc-dataset>
          </lc-card>
        </div>
      </template>
    </lc-dataset>
    <div class="action-buttons">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button type="primary">提交</el-button>
      <el-button>取消</el-button>
    </div>
  </div>
</template>

<script>
import addConfig from './addConfig/addConfig.js'
import addTableConfig from './addConfig/addTableConfig.js'
import addTableAmountConfig from './addConfig/addTableAmountConfig.js'
import zhiFaDingDanConfig from './addConfig/zhiFaDingDanConfig.js'
export default {
  name: "procurement-list",
  data() {
    return {
      bindId: addConfig.id,
      tableId: addTableConfig.id,
      tableAmountId: addTableAmountConfig.id,
      zhiFaDingDanId: zhiFaDingDanConfig.id,
      procurementSn: false
    };
  },
  methods: {
    addLine() {
      this.tableDataset.create()
    },
    save() {
      console.log( this.dataset.value )
    }
  },
  created() {
    // form表单
    this.dataset = this.$dataSet( addConfig )
    this.dataset.create()
    // 商品信息下面的金额信息
    this.tableAmountDataset = this.$dataSet( addTableAmountConfig )
    this.tableAmountDataset.create()
    // 直发订单信息
    this.zfddDataset = this.$dataSet( zhiFaDingDanConfig )
    this.zfddDataset.create()
    this.zfddDataset.value = {
      k1: 123847293489,
      k2: "2020-06-18 20:34:21",
      k3: " 2365临县雅康口腔门诊部:孙宗邈",
      k4: "张三;15835791102;山西省临汾市襄汾县新城镇振兴路三小路口附近"
    }
    // 商品信息table
    this.tableDataset = this.$dataSet( addTableConfig )
    this.tableDataset.on( 'delete', ( record ) => {
      record.delete()
    } )
  },
  destroyed() {
    this.$dataSet.delete( this.bindId )
    this.$dataSet.delete( this.tableId )
    this.$dataSet.delete( this.tableAmountId )
    this.$dataSet.delete( this.zhiFaDingDanId )
  }
};
</script>

<style lang="stylus" scoped>
.table-amount-content
  text-align right
  .table-amount
    display inline-block
    width 300px
.action-buttons
  text-align right
</style>