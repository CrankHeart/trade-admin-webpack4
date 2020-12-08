
<template>
  <div class="easy-condition-bar">
    筛选条件：
    <template v-for="item in myCondition" >
      <template v-if="item.type=='select'">
        <label @mouseenter="item.visible=true" @mouseleave="item.visible=false" :key="item.prop">
        <span>{{item.label}}</span>
         <i class="el-icon-caret-top"></i>
         <transition name="el-zoom-in-top">
           <ul v-if="item.visible">
            <li v-for="option in item.options" :key="option.id" @click="selectItemChange(option, item)" :class="{'is-active':option.id==item.value}">{{option.name}}</li>
          </ul>
         </transition>
      </label>
      </template>
      <template v-else-if="item.type=='checkbox'" >
        <el-checkbox v-model="item.value" @change="mySearch">
        {{item.label}}
      </el-checkbox>
      </template>
    </template>
  </div>
</template>
<script lang="ts">
  import Vue from 'vue'
  import { Component, Prop, Watch } from 'vue-property-decorator'
  import { matchArrItem } from '../utils/'
  class Condition {
    visible:boolean
    options:any[]
    label:string
    value:any
    prop:string
  }
  @Component({
    name: 'easy-condition-bar'
  })
  export default class EasyConditionBar extends Vue {
    @Prop()
    condition: any[]
    myCondition: Condition[] = []
    created(){
      this.condition.forEach( v=>{
        let o = Object.assign(
          {visible: false},
          v,
          v.type =='select' ? 
            {label: matchArrItem(v.value, v.options||[], 'id').name} :
            {}
        )
        this.myCondition.push(o)
      })
    }
    get option () {
      let o: any = {}
      this.myCondition.forEach( ({prop, value})=> {
        if(value !== null){
          o[prop] = value
        }
      })
      return o
    }
    selectItemChange({ id, name }, item){
      item.value = id
      item.label = name
      item.visible = false
      this.mySearch()
    }
    mySearch(){
      this.$emit('change', this.option)
    }
  }
</script>
<style lang="stylus">
.easy-condition-bar
  line-height 40px
  background #efefef
  font-size 14px
  padding 0 12px
  > label:not([class])
    min-width 100px
    display inline-block
    position relative
    ul
      position absolute
      left 0
      top 90%
      z-index 9
      line-height 30px
      background #fff
      padding 8px
      border 1px solid #dfe6ec
      li
        cursor pointer
        &.is-active
          color #20a0ff
    > span 
      color #20a0ff
      cursor pointer
    .el-icon-caret-top
      transform rotate(180deg) scale(.8)
      opacity .3
</style>