<template>
  <el-dialog class="ground-discount-config" title="地推优惠配置" :visible.sync="visible" :before-close="beforeCloseDialog">
    <el-form ref="config-form" :model="config" :rules="rules" label-width="120px">
      <el-form-item label="自动审批" prop="autoAuditEnabled">
        <el-switch v-model="config.autoAuditEnabled" on-text="" off-text=""></el-switch>
      </el-form-item>
      <el-form-item class="config-rate" label="优惠额度" prop="discountLimitRate">
        <el-input type='number' step="0.01" :max='maxRate' :min='minRate' v-model.number='config.discountLimitRate' @blur="fixRate('discountLimitRate')">
          <template slot="append">%</template>
        </el-input>
      </el-form-item>
      <el-form-item label="是否有效" prop="enabled">
        <el-switch v-model="config.enabled" on-text="" off-text=""></el-switch>
      </el-form-item>
      <el-form-item v-for="(item,index) in levelEnables" :key="item.prop" :label="item.label" :prop="item.prop">
        <el-switch v-model="config[item.prop]" on-text="" off-text="" @change="changeLevelEnable(index)"></el-switch>
      </el-form-item>
      <el-form-item class="config-rate" v-for="item in levelValues" :key="item.prop" :label="item.label" :prop="item.prop">
        <el-input type='number' step="0.01" max='1' :disabled="!config[item.contact]" v-model.number="config[item.prop]" @blur="fixRate(item.prop)">
          <!-- <template slot="append">%</template> -->
        </el-input>
      </el-form-item>
      <el-form-item label="备注" :prop="config.remark">
        <el-input type='textarea' v-model.number="config.remark">
        </el-input>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="updateConfig" v-if="$permissionValidateWithEnv(1184,1180)" >确 定</el-button>
    </span>
  </el-dialog>
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import API from '../../../API'

@Component( {
  name: 'ground-discount-config'
} )
export default class GroundDiscountConfig extends Vue {

  @Prop() value: boolean

  config = {
    autoAuditEnabled: false,  // 自动审批
    discountLimitRate: 1,
    level0: '',
    level1: '',
    level2: '',
    level0AutoEnabled: true,
    level1AutoEnabled: false,
    level2AutoEnabled: false,
    enabled: false,   // 是否有效
    remark: '',   // 备注
  }
  levelValues = [
    { prop: 'level0', label: 'A等级起始值', contact: 'level0AutoEnabled' },
    { prop: 'level1', label: 'B等级起始值', contact: 'level1AutoEnabled' },
    { prop: 'level2', label: 'C等级起始值', contact: 'level2AutoEnabled' }
  ]
  levelEnables = [
    { label: 'A等级自动审批', prop: 'level0AutoEnabled' },
    { label: 'B等级自动审批', prop: 'level1AutoEnabled' },
    { label: 'C等级自动审批', prop: 'level2AutoEnabled' }
  ]
  minRate = 1
  maxRate = 3

  rules = {
    "discountLimitRate": [
      { validator: this.validateRate, trigger: 'blur' }
    ],
    "level0": [
      { required: true, type: "number", message: '不可为空', trigger: 'blur' },
      { validator: this.validatelevels( 0 ), trigger: 'blur' }
    ],
    "level1": [
      { validator: this.validatelevels( 1 ), trigger: 'blur' }
    ],
    "level2": [
      { validator: this.validatelevels( 2 ), trigger: 'blur' }
    ]
  }

  get visible () {
    if ( this.value ) {
      this.getConfig()
    }
    return this.value
  }

  set visible ( v ) {
    this.$emit( 'input', v )
  }

  getConfig () {
    this.$permissionValidateWithNotifyEnv(1185,1181)
    this.$http( API.getDiscountSettings ).then( ( { data } ) => {
      data = data.data
      let config = {
        ...this.config,
        ...data
      }
      this.levelValues.forEach( v => {
        config[v.prop] = +config[v.prop]
        config[v.contact] = !!config[v.contact]
      })
      config.enabled = !!config.enabled
      config.autoAuditEnabled = !!+data.autoAuditEnabled
      config.discountLimitRate = +Number( +data.discountLimitRate * 100 ).toFixed(2)
      this.config = config
    } )
  }

  fixRate ( prop ) {
    this.config[ prop ] = +Number( this.config[prop] ).toFixed( 2 )
  }

  changeLevelEnable( index ){
    const valueKey = `level${index}`
    const enableKey = `${valueKey}AutoEnabled`

    if( !this.config[enableKey] ) {
      this.config[valueKey] = null
    }
  }

  validateRate ( rule, value, callback ) {
    value = +value
    if ( value < this.minRate || value > this.maxRate ) {
      callback( new Error( '请输入1~3之间的数字' ) )
    } else {
      callback()
    }
  }

  validatelevels ( index ) {
    const self = this

    return function ( rule, value, callback ) {
      const field = rule.field
      const enableField = `${field}AutoEnabled`
      const prevKey = `level${index - 1}`
      const prevValue = self.config[ prevKey ] || null

      if ( self.config[ enableField ] ) {
        if ( value === '' ) {
          callback( new Error( '起始值不可为空' ) )
        } else if ( +value >= 1 ) {
          callback(new Error( '起始值最大值不能超过1' ))
        } else if ( ( !prevValue && index > 0 ) || ( prevValue && +value >= prevValue) ) {
          callback( new Error( '该起始值需小于上一等级的起始值' ) )
        } else {
          callback()
        }
      } else {
        callback()
      }

    }

  }

  validateForm () {
    let isValidate: boolean = false
    let refs:any = this.$refs[ 'config-form' ]
    refs.validate( ( valid ) => {
      if ( valid ) {
        isValidate = true
      }
    } )
    return isValidate
  }

  formatParma () {
    let param:any = { }

    const config = this.config

    this.levelValues.forEach( v => {
      param[ v.prop ] = +config[ v.prop ]
      param[ v.contact ] = +config[v.contact]
    })
    param.enabled = +config.enabled
    param.autoAuditEnabled = +config.autoAuditEnabled
    param.discountLimitRate = +config.discountLimitRate / 100
    param.remark = config.remark

    return param
  }

  updateConfig () {
    if ( !this.validateForm() ) return

    this.$http( API.updateDiscountSettings, this.formatParma() ).then( ( { data } ) => {
      this.closeDialog()
      this.$notify( {
        type: 'success',
        message: '更新成功'
      } )
    } ).catch( ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg || '更新失败'
      } )
    } )
  }

  beforeCloseDialog ( done ) {
    let refs:any = this.$refs[ 'config-form' ]
    refs.resetFields()
    done()
  }

  closeDialog () {
    this.visible = false
    this.$emit('refresh')
  }

}

</script>

<style lang="stylus">
.config-rate
  .el-input-group
  .el-input
    width 120px
.level-row
  margin-bottom 10px
  display flex
  align-items center

</style>
