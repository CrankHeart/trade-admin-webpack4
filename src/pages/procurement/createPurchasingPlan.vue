<template>
  <div id="create-purchasing-plan">
    <lc-title text="新建采购计划" >
        <slot>
        <el-button type="primary" @click="confirmCreate"  class="pull-right" >确认新建</el-button>
      </slot>
    </lc-title>
    <template>
      <el-form
        :model="createPurchasingForm"
        ref="createPurchasingForm"
        :rules="rules"
        label-width="100px"
      >
          <el-col :lg="24" :xs="24" :sm="24">
          <el-form-item label="计划名称" prop="planName" style="width: 292px;" required >
            <el-input v-model="createPurchasingForm.planName" placeholder="请输计划名称"></el-input>
          </el-form-item>
            </el-col>
             <el-col :lg="8" :xs="24" :sm="12">
          <el-form-item label="开始时间" prop="startDate" required>
            <el-date-picker
              v-model="createPurchasingForm.startDate"
              type="date"
              placeholder="请输入开始时间"
            ></el-date-picker>
          </el-form-item>
             </el-col>
              <el-col :lg="8" :xs="24" :sm="12">
          <el-form-item label="结束时间" prop="endDate" required>
            <el-date-picker v-model="createPurchasingForm.endDate" type="date" placeholder="请输入结束时间"></el-date-picker>
          </el-form-item>
              </el-col>
          <!-- <el-form-item>
          <el-button type="primary" @click="confirmCreate" size="small">确认新建</el-button>
          </el-form-item> -->

 </el-form>
    </template>
    <div style="width:100%;clear:both;"></div>
    <purchasing-plan-details-unstarted-table
      currentPage="createPurchasingPlan"
      @updatePanelData="updatePanelData"    />

  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import purchasingPlanDetailsUnstartedTable from './components/purchasingPlanDetailsUnstartedTable.vue'
import lcTitle from '../../components/title.vue'

import API from '../../API'

@Component( {
  name: 'create-purchasing-plan',
  components: {
    lcTitle,
    purchasingPlanDetailsUnstartedTable
  }
} )
export default class CreatePurchasingPlan extends Vue {
  @Inject() formatMyDate
  createPurchasingForm = {
    planName: '',
    startDate: '',
    endDate: ''
  }
  rules = {
    planName: [
      { required: true, message: '请输计划名称', trigger: 'change' }
    ],
    startDate: [
      { type: 'date', required: true, message: '请选择开始日期', trigger: 'change' }
    ],
    endDate: [
      { type: 'date', required: true, message: '请选择结束日期', trigger: 'change' }
    ]
  }
  updatePanelData () {
    // this.getPurchasingInfo( this.purchasePlanId )
  }
  getPurchasingInfo ( id ) {
    // this.$http( API.getPurchasePlanById, { id } ).then( ( { data, data: { plan } } ) => {
    //   // plan = !!plan ? plan : {}
    //   if ( this.purchasePlanStatu == 2 ) {
    //     this.purchasingPlanPanelData = {
    //       ...plan,
    //       purchasingDetailsData: this.getProportionImgConfig( plan )
    //     }
    //   } else {
    //     this.purchasingPlanPanelData = plan
    //   }
    //   if ( plan.status && this.$route.query.status != plan.status ) {
    //     this.$router.push( { path: '/procurement/purchasingPlanDetails', query: { id: this.purchasePlanId, status: plan.status.toString() } } )
    //   }
    // } )
  }
  confirmCreate () {
    this.$refs[ 'createPurchasingForm' ].validate( ( valid ) => {
      if ( valid ) {
        this.$http( API.addPurchasePlanPlan, this.createPurchasingForm ).then( ( { data } ) => {
          this.$notify( {
            type: 'success',
            message: data.msg || '新建成功'
          } )
          this.$router.push( '/procurement/purchasingPlanTypeList' )
        } ).catch( ( { data: err } ) => {
          this.$notify( {
            type: 'error',
            message: err.msg || '新建失败'
          } )
        } )
      } else {
        this.$notify( {
          type: 'error',
          message: '提交失败'
        } )
        return false;
      }
    } );
  }
  deactivated () {
    this.$destroy()
  }
}
</script>
<style lang="stylus" scoped></style>
