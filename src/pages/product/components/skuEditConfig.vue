<template>
  <span>
    <template v-if="prop == 'goodLabel'">
      <!-- 商品标签 -->
      <el-select v-model="item.goodLabel" size="small">
        <el-option
          v-for="option in goodLabels"
          :key="option.id"
          :label="option.name"
          :value="option.id"
        ></el-option>
      </el-select>
    </template>
    <!-- TODO 下期迭代使用  -->
    <template v-else-if="prop == 'oversold'">
      <el-select
        v-model="item.oversold"
        size="small"
        clearable
        @input="handleOversoldChange(item,$event)"
      >
        <el-option
          v-for="option in oversolds"
          :key="option.id"
          :label="option.name"
          :value="option.id"
        ></el-option>
      </el-select>
    </template>
    <template v-else-if="prop == 'purchaseLimit'">
      <el-row :gutter="20">
        <el-col :span="3">
          <!-- {{item.switchValue}}---{{item.purchaseLimit}} -->
          <el-tooltip :content="`${item.switchValue?'限量':'不限量'}`" placement="top">
            <el-switch
              v-model="item.switchValue"
              on-text="限量"
              off-text="不限"
              on-color="#13ce66"
              off-color="#ff4949"
              @change="handleSwitchChange"
            ></el-switch>
          </el-tooltip>
        </el-col>
        <el-col :span="6">
          <!-- :min="1"  限购为0就是不能卖了  -->
          <!-- <el-input v-model="input" placeholder="请输入内容"></el-input> -->
          <!-- <el-input :disabled="isAllDisabled" type="number" size="small" v-model.trim="item[prop]"></el-input> -->
          <el-input
            style="height:30px;"
            v-show="item.switchValue"
            v-model="item.purchaseLimit"
            @input.native="handleChangePurchaseLimit"
            placeholder="可订购数量"
            size="small"
          ></el-input>
        </el-col>
      </el-row>
    </template>
    <template v-else-if="prop == 'isVirtual'">
      <el-select v-model="item.isVirtual" size="small">
        <el-option
          v-for="option in isVirtuals"
          :key="option.id"
          :label="option.name"
          :value="option.id"
        ></el-option>
      </el-select>
    </template>

    <template v-else-if="prop == 'skuType'">
      <sku-virtural-config
        :isAllDisabled="isAllDisabled"
        :item="item"
        :is-edit="true"
        :key="item.id"
      ></sku-virtural-config>
    </template>

    <template v-else-if="prop == 'needAptitude'">
      <aptitude-config
        type="sku"
        :item="item"
        :is-edit="$permissionValidate(488)&&true"
        :key="item.lcCode"
        @handler-callback="$emit('save-sku',item)"
      ></aptitude-config>
    </template>
    <template v-else-if="prop == 'isCash'">
      <!-- 必须现款购买 -->
      <el-select v-model="item.isCash" size="small">
        <el-option
          v-for="option in isCashs"
          :key="option.id"
          :label="option.name"
          :value="option.id"
        ></el-option>
      </el-select>
    </template>
    <template v-else-if="prop == 'imgControl'">
      <img-config :item="item" :type="1" :is-edit="true" :key="item.lcCode"></img-config>
    </template>
    <template v-else-if="prop == 'activityEndTime'">
      <el-date-picker
        v-model="item[prop]"
        :clearable="false"
        :editable="false"
        size="small"
        type="date"
        placeholder="选择日期"
      ></el-date-picker>
    </template>
    <template v-else-if="prop == 'goodStatus'">
      <!-- 上架状态 -->
      <el-select v-model="item.goodStatus" size="small" @change="changeGoodStatus( item )">
        <el-option
          v-for="option in goodStatuses"
          :key="option.id"
          :label="option.name"
          :value="option.id"
        ></el-option>
      </el-select>
      <br />
      <template v-if="item.goodStatus===3">
        缺货理由：
        <br />
        <el-input v-model="item.shortageReason" size="small"></el-input>
      </template>
    </template>
    <template v-else-if="prop == 'isInCatalogue'">
      <!-- 是否入册 -->
      <el-select v-model="item.isInCatalogue" size="small">
        <el-option
          v-for="option in catalogueType"
          :key="option.id"
          :label="option.name"
          :value="option.id"
        ></el-option>
      </el-select>
    </template>
    <template v-else-if="prop == 'whileStocksLast'">
      <!-- 是否售完即止 -->
      <el-tooltip content="是:库存为零时商品下架,否:超出库存还可以继续卖" placement="top">
        <el-select
          v-model="item.whileStocksLast"
          @input="whileStocksLastChange(item,$event)"
          size="small"
        >
          <el-option
            v-for="option in whileStocksLasts"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          ></el-option>
        </el-select>
      </el-tooltip>
    </template>
    <template
      v-else-if="'level0Price,level1Price,level2Price'.indexOf(prop)>-1"
    >{{formatPrice(item.salesPrice,prop)}}</template>
    <template v-else-if="prop === 'stock'">
      <el-input :disabled="isAllDisabled" type="number" size="small" v-model.trim="item[prop]"></el-input>
    </template>
    <template v-else-if="prop === 'remark'">
      <el-input type="textarea" :max="300" v-model.trim="item[prop]"></el-input>
    </template>
    <template v-else>
      <el-input
        size="small"
        v-model.trim="item[prop]"
        :disabled="prop=='lcCode'"
        :type="'saledNumber,settlePrice,salesPrice,activityPrice'.indexOf(prop)>-1 ? 'number':'text'"
      />
    </template>
  </span>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { goodStatuses, catalogueType, goodLabels, whileStocksLasts, isVirtuals, isCashs, oversolds } from '../const'

import skuVirturalConfig from './skuVirturalConfig.vue'
import imgConfig from './imgConfig.vue'
import aptitudeConfig from './aptitudeConfig.vue'
import { matchArrItem } from '../../../utils/'
@Component( {
  name: 'sku-edit-config',
  components: {
    skuVirturalConfig,
    aptitudeConfig,
    imgConfig,
  }
} )
export default class SkuEditConfig extends Vue {
  // @Prop()  item: any
  // @Prop( { type: Object, default: () => ( { purchaseLimit: -1 } ) } ) item: any
  @Prop( { type: Object, default: () => ( {} ) } ) item: any
  @Prop() spu: any
  @Prop() prop: string
  isCashs = isCashs
  goodStatuses = goodStatuses
  catalogueType = catalogueType
  goodLabels = goodLabels
  oversolds = oversolds
  whileStocksLasts = whileStocksLasts
  isVirtuals = isVirtuals

  switchValue: boolean = false;

  mounted () {
    this.switchValue = this.item.purchaseLimit == -1 ? false : true;
    console.log( "mounted ", { ...this.item } );
  }
  handleSwitchChange ( newValue ) {
    console.log( "handleSwitchChange", newValue );

    const { oldPurchaseLimit } = this.item;
    // this.item.purchaseLimit = newValue ? 1 : -1;
    this.item.purchaseLimit = oldPurchaseLimit;
    console.log( "set purchaseLimit", newValue, this.item.purchaseLimit );
  }
  // handleChangePurchaseLimit ( value ) {
  //   console.log( "handleChange", value );
  //   this.item.purchaseLimit = value;
  // }

  handleChangePurchaseLimit ( ev ) {
    this.$nextTick( () => {
      let val = ev.target.value.replace( /[^0-9.]/g, '' );
      this.item.purchaseLimit = val;
    } )
  }

  // get switchValue (): boolean {
  //   console.log( "item:", this.item );

  //   // purchaseLimit //订购商品限购数量：-1表示不限购  
  //   let res = this.item.purchaseLimit == -1 ? false : true;
  //   console.log( "get:", res );

  //   return res;
  // }

  // // set 的用法
  // set switchValue ( newValue: boolean ) {
  //   this.item.purchaseLimit = newValue ? 1 : -1;
  //   console.log( "set switchValue", newValue, this.item.purchaseLimit );
  // }

  formatPrice ( price = 0, type ) {
    let rate = this.spu[ type ] || 1
    let result = price * rate
    let scale = result >= 50 ? 1 : 10
    return ( Math.round( result * scale ) / scale ).toFixed( 2 )
  }

  // TODO 暂时没有sku list默认展开的情况们，不用担心异步item的数据拿不到
  deepItem = this.item && JSON.parse( JSON.stringify( this.item ) )

  get isAllDisabled () {
    return ( [ 1, 2, 4 ] as any ).includes( this.deepItem.skuType )
  }

  convertData ( value, prop ) {
    let arr = []
    switch ( prop ) {
      case 'goodLabel':
        arr = goodLabels
        break
      case 'goodStatus':
        arr = goodStatuses
        break
      case 'whileStocksLast':
        arr = whileStocksLasts
        break
    }
    return matchArrItem( value, arr, 'id' ).name || '--'
  }

  handleOversoldChange ( item, value ) {
    console.log( "handleOversoldChange:", item, value );
    // 是否售完即止 whileStocksLasts 否0/是1
    // 售完即止的商品不允许超卖 
    // goodLabel 常备商品为:1 
    let { whileStocksLast, goodLabel, oversold } = this.item;
    if ( whileStocksLast == 1 && goodLabel == 1 ) {
      // 不允许超卖
      this.item.oversold = 0;
      this.$notify( {
        type: 'error',
        message: '售完即止的商品不允许超卖'
      } )
    }
  }
  whileStocksLastChange ( item, value ) {
    // 是否售完即止 whileStocksLasts 否0/是1
    // 售完即止的商品不允许超卖
    if ( value == 1 ) {
      let { goodLabel, oversold } = this.item;
      // 常备商品为:1 
      if ( goodLabel == 1 ) {
        // 不允许超卖
        this.item.oversold = 0;
        this.$notify( {
          type: 'error',
          message: '售完即止的商品不允许超卖'
        } )
      }
    }

    console.log( "whileStocksLastChange:", item, value );
    if ( value && !+item.stock && item.skuType == 1 ) {
      this.$notify( {
        type: 'error',
        message: '不能将库存为0的虚拟商品设置为【售完即止】'
      } )
      value = 0
    }
    item.whileStocksLast = value
  }
  changeGoodStatus ( item ) {
    // this.$message() item.goodStatus
    const stopSaleConfirm = () => {
      const h = this.$createElement;
      this.$msgbox( {
        title: '消息',
        message: h( 'textarea', {
          attrs: {
            rows: 3
          },
          style: {
            border: '1px solid #eee',
            borderRadius: '4px',
            width: '100%',
            padding: '12px',
            boxSizing: 'border-box'
          }
        }, item.shortageReason ),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: ( action, instance, done ) => {
          if ( action === 'confirm' ) {
            let textareaVN = instance.$slots.default[ 0 ]
            let value = textareaVN.elm.value.trim()
            if ( value ) {
              item.shortageReason = value
            }
            done()
          } else {
            done()
          }
        }
      } ).then( action => {

      } )
    }
    const isInCatalogue = item.isInCatalogue
    if ( isInCatalogue && item.goodStatus !== 0 ) {
      this.$confirm( `该商品已入册，确定${item.goodStatus != 3 ? '下架' : '停售'}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      } ).then( () => {
        if ( item.goodStatus == 3 ) {
          stopSaleConfirm()
        }
      }, () => {
        item.goodStatus = 0
      } )
    } else if ( item.goodStatus == 3 ) {
      stopSaleConfirm()
    }

  }
}
</script>
