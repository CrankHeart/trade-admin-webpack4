<template>
  <div class="user-portrait-info">
    <slot></slot>
    <el-form label-width="130px">
      <el-form-item v-for="con in condition" :key="con.prop" :label="`${con.label}：`">
        <template>
          <!-- 其他 radio 或者 text -->
          <template v-if="isEdit">
            <template v-if="con.type=='radio'">
              <el-select v-model="item[con.prop]" size="small">
                <el-option
                  v-for="opt in con.options"
                  :key="opt.id"
                  :label="opt.name"
                  :value="opt.id"
                ></el-option>
              </el-select>
            </template>
            <!-- <template v-else-if="con.type=='mixins'">
              <el-row>
                <el-col :span="8">
                  <el-switch v-model="enabled"></el-switch>
                </el-col>
                <el-col :span="16">
                  <el-select v-model="item.settlementMethod" size="small" v-if="enabled">
                    <el-option
                      v-for="opt in option.settlementMethods"
                      :key="opt.id"
                      :label="opt.name"
                      :value="opt.id"
                    ></el-option>
                  </el-select>
                </el-col>
              </el-row>
            </template>-->
            <template v-else-if="con.prop=='consumablesPerson' && isConsumablesPersonEdit">
              <consumables-person-search
                v-model="item.consumablesPerson"
                @change="consumablesPersonChange"
                size="small"
              ></consumables-person-search>
            </template>
            <template v-else-if="con.prop=='salesSupport'">
              <el-input v-model="item[con.prop]" size="small" :type="con.type" :disabled="!$permissionValidateWithEnv(1282, 1273)"></el-input>
            </template>
            <template v-else>
              <el-input v-model="item[con.prop]" size="small" :type="con.type"></el-input>
            </template>
          </template>

          <template v-else>
            <template v-if="con.type=='radio'">{{convertData(item[con.prop],con.prop)}}</template>
            <!-- <template v-else-if="con.type=='mixins'">
                {{item.enabled?'月结':'普通'}}用户
                <span v-if="item.enabled">
                  | {{convertData(item.settlementMethod,'settlementMethod')}}
                </span>
            </template>-->
            <template v-else-if="con.prop=='consumablesPerson'">{{consumablesPersonAndEmail}}</template>
            <template v-else>{{item[con.prop]}}</template>
          </template>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import portraitMixins from './portraitMixins'
import { Getter } from 'vuex-class'
import { userTypes, creditLevels, purchasingFrequencys } from '../const/'
import consumablesPersonSearch from '../../../components/consumablesPersonSearch.vue'

@Component( {
  name: 'portraitDetailInfo',
  mixins: [ portraitMixins ],
  components: {
    consumablesPersonSearch
  }
} )
export default class portraitDetailInfo extends Vue {
  @Prop()
  isEdit: boolean

  @Prop( { default: () => ( {} ) } )
  item: any

  condition: any[] = [
    { prop: 'userType', label: '用户分类', type: 'radio', options: userTypes },
    { prop: 'creditLevel', label: '信用等级', type: 'radio', options: creditLevels },
    { prop: 'purchasingFrequency', label: '采购频率', type: 'radio', options: purchasingFrequencys },
    // { prop: 'enabled', label: '结算类型', type: 'mixins' },
    { prop: 'label', label: '用户标签', type: 'text' },
    { prop: 'consumablesPerson', label: '当前耗材负责人', type: 'text' },
    { prop: 'salesSupport', label: '销售支持', type: 'text' },
  ]

  get enabled () {
    return !!this.item.enabled
  }
  set enabled ( v ) {
    this.item.enabled = +v
  }

  get isConsumablesPersonEdit () {
    return this.$permissionValidate( 729 )
  }
  get consumablesPersonAndEmail () {
    let { consumablesPerson, email } = this.item
    if ( consumablesPerson && email ) {
      return consumablesPerson + ':' + email
    } else if ( consumablesPerson ) {
      return consumablesPerson
    } else {
      return email
    }
  }
  consumablesPersonChange ( v ) {
    let [ consumablesPerson, email ] = v.split( ':' )
    this.item.consumablesPerson = consumablesPerson
    this.item.email = email
  }
}
</script>
<style lang="stylus" >
.user-portrait-info
  >.el-button-group
    position relative
    top -40px
  form
    position absolute
    left 0
    top 0
    width 100%
  .el-form-item__content
    color #999
  position relative
  .el-form-item
    margin-bottom 0
    padding 2px 0
    + .el-form-item
      border-top 1px solid #efefef
  .el-select
    width 100%
  .el-button-group
    float right
  p
    span
      text-decoration underline
      cursor pointer
</style>
