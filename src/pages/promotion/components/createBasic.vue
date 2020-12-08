<template>
  <div class="promotiom-create-basic-info box">
    <h3>基础信息录入</h3>
    <hr/>
    <el-form label-width="100px" :model="value" :rules="rules" ref="promotionBasic">
      <el-form-item label="发起时间" prop="startDate">
        <el-date-picker :disabled="isDetail" clearable v-model="value.startDate" :pickerOptions="startOptions" type="date" :editable="false" placeholder="选择开始日期">
        </el-date-picker>
        <el-time-select :disabled="isDetail" v-model="value.startTime" :editable="false" :picker-options="timeOptions" placeholder="选择开始时间">
        </el-time-select>
      </el-form-item>
      <el-form-item label="结束时间" prop="endDate">
        <el-date-picker :disabled="isDetail" clearable v-model="value.endDate" :pickerOptions="endOptions" type="date" :editable="false" placeholder="选择结束日期">
        </el-date-picker>

        <el-time-select :disabled="isDetail" v-model="value.endTime" :editable="false" :picker-options="timeOptions" placeholder="选择结束时间">
        </el-time-select>
      </el-form-item>
      <el-form-item label="促销名称" prop="name">
        <el-input :disabled="isDetail" v-model="value.name" placeholder="请选择"></el-input>
      </el-form-item>
      <el-form-item label="促销标题" prop="title">
        <el-input :disabled="isDetail" v-model="value.title" placeholder="请选择"></el-input>
      </el-form-item>
      <el-form-item label="权重" prop="priority">
        <el-input :disabled="isDetail" v-model="value.priority" placeholder="请选择"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
@Component( {
  name: 'promotiom-create-basic-info'
} )
export default class PromitionCreateBasicInfo extends Vue {
  @Prop()
  isDetail: boolean
  @Prop( { default: () => { } } )
  value: any
  startOptions = {
    disabledDate: ( time ) => {
      let end = this.value.endDate
      return end && time.getTime() > new Date( end );
    }
  }
  endOptions = {
    disabledDate: ( time ) => {
      let start = this.value.startDate
      return start && time.getTime() < new Date( start );
    }
  }
  checkAge = ( rule, value, callback ) => {
    if ( value === '' ) {
      callback( new Error( '请输入权重值' ) );
    } else if ( Number( value ) !== Number( value ) ) {
      callback( new Error( '权重值必须为数字' ) )
    } else if ( value > 100 ) {
      callback( new Error( '权重值上限为100' ) )
    } else {
      callback();
    }
  }
  rules = {
    startDate: [
      { type: 'date', required: true, trigger: 'submit', message: '请输入促销开始时间' }
    ],
    endDate: [
      { type: 'date', required: true, trigger: 'submit', message: '请输入促销结束时间' } ],
    title: [
      { required: true, trigger: 'submit', message: '请输入促销活动标题' },
      { max: 40, trigger: 'change', message: '促销活动标题最多输入20个字哦！' }
    ],
    name: [
      { required: true, trigger: 'submit', message: '请输入促销后台展示标题' }
    ],
    priority: [
      { validator: this.checkAge, trigger: 'submit,change', message: '请输入权重，且为数字，上限100' }
    ],
  }
  timeOptions = {
    start: '00:00',
    step: '00:30',
    end: '24:00'
  }
  validate () {
    let myForm: any = this.$refs[ 'promotionBasic' ]
    let bo = true
    myForm.validate( ( valid ) => {
      if ( !valid ) {
        this.$notify( {
          type: 'error',
          message: '请确认基础信息填写无误！'
        } )
        bo = false
      }
    } )
    return bo
  }
}

</script>