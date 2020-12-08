<template>
  <el-dialog title="提示" :visible.sync="dialogVisible" size="tiny" :before-close="handleClose">
    <div class="after-sales-logis" v-if="!!data.length">
      <div class="font-color-1">共{{data.length}}个包裹：</div>
      <div class="detail-info">
        <span>发货时间：</span>
        <span>{{ formatMyDate( data[0].createDate.time )}}</span>
      </div>
      <div class="detail-info">
        <span>发货方式：</span>
        <span>快递</span>
      </div>
      <div class="detail-info">
        <span>发货公司：</span>
        <span>{{data[0].companyName}}</span>
      </div>
      <div class="detail-info">
        <span>快递单号：</span>
        <div class="logisno-wrap">
          <p>
            <span
              v-for="(delivery,index) in data"
              :key="index"
              @click="doCopy(delivery.logisticNo)"
            >{{delivery.logisticNo}}</span>
          </p>
          <p class="font-color-2">(点击快递单号即可复制)</p>
        </div>
      </div>
      <a
        :href="logisUrl"
        v-if="data[0].companyId==9"
        target="blank"
        class="font-color-1"
      >去{{data[0].companyName}}查看详情></a>
      <div v-else>
        <ul>
          <li v-for="(logisticItem,index) in logisticInfo" :key="index" class="step-list">
            <span class="step-point"></span>
            <span>{{logisticItem.ftime}} {{logisticItem.context}}</span>
          </li>
        </ul>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from "vue-property-decorator"
import VueClipboard from 'vue-clipboard2'
Vue.use( VueClipboard )
@Component( {
  name: 'after-sales-logis'
} )
export default class AfterSalesLogis extends Vue {
  @Prop( { default: () => [] } ) data: any[]
  @Prop( { default: false } ) dialogVisible: boolean
  @Inject() formatMyDate

  logisUrl: string = 'http://www.sf-express.com/cn/sc/dynamic_function/waybill/'

  get logisticInfo () {
    let { companyId, logisticInfo } = this.data[ 0 ] || {}
    return companyId !== 9 && JSON.parse( logisticInfo || '[]' ) || []
  }

  handleClose () {
    this.$emit( 'update:dialogVisible', false )
  }

  formatMyDate2 ( time ) {
    return this.formatMyDate( new Date( time ), 'yyyy/MM/dd hh:mm:ss' )
  }

  doCopy ( logisticNo = '' ) {
    this.$copyText( logisticNo ).then(
      () => this.$notify( {
        message: '复制成功',
        type: 'success'
      } ),
      () => this.$notify.error( {
        message: '复制失败'
      } )
    )

  }
  created () {
    console.log( this.data )
  }
}
</script>
<style lang="stylus" scoped>
.flex-nowrap {
  display: flex;
  flex-wrap: nowrap;
}

.after-sales-logis {
  @extend .flex-nowrap;
  flex-direction: column;
  padding: 12px;

  &:last-child {
    flex: 1;
  }
}

.detail-info {
  line-height: 17px;
  margin-bottom: 6px;
  color: #2e4050;
  @extend .flex-nowrap;

  >span {
    &:first-child {
      flex-basis: 70px;
    }
  }
}

.logisno-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;

  p {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  span {
    margin-right: 5px;
    cursor: pointer;
  }
}

.font-color-1 {
  color: #666666;
}

.font-color-2 {
  color: $darkGray;
}

.step-list {
  line-height: 17px;
  color: #999;
  font-size: 12px;
  display: flex;
  padding-bottom: 14px;
  position: relative;

  &:last-child {
    .step-point {
      &:after {
        height: 0;
      }
    }
  }

  &:first-child {
    color: #2E4050;

    .step-point {
      background: #F5A623;
    }
  }
}

.step-point {
  width: 7px;
  height: 7px;
  background: #bbb;
  border-radius: 50%;
  display: inline-block;
  margin: 4px 10px 0 0;
  z-index: 10;

  &:after {
    position: absolute;
    left: 3px;
    top: 11px;
    content: '';
    width: 1px;
    height: 100%;
    clear: both;
    display: inline-block;
    background: #ddd;
  }
}
</style>
