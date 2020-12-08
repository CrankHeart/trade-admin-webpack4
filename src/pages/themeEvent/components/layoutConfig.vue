<template>
  <div class="layout-config">
    <el-button type="primary" size="small" @click="initNativeFloorItem">
      <i class="el-icon-plus"></i>
    </el-button>
    <el-dialog :visible="value" title="楼层模板配置" :key="current" :before-close="confirmClose">
      <el-form :label-width="`90px`">
        <!-- <el-form-item label="模板">
          <el-input v-model="curLayout.floorTemplateName" disabled />
        </el-form-item>-->
        <el-form-item v-for="item in myProps" :key="item.prop" :label="item.label">
          <template v-if="item.type=='radio'">
            <el-radio-group
              v-model="curLayout[item.prop]"
              :disabled="disabled|| (item.prop=='floorType'&&!!layout.id)"
              @change="radioChange(item.prop,$event)"
            >
              <el-radio
                v-for="option in item.options"
                :key="option.id"
                :label="option.id"
              >{{option.name}}</el-radio>
            </el-radio-group>
          </template>
          <template v-else-if="item.type=='switch'">
            <el-switch
              v-model="curLayout[item.prop]"
              on-text="on"
              off-text="off"
              :disabled="disabled"
            ></el-switch>
          </template>

          <template v-else-if="item.type=='select'">
            <el-select v-model="curLayout[item.prop]" :disabled="disabled">
              <el-option
                v-for="option in item.options"
                :key="option.id"
                :value="option.id"
                :label="option.name"
              >{{option.name}}</el-option>
            </el-select>
            <i class="el-icon-information" @click="dialogVisible=true"></i>
          </template>
          <template v-else-if="item.type=='daterange'" disabled>
            <el-date-picker
              v-model="curLayout[item.prop]"
              type="daterange"
              placeholder="选择日期范围"
              :disabled="disabled"
            ></el-date-picker>
          </template>
          <template v-else-if="item.type=='fileUpload'">
            <span class="file-upload">
              <input-file-upload @change="uploadFile(item,$event)" :disabled="disabled">
                <el-button type="primary" size="small">点击上传</el-button>
              </input-file-upload>
              {{curLayout[item.prop]}}
            </span>
          </template>
          <template v-else-if="item.type=='colorPicker'">
            <el-color-picker v-model="curLayout[item.prop]" show-alpha :disabled="disabled"></el-color-picker>
            {{curLayout[item.prop]}}
          </template>
          <template v-else-if="item.type=='showListCtrl'">
            <el-button type="primary" size="small" @click="dialogVisible=true">查看编辑</el-button>
          </template>
          <template v-else>
            <el-input
              v-model="curLayout[item.prop]"
              :type="item.type"
              :disabled="item.disabled || disabled"
            ></el-input>
          </template>

          <template v-if="item.prop=='floorTemplateName'">
            <el-row type="flex">
              <el-col
                v-for="templateModule in templateModuleList"
                :key="templateModule.templateName"
                v-if="templateModule.type==curLayout.floorType&&templateModule.themeEventMode == themeEventMode&&themeEventType==templateModule.themeEventType"
                @click.native="chooseTemplate(templateModule)"
                :class="{'is-active':templateModule.templateName == curLayout.floorTemplateName}"
              >
                {{templateModule.templateName}}
                <br />
                <img :src="templateModule.imgName" />
              </el-col>
            </el-row>
          </template>
        </el-form-item>
      </el-form>
      <product-config
        v-model="floorLayoutDetail"
        :floor-products="floorProducts"
        :floor-containers="floorContainers"
        :disabled="disabled"
        :type="curLayout.floorType"
      ></product-config>

      <div slot="footer">
        <el-button type="primary" @click="confirmSave">确定</el-button>
      </div>
    </el-dialog>

    <floor-container-config
      v-model="dialogVisible"
      @change="containerChange"
      :container="myContainer"
      :key="current"
      :disabled="disabled"
      @promotion-change="promotionChange"
      :type="curLayout.floorType"
      v-if="dialogVisible"
      :themeEventType="themeEventType"
    ></floor-container-config>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

import { fileUpload } from '../utils'
import { requireAll } from '../../../utils'
import floorContainerConfig from './floorContainerConfig.vue'
import inputFileUpload from '../../../components/inputFileUpload.vue'
import productConfig from './productConfig.vue'
import { status, myFloorTypes } from '../const/'

let moduleImgs = requireAll( ( require as any ).context( '../modules/template', true, /\.png$/ ) )

@Component( {
  name: 'layout-config',
  components: {
    floorContainerConfig,
    inputFileUpload,
    productConfig
  }
} )
export default class LayoutConfig extends Vue {
  @Prop()
  themeEventMode: number
  @Prop( { default: false } )
  disabled: boolean
  dialogVisible: boolean = false
  @Prop()
  value: boolean
  @Prop()
  themeEventType: number
  promotionChange ( v = [] ) {
    if ( v.length ) {
      let [ { title, name } ] = v
      if ( !this.curLayout.floorName ) {
        this.curLayout.floorName = title
      }
      if ( !this.curLayout.floorDesc ) {
        this.curLayout.floorDesc = name
      }
    }
  }
  radioChange ( prop, value ) {
    if ( prop == 'floorType' ) {
      this.curLayout.floorTemplateName = ''
    }
  }
  confirmSave () {
    this.$emit( 'save', this.curLayout )
    // this.isExpanded = false
  }
  @Prop( { default: () => { } } )
  layout: any
  nativeLayout = {}
  get curLayout () {
    return this.layout.componentId && this.layout || this.nativeLayout
  }
  initNativeFloorItem () {
    this.$emit( 'input', true )
    this.nativeLayout = {
      floorTemplateName: '',
      themeEventId: this.themeEventId,
      time: this.themeEventTime,
      status: 0
    }
  }
  get templateModuleList () {
    // 旧模板 兼容
    let filterList = [
      'pc/bursting2_0_1',
      'pc/timeLimitPrice2_0_1',
      'pc/fullGifts2_0_4'
    ]
    return Object.keys( moduleImgs ).filter( v => filterList.indexOf( v ) < 0 ).reduce( ( total, templateName ) => {
      let arr = templateName.split( '_' )
      let type = arr[ 2 ]
      let themeEventType = arr[ 1 ]
      return total.concat( {
        templateName,
        type,
        themeEventType,
        imgName: moduleImgs[ templateName ],
        themeEventMode: +( templateName.indexOf( 'app' ) == 0 )
      } )
    }, [] )
  }
  chooseTemplate ( templateModule ) {
    this.$set( this.curLayout, 'floorTemplateName', templateModule.templateName )
  }
  @Prop()
  themeEventId: number
  @Prop()
  themeEventTime: any[]
  @Prop()
  current: number
  uploadFile ( item, e ) {
    let { themeEventId } = this.curLayout

    try {
      fileUpload( this, e, { themeEventId }, this.fileUpdateCallBack, 0 )
    } catch ( e ) {
      console.log( e )
    }
  }
  get myProps () {
    return [
      { prop: 'floorType', label: '类型', type: 'radio', options: myFloorTypes },
      { prop: 'floorTemplateName', label: '模板', type: 'input', disabled: true },
      { prop: 'list', label: '楼层描述', type: 'showListCtrl' },
      { prop: 'floorName', label: '标题', type: 'input' },
      { prop: 'status', label: '状态', type: 'radio', options: status },
      { prop: 'floorDesc', label: '描述', type: 'textarea' },
      { prop: 'jumpLink', label: '跳转链接', type: 'input' },
      { prop: 'time', label: '活动时间', type: 'daterange' }
    ]
  }

  fileUpdateCallBack ( item ) {
    this.$set( this.curLayout, 'image', item.absolutePath )
  }
  containerChange ( item ) {
    this.$set( this.curLayout, 'floorProducts', item.floorProducts || [] )
    this.$set( this.curLayout, 'floorContainers', item.floorContainers || [] )

    delete item.floorProducts
    delete item.floorContainers
    this.$set( this.curLayout, 'floorLayoutDetail', item || {} )
  }

  get myContainer () {
    return {
      ...this.floorLayoutDetail,
      floorProducts: this.floorProducts,
      floorContainers: this.floorContainers,
      themeEventId: this.curLayout.themeEventId
    }
  }
  get floorLayoutDetail () {
    let floorLayoutDetail = this.curLayout.floorLayoutDetail || {}
    return floorLayoutDetail
  }
  get floorContainers () {
    return this.curLayout.floorContainers || []
  }
  get floorProducts () {
    return this.curLayout.floorProducts || []
  }
  confirmClose ( done ) {
    this.$confirm( '此操作将关闭弹窗，不会记录未保存的内容?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.$emit( 'cancel' )
      done()
    } )
  }
}
</script>
<style lang="stylus" scoped>
.layout-config
  padding 5px 10px 10px
  .el-icon-plus
    font-size 18px
  & > .el-button
    position fixed
    right 20px
    bottom 20px
    z-index 9999
  img
    width 50px
.is-active
  img
    box-shadow 0px 0px 5px #0a99f2
</style>
<style lang="stylus" >
.layout-config
  .el-dialog__body
    max-height 400px
    overflow auto
</style>