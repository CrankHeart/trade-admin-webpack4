<template>
  <div class="theme-event-basic-info">
    <h4>基础信息配置</h4>
    <el-form label-width="100px">
      <el-form-item v-for="item in basicInfoArr" :key="item.prop" :label="item.label">
        <template v-if="item.type=='radio'">
          <el-radio-group v-model="value[item.prop]" :disabled="disabled">
            <el-radio v-for="option in item.options" :key="option.id" :label="option.id">{{option.name}}</el-radio>
          </el-radio-group>
        </template>

        <template v-else-if="item.type=='select'">
          <el-select v-model="value[item.prop]" :disabled="disabled">
            <el-option v-for="option in item.options" :key="option.id" :value="option.id" :label="option.name">{{option.name}}</el-option>
          </el-select>
        </template>

        <template v-else-if="item.type=='switch'">
          <el-switch v-model="value[item.prop]" :disabled="disabled" on-text="on" off-text="off"></el-switch>
        </template>

        <template v-else-if="item.type=='daterange'">
          <el-date-picker v-model="value[item.prop]" :disabled="disabled" type="daterange" placeholder="选择日期范围"> </el-date-picker>
        </template>

        <template v-else-if="item.type=='fileUpload'">
          <span class="file-upload">
            <input-file-upload @change="uploadFile(item.prop,$event)" :disabled="disabled">
              <el-button type="primary" size="small">点击上传</el-button>
            </input-file-upload>
            <template v-if="value[item.prop]">
              {{value[item.prop]}}
              <i class="el-icon-circle-close" style="cursor:pointer;" @click="delBackgroundPicture"></i>
            </template>

          </span>
        </template>
        <template v-else-if="item.type=='colorPicker'">
          <el-color-picker v-model="value[item.prop]" show-alpha :disabled="disabled"></el-color-picker>
          {{value[item.prop]}}
        </template>

        <template v-else>
          <el-input v-model="value[item.prop]" :type="item.type" :disabled="disabled" :key="item.prop" />
        </template>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="$emit('save')">保存</el-button>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { themeEventTypes, themeEventModes, status } from '../const'
import inputFileUpload from '../../../components/inputFileUpload.vue'
import { fileUpload } from '../utils'
@Component( {
  name: 'theme-event-basic-info',
  components: {
    inputFileUpload
  }
} )
export default class ThemeEventBasicInfo extends Vue {
  @Prop()
  disabled: boolean
  get themeEventId (): number {
    return this.value.themeEventId
  }
  @Prop()
  value: any
  get basicInfoArr (): any[] {
    return [
      { prop: 'themeEventName', label: '活动名称', type: 'input' },
      { prop: 'themeEventDesc', label: '活动描述', type: 'textarea' },
      { prop: 'themeEventMode', label: '适配客户端', type: 'radio', options: themeEventModes },
      // { prop: 'jumpLink', label: '自定义地址', type: 'input' },
      { prop: 'themeEventTime', label: '活动时间', type: 'daterange' },
      { prop: 'status', label: '活动状态', type: 'radio', options: status },
      { prop: 'themeEventType', label: '活动类型', type: 'radio', options: themeEventTypes },
      // { prop: 'backgroundColor', label: '背景色调', type: 'colorPicker' }
    ].concat( this.themeEventId ? [
      { prop: 'backgroundPicture', label: '背景图片', type: 'fileUpload' }
    ] : [] )
  }
  created () {
    this.basicInfoArr.forEach( ( { prop } ) => {
      this.$set( this.value, prop, '' )
    } )
  }
  delBackgroundPicture () {
    this.value.backgroundPicture = ''
  }
  fileUpdateCallBack ( prop ) {
    return ( data ) => {
      this.value[ prop ] = data.absolutePath
    }
  }
  uploadFile ( prop, e ) {
    try {
      fileUpload( this, e, { themeEventId: this.themeEventId }, this.fileUpdateCallBack( prop ), 1 )
    } catch ( e ) {
      console.log( e )
    }
  }

}
</script>

