<template>
  <div class="role-permission-menu box" style="height:600px;">
    <ul>
      <li v-for="item0 in menuList" :key="item0.id">
        <p @click="toggleExpand(item0)" :class="{'is-expand':expandIds[item0.id]}">
          <i class="el-icon-caret-right" v-if="item0.children"></i>
          <el-checkbox :disabled="disabled" v-model="value[item0.id]" @click.stop @input="itemCheck(item0,$event)"></el-checkbox>
          {{item0.name}} 
        </p>
        <ul v-if="item0.children && expandIds[item0.id]">
          <li v-for="item1 in item0.children" :key="item1.id">
            <p @click="toggleExpand(item1)" :class="{'is-expand':expandIds[item1.id]}">
              <i class="el-icon-caret-right" v-if="item1.children"></i>
              <el-checkbox :disabled="disabled" v-model="value[item1.id]" @click.stop @input="itemCheck(item1,$event)"></el-checkbox>
              {{item1.name}}
            </p>
            <ul v-if="item1.children && expandIds[item1.id] ">
              <li v-for="item2 in item1.children" :key="item2.id">
                <p>
                  <el-checkbox :disabled="disabled" v-model="value[item2.id]" @click.stop @input="itemCheck(item2,$event)"></el-checkbox>
                  {{item2.name}}
                </p>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component( {
  name: 'role-permission-menu'
} )
export default class RolePermissionMenu extends Vue {
  @Prop( { default: () => ( {} ) } )
  value: any
  @Prop()
  tree: any
  @Prop()
  disabled: boolean
  get menuList () {
    let menuArr = this.tree[ 0 ]
    return menuArr
  }
  expandIds: any = {}

  toggleExpand ( item ) {
    this.$set( this.expandIds, item.id, !this.expandIds[ item.id ] )
  }
  // itemChange ( item ) {
  //   let { grade0Id, grade1Id,id } = item
  //   let value = this.value[id]
  //   console.log( 'change', item, value )
  //   if ( value ) {
  //     if ( grade0Id ) {
  //       this.$set( this.value, grade0Id, true )
  //     }
  //     if ( grade1Id ) {
  //       this.$set( this.value, grade1Id, true )
  //     }
  //   }
  // }
  itemCheck ( item, value ) {

    let { grade0Id, grade1Id, id, grade } = item
    this.$set( this.value, id, value )
    if ( grade == 0 || !value ) {
      let children = item.children || []
      children.forEach( val => {
        this.itemCheck( val, value )
      } )
    }

    if ( value ) {
      if ( grade0Id ) {
        this.$set( this.value, grade0Id, true )
      }
      if ( grade1Id ) {
        this.$set( this.value, grade1Id, true )
      }
    } else {
      if ( grade1Id ) {
        let o = this.tree[ 1 ]
        let children = o[ grade1Id ].children || []
        this.$set( this.value, grade1Id, children.some( v => this.value[ v.id ] ) )
      }
      if ( grade0Id ) {
        let o = this.tree[ 0 ]
        let children = o[ grade0Id ].children || []
        this.$set( this.value, grade0Id, children.some( v => this.value[ v.id ] ) )
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
// .box
//   height 600px
//   overflow auto
li
  cursor pointer
ul
  padding-left 20px
.el-icon-caret-right
  float left
  margin-left -20px
  margin-top 10px
  transform rotate(0)
  // transition all .3s
.is-expand
  .el-icon-caret-right
    transform rotate(90deg)
</style>

