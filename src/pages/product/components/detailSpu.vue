<template>
  <StandardSpu
    class="product-detail-spu"
    :can-edit="false"
    :spu="spu"
    :title="spu.name"
    :visible="visible"
    :editable="tabName == 'merchant'&& $permissionValidate(503)"
    @save-spu="saveSpu"
    ref="standardSpu"
    v-model="value"
  >
    <!-- tabName/tabsChange 在 standardTabsChangeMixins 组件中  -->
    <StandardTabs slot="header-slot" @change="tabsChange" v-model="tabName"></StandardTabs>
    <template slot-scope="scope">
      <div
        class="extend-prop-group"
        v-for="extendProps in spuExtendProps"
        :key="extendProps.name"
        v-show="!visible"
      >
        <el-row class="extend-prop-name">{{extendProps.name}}</el-row>
        <el-row :gutter="30">
          <el-col :md="8" v-for="item in extendProps.props" :key="item.prop">
            <div class="item">
              <label>{{item.label}}:</label>
              <!-- 编辑 -->
              <template v-if="scope.isEdit && $permissionValidate(item.editPermission) ">
                <template v-if="item.prop =='needAptitude'">
                  <AptitudeConfig
                    :item="spu"
                    type="spu"
                    :is-edit="$permissionValidate(488)&&!spu.trusteeshipStoreId"
                    @handler-callback="saveSpu"
                  ></AptitudeConfig>
                </template>
                <template v-else-if="item.prop=='imgControl'">
                  <ImgConfig :item="spu" :is-edit="!spu.trusteeshipStoreId" :type="0"></ImgConfig>
                </template>
                <!-- TODO：是否存在有效资质 aptitudeStatus  假数据 -->
                <!-- aptitudeStatus 商品资质是否有效：0 - 无效；1 - 有效 -->
                <template v-else-if="item.prop =='aptitudeStatus'">{{spu.aptitudeStatus ? '是':'否'}}</template>
                <template v-else-if="item.prop =='negotiable'">
                  <el-select
                    v-model="spu.negotiable"
                    :disabled="!!spu.trusteeshipStoreId"
                    placeholder="请选择"
                    size="small"
                    filterable
                  >
                    <el-option
                      v-for="negotiable in negotiables"
                      :key="negotiable.id"
                      :label="negotiable.name"
                      :value="negotiable.id"
                    ></el-option>
                  </el-select>
                </template>
                <template v-else-if="item.prop =='channelType'">
                  <el-select v-model="spu.channelType" multiple placeholder="请选择">
                    <el-option
                      placeholder="请选择"
                      size="small"
                      v-for="item in channelTypes"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    ></el-option>
                  </el-select>
                </template>
                <template v-else-if="item.prop=='distributeWay'">
                  <el-select
                    v-model="trusteeshipStoreId"
                    placeholder="请选择"
                    size="small"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="store in storeList"
                      :key="store.storeId"
                      :label="store.storeName"
                      :value="store.storeId"
                    ></el-option>
                  </el-select>
                </template>
                <template v-else>
                  <el-input
                    v-model="spu[item.prop]"
                    :disabled="!!spu.trusteeshipStoreId"
                    size="small"
                    :type="['level0Price','level1Price','level2Price'].indexOf(item.prop)>-1?'number':'text'"
                  ></el-input>
                </template>
              </template>

              <template v-else>
                <!-- 查看 -->
                <template v-if="item.prop =='needAptitude'">
                  <AptitudeConfig
                    :item="spu"
                    type="spu"
                    :is-edit="false"
                    @handler-callback="saveSpu"
                  ></AptitudeConfig>
                </template>
                <template v-else-if="item.prop =='negotiable'">{{spu.negotiable ? '是':'否'}}</template>
                <template v-else-if="item.prop =='channelType'">{{dealChannelType(spu.channelType)}}</template>
                <template v-else-if="item.prop=='distributeWay'">{{spu.trusteeshipStoreName}}</template>
                <template v-else-if="item.prop=='imgControl'">
                  <ImgConfig :item="spu" :is-edit="false" :type="0"></ImgConfig>
                </template>
                <!-- TODO：是否存在有效资质 aptitudeStatus  假数据 -->
                <!-- aptitudeStatus 商品资质是否有效：0 - 无效；1 - 有效 -->
                <template v-else-if="item.prop =='aptitudeStatus'">{{spu.aptitudeStatus ? '是':'否'}}</template>
                <template v-else>
                  <el-tooltip
                    effect="light"
                    :content="`${spu[item.prop]}`"
                    placement="bottom-start"
                  >
                    <span>{{spu[item.prop]}}</span>
                  </el-tooltip>
                </template>
              </template>
            </div>
          </el-col>
        </el-row>
      </div>
    </template>
  </StandardSpu>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import API from '../../../API'
import StandardSpu from './standardSpu.vue'
import StandardTabs from './standardTabs.vue'
import AptitudeConfig from './aptitudeConfig.vue'
import ImgConfig from './imgConfig.vue'
import { spuExtendProps, needAptitudes, negotiables, channelTypes } from '../const'
import { debounce, matchArrItem } from '../../../utils/'
import standardTabsChangeMixins from '../mixins/standardTabsChange'
@Component( {
  name: 'product-detail-spu',
  mixins: [ standardTabsChangeMixins ],
  components: {
    StandardSpu,
    StandardTabs,
    AptitudeConfig,
    ImgConfig
  }
} )
export default class ProductDetailSpu extends Vue {
  // spu备份
  @Prop() value: any
  @Prop( { default: () => ( {} ) } ) spu: any

  // labels = [ '订购商品', '常备商品' ]
  needAptitudes = needAptitudes
  negotiables = negotiables
  channelTypes = channelTypes
  // get trusteeshipStoreId(){
  //   return this.spu.trusteeshipStoreId
  // }
  // spuExtendProps = spuExtendProps.filter(v=>this.$permissionValidate( v.visiblePermission))
  get trusteeshipStoreId () {
    return this.spu.trusteeshipStoreId || undefined
  }
  set trusteeshipStoreId ( storeId ) {
    let trusteeshipStore = this.storeList.find( store => store.storeId == storeId )
    this.spu.trusteeshipStoreName = trusteeshipStore && trusteeshipStore.storeName
    this.spu.trusteeshipStoreId = storeId || 0
  }
  get spuExtendProps () {
    let myProps = spuExtendProps.reduce( ( total, curr, index ) => {
      let { props } = curr
      if ( index === 0 && this.spu.distributeWay === 2 ) {
        props = [
          { prop: 'distributeWay', label: '托管配货', editPermission: 1130, visiblePermission: 1129 }
        ].concat( props )
      }
      props = props.filter( v => this.$permissionValidate( v.visiblePermission ) )

      if ( props.length === 0 ) {
        return total
      }
      total.push( {
        ...curr,
        props
      } )
      return total
    }, [] )
    return myProps
  }

  convartData ( value, prop ) {
    let arr = []
    switch ( prop ) {
      case 'needAptitude':
        arr = this.needAptitudes
        break
    }
    return matchArrItem( value, arr, 'id' ).name || '--'
  }

  saveSpu ( spuWithCallBack ) {
    if ( !spuWithCallBack ) {
      spuWithCallBack = this.spu
    }
    if ( !this.validateLevelPrice( this.spu ) ) return

    this.$emit( 'save-spu', spuWithCallBack )
  }
  validateLevelPrice ( spu ) {
    if (
      !+spu[ "level0Price" ] ||
      !+spu[ "level1Price" ] ||
      !+spu[ "level2Price" ]
    ) {
      this.$notify( {
        type: "error",
        message: "SPU折算率不能为0！"
      } )
      return false
    }
    return true
  }

  activated () {
    this.getStoreList()
  }
  storeList: any[] = []
  getStoreList () {
    this.$http( API.getTrusteeshipStoreInfo, {
      spuId: this.$route.params.id
    } ).then( ( { data } ) => {
      this.storeList = data.data
    } )
  }
  dealChannelType ( channelType ) {
    if ( !channelType || ( Array.isArray( channelType ) && !channelType.length ) ) return '';
    let channelTypeNames = '';
    channelType.forEach( item => {
      let channel = channelTypes.find( channel => channel.id === item );
      channelTypeNames += channel.name + '，';
    } );
    return channelTypeNames.substr( 0, channelTypeNames.length - 1 );
  }
}
</script>
<style lang="stylus" scoped>
.product-detail-spu
  position relative
.standard-tabs
  position absolute
  right 50px
  top 20px
.el-col
  line-height 34px
  .item
    font-size 12px
    min-height 40px
    label
      display block
      font-weight bold
      font-size 14px
    span
      display block
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
.el-select
  width 100%
.extend-prop-group
  margin-bottom 20px
  &:last-child
    margin-bottom 0
.extend-prop-name
  border-bottom 1px solid #eee
  padding-bottom 10px
</style>
