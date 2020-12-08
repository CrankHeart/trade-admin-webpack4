<template>
  <div class="dataset">
    <lc-title v-if="dataSet.title" :text="dataSet.title"></lc-title>
    <div v-if="queryFields" class="query">
      <lc-dataset :dataset="queryFields"></lc-dataset>
      <div class="button-place">
        <slot name="table-top"></slot>
        <el-button @click="reset">重置</el-button>
        <el-button @click="search" type="primary">搜索</el-button>
      </div>
    </div>

    <slot name="table-center"></slot>

    <div
      v-if="dataSet.visibleCtr"
      class="table-config-control"
      :class="{'is-unfolded':showContrlFlag}"
      @mouseenter="toggleVisible(true)"
      @mouseleave="toggleVisible(false)"
    >
      <div class="table-config-control-wrapper">
        <el-tooltip effect="dark" content="点击控制 【表格控制组件】显隐，勾选控制下方表格显示列" placement="top-start">
          <i class="icon-list"></i>
        </el-tooltip>

        <transition name="el-zoom-in-top">
          <el-checkbox-group v-if="showContrlFlag" v-model="showFields" size="small">
            <el-checkbox
              v-for="item in contrlFields"
              :label="item.key"
              :key="item.key"
            >{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </transition>
      </div>
    </div>

    <el-table
      :fit="dataSet.config.fit"
      :data="dataSet.records"
      stripe
      border
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column
        v-if="dataSet.config.checkType==='checkBox'"
        type="selection"
        fixed
        width="55"
      ></el-table-column>
      <el-table-column v-if="dataSet.config.checkType==='radio'" fixed width="55">
        <template slot-scope="{$index}">
          <div style="margin-left: -8px">
            <el-checkbox
              v-model="dataSet.records[$index].checked"
              @change="radioCheckChange($index)"
            ></el-checkbox>
          </div>
        </template>
      </el-table-column>
      <template v-for="(field,i) in fields">
        <el-table-column
          :fixed="field.fixed===true?true:false"
          :width="field.width || dataSet.config.fieldWidth"
          :prop="field.key"
          :label="field.name"
          :key="field.key"
          v-if="field.show !== false && (!dataSet.visibleCtr || visibleFields[field.key])"
        >
          <template slot-scope="{$index}">
            <lc-field :field="dataSet.records[$index].fields[i]"></lc-field>
          </template>
        </el-table-column>
      </template>
      <el-table-column
        v-if="options && (!dataSet.visibleCtr || visibleFields['options'])"
        fixed="right"
        label="操作"
        :width="dataSet.config.optionWidth || '160px'"
      >
        <template slot-scope="{$index}">
          <template v-for="option in options">
            <el-button
              size="mini"
              class="button"
              :key="option.name"
              :style="option.style"
              :type="option.type || 'primary'"
              v-if="showButton(option.show,$index)"
              @click="emitClick(option.event,$index)"
            >{{option.name}}</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <slot name="table-bottom"></slot>
    <div v-if="dataSet.config.page" class="table-pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="dataSet.currentPage"
        :page-sizes="dataSet.sizes"
        :page-size="dataSet.size"
        layout="total, jumper, prev, pager, next, sizes"
        :total="dataSet.total"
      ></el-pagination>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    dataSet: {
      default() {
        return "";
      }
    }
  },
  data() {
    return {
      queryFields: '',
      showContrlFlag: false,
      showFields: []
    }
  },
  computed: {
    fields() {
      return this.dataSet.config.record.fields
    },
    options() {
      return this.dataSet.config.record.options
    },
    contrlFields() {
      let arr = []
      this.fields.forEach( field => {
        let item = { key: field.key, name: field.name }
        arr.push( item )
      } );
      if ( this.options && this.options.length > 0 ) {
        let item = { key: 'options', name: '操作' }
        arr.push( item )
      }
      return arr
    },
    visibleFields() {
      let obj = {}
      this.showFields.forEach( field => {
        obj[ field ] = true
      } )
      return obj
    }
  },
  methods: {
    handleSizeChange( n ) {
      this.dataSet.size = n
      this.search()
    },
    handleCurrentChange( n ) {
      this.dataSet.currentPage = n
      this.search()
    },
    emitClick( event, index ) {
      this.dataSet.emit( event, this.dataSet.records[ index ], index )
    },
    handleSelectionChange( val ) {
      this.dataSet.selected = val;
    },
    reset() {
      this.queryFields.reset()
      this.dataSet.queryFields = this.queryFields.value
    },
    search() {
      this.dataSet.query()
    },
    showButton( fn, index ) {
      if ( fn === undefined ) {
        return true
      }
      if ( fn instanceof Function ) {
        return fn( this.dataSet.records[ index ] )
      }
      return fn
    },
    toggleVisible( boo ) {
      this.showContrlFlag = boo
    },
    initShowFields() {
      let arr = []
      this.contrlFields.forEach( field => {
        arr.push( field.key )
      } )
      this.showFields = arr
    },
    radioCheckChange( index ) {
      this.dataSet.selected = this.dataSet.records[ index ].value
      this.dataSet.records.forEach( ( record, i ) => {
        if ( i != index ) {
          record.checked = false
        }
      } )
    }
  },
  created() {
    let config = this.dataSet.config.queryFields
    if ( config ) {
      if ( !config.layout ) {
        config.layout = {
          gutter: 20,
          xs: 24,
          sm: 12,
          lg: 8
        }
      } else {
        config.layout = {
          gutter: config.layout.gutter || 20,
          xs: config.layout.xs || 24,
          sm: config.layout.sm || config.layout.xs || 12,
          lg: config.layout.lg || config.layout.sm || config.layout.xs || 8
        }
      }
      this.queryFields = this.$dataSet( config )
      this.queryFields.value = {}
      this.dataSet.queryDs = this.queryFields
    }
    if ( this.dataSet.visibleCtr ) {
      this.initShowFields()
    }
  }
};
</script>

<style lang="stylus">
.el-table__fixed
  height 100% !important
.el-table__fixed-right
  height 100% !important
</style>

<style lang="stylus" scoped>
.dataset
  padding 5px
.button
  color white
.button-place
  text-align right
.table-pagination
  text-align center
  padding-top 10px
.query
  margin-bottom 10px
</style>

<style lang="stylus" scoped>
.table-config-control
  position relative
  z-index 99
.el-checkbox-group
  width 300px
  display flex
  border 1px solid #dfe6ec
  background #fff
  padding 20px 0 8px
  transform scale(0.9)
  transform-origin left top
  max-height 400px
  overflow auto
  flex-wrap wrap
.icon-list
  width 16px
  height 16px
  position absolute
  left 3px
  top 3px
  z-index 99
  background url('../../../assets/images/icon-list.png')
  font-size 12px
  cursor pointer
.table-config-control-wrapper
  position absolute
  left 0
  top 0
  line-height 32px
.el-checkbox
  display block
  width 150px
  padding 0 8px
  box-sizing border-box
  flex-shrink 0
  +.el-checkbox
    margin-left 0
[class*='el-icon']
  &:before
    line-height 32px
    margin-right 10px
    cursor pointer
</style>