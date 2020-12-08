<template>
  <div class="user-portrait-like">
    <slot></slot>
    <el-form label-width="130px">
      <el-form-item v-for="con in condition" :key="con.prop" :label="`${con.label}：`">
        <template v-if="isEdit">
          <!-- 编辑 -->
          <template v-if="con.type=='radio'">
            <el-radio-group v-model="item[con.prop]">
              <el-radio
                v-for="option in con.options"
                :key="option.id"
                :label="option.id"
              >{{option.name}}</el-radio>
            </el-radio-group>
          </template>
          <template v-else-if="con.type=='select'">
            <el-select v-model="item[con.prop]" size="small">
              <el-option v-for="opt in con.options" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
            </el-select>
          </template>
          <template v-else>
            <el-input :type="con.type" v-model="item[con.prop]"></el-input>
          </template>
          <template v-if="con.contact && con.contact.length">
            <template v-for="(contact, index) in con.contact">
              <div :key="index" v-if="item[con.prop] === contact.relyValue">
                <template v-if="contact.type=='radio'">
                  <el-radio-group v-model="item[contact.prop]">
                    <el-radio
                      v-for="option in contact.options"
                      :key="option.id"
                      :label="option.id"
                    >{{option.name}}</el-radio>
                  </el-radio-group>
                </template>
              </div>
            </template>
          </template>
        </template>
        <template v-else>
          <!-- 查看 -->
          <template v-if="con.options">
            {{convertData(item[con.prop],con.prop)}}
            <template
              v-if="con.contact && con.contact.length"
            >
              <template v-for="contact in con.contact">
                <div
                  :key="contact.props"
                  v-if="item[con.prop] === contact.relyValue"
                >{{ contact.options ? convertData(item[contact.prop],contact.prop) : item[contact.prop] }}</div>
              </template>
            </template>
          </template>
          <template v-else>{{item[con.prop]}}</template>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { invoiceWithGoods, invoiceKinds, validityFlags, roundingTypes, isPrintPrice, agreementGoods } from '../const'
import portraitMixins from './portraitMixins'
@Component( {
  name: 'portraitDetailLike',
  mixins: [ portraitMixins ]
} )
export default class portraitDetailLike extends Vue {
  @Prop( { default: () => ( {} ) } )
  item: any
  @Prop()
  isEdit: boolean
  condition = [
    { prop: 'roundingType', label: '货币精确度', type: 'select', options: roundingTypes },
    { prop: 'isPrintPrice', label: '是否打印出库单', type: 'radio', options: isPrintPrice },
    {
      prop: 'invoiceWithGoods', label: '随货发票', type: 'radio', options: invoiceWithGoods,
      contact: [
        { prop: 'invoiceKind', label: '', type: 'radio', options: invoiceKinds, relyValue: 1 },
      ]
    },
    { prop: 'validityFlag', label: '商品效期', type: 'radio', options: validityFlags },
    { prop: 'agreementVisible', label: '显示协议商品', type: 'radio', options: agreementGoods }
  ]
}
</script>
<style lang="stylus" scoped>
.user-portrait-like
  >.el-button-group
    position relative
    top -40px
    height 0
  .el-form-item
    padding 2px 0
    margin 0
    + .el-form-item
      border-top 1px solid #eee
</style>

