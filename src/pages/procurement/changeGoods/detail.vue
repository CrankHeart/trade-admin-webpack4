<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="详情" name="detail">
      <el-button type="primary" @click="approve" v-if="$permissionValidateWithEnv( 1304, 1293 )">审核</el-button>
      <el-button type="primary" @click="cancel" v-if="$permissionValidateWithEnv( 1305, 1294 )">取消</el-button>
      <lc-dataset :dataset="detailDs">
        <template slot="card-bottom" slot-scope="{card}">
          <lc-card v-if="card==='card1'" title="商品信息">
            <lc-dataset :dataset="goodsDs"></lc-dataset>
          </lc-card>
          <lc-card v-else-if="card==='card2'" title="备注信息">
            <template slot="title">
              <el-button
                type="primary"
                size="mini"
                @click="addRemark"
                v-if="$permissionValidateWithEnv(1307, 1296)"
              >添加</el-button>
            </template>
            <lc-dataset :dataset="remarkDs"></lc-dataset>
          </lc-card>
        </template>
      </lc-dataset>
    </el-tab-pane>
    <el-tab-pane label="操作记录" name="action" v-if="$permissionValidateWithEnv(1308, 1297)">
      <lc-dataset :dataset="actionDs"></lc-dataset>
    </el-tab-pane>
    <el-tab-pane label="出库记录" name="out" v-if="$permissionValidateWithEnv(1309, 1298)">
      <div>{{`状态：${'待出库'}，发货单号：${'待出库'}， 下推时间： ${'待出库'} 下推WMS：${'待出库'}，物流公司：${'待出库'}，物流单号：${'待出库'}，回传时间：${'待出库'}`}}</div>
      <lc-dataset :dataset="outhousekDs"></lc-dataset>
    </el-tab-pane>
    <el-tab-pane label="入库记录" name="in" v-if="$permissionValidateWithEnv(1310, 1299)">
      <lc-dataset :dataset="inhousekDs"></lc-dataset>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import detailConfig from './detailConfig/detail'
import goodsConfig from './detailConfig/goods'
import remarkConfig from './detailConfig/remark'
import actionConfig from './detailConfig/action'
import outhouseConfig from './detailConfig/outhouse'
import inhouseConfig from './detailConfig/inhouse'

import formRemarkConfig from './detailConfig/formRemark'
import approveConfig from './detailConfig/approve'

export default {
  name: "changeGoodsDetail",
  props: {},
  data() {
    return {
      activeName: 'detail',
      detailDs: '',
      goodsDs: '',
      remarkDs: '',
      actionDs: '',
      outhousekDs: '',
      formRemarkDs: '',
      approveDs: '',
      inhousekDs: ''
    };
  },
  computed: {},
  methods: {
    addRemark() {
      this.$popup( {
        title: '添加备注',
        props: this.formRemarkDs,
        confirm: async () => {
          return await this.formRemarkDs.save()
        },
        close: () => {
          this.formRemarkDs.reset()
        }
      } )
    },
    approve() {
      this.$popup( {
        title: '审核',
        props: this.approveDs,
        confirm: async () => {
          return await this.approveDs.save()
        },
        close: () => {
          this.approveDs.reset()
        }
      } )
    },
    cancel() {
      this.$confirm( '请确认是否取消采购退货单', '提示', {
        type: 'warning'
      } ).then( () => {

      } )
    }
  },
  created() {
    //单据信息
    this.detailDs = this.$dataSet( detailConfig )
    this.detailDs.value = {}
    //商品信息
    this.goodsDs = this.$dataSet( goodsConfig )
    this.goodsDs.value = [ {} ]
    //备注列表
    this.remarkDs = this.$dataSet( remarkConfig )
    this.remarkDs.value = [ {} ]
    //操作记录
    this.actionDs = this.$dataSet( actionConfig )
    this.actionDs.value = [ {} ]
    //出库记录
    this.outhousekDs = this.$dataSet( outhouseConfig )
    this.outhousekDs.value = [ {} ]
    //入库记录
    this.inhousekDs = this.$dataSet( inhouseConfig )
    this.inhousekDs.value = [ {} ]
    //弹出框的备注
    this.formRemarkDs = this.$dataSet( formRemarkConfig )
    this.formRemarkDs.value = {}
    //弹出框审核
    this.approveDs = this.$dataSet( approveConfig )
    this.approveDs.on( 'fieldChange', field => {
      if ( field.key === 'auditState' ) {
        let _field = this.approveDs.getField( 'remark' )
        if ( field.value === 0 ) {
          _field.required = true
        } else {
          _field.required = false
          _field.error = ''
        }
      }
    } )
    this.approveDs.value = {}
  },
  deactivated() {
    this.$destroy()
  }
};
</script>

<style lang="stylus" scoped></style>