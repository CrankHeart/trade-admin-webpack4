<template>
  <div class="menu-list">
    <el-tree
      :data="list"
      :style="{height:boxHeight}"
      :props="defaultProps"
      default-expand-all
      :render-content="renderContent"
    ></el-tree>
    <el-button
      size="small"
      type="primary"
      @click="addItem( { grade: -1 })"
      v-if="$permissionValidate(612)"
    >创建菜单</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import API from '../../../API'

@Component( {
  name: 'menu-list'
} )
export default class MenuList extends Vue {
  @Prop()
  list: any[]
  defaultProps = {
    children: 'children',
    label: 'name'
  }
  @State( 'clientHeight' ) clientHeight
  get boxHeight () {
    return this.clientHeight - 280 + 'px'
  }
  renderContent ( h, { node, data, store } ) {
    const that = this
    const canCreate = this.$permissionValidate( 611 )
    const canEdit = this.$permissionValidate( 612 )
    const canDelete = this.$permissionValidate( 613 )
    return h( 'span', [
      h( 'span', { domProps: { innerHTML: data.name } } ),
      data.grade === 2 ? '' : canCreate ? h( 'button', {
        attrs: {
          size: 'mini',
          class: 'pull-right add el-button el-button--text'
        },
        on: {
          'click': function ( $event ) {
            $event.stopPropagation()
            that.addItem( data )
          }
        }
      }, [
        h( 'i', {
          attrs: {
            class: 'el-icon-plus',
            title: '新增子集'
          }
        } )
      ] ) : '',
      canEdit ? h( 'button', {
        attrs: {
          class: 'pull-right el-button el-button--text'
        },
        on: {
          'click': function ( $event ) {
            $event.stopPropagation()
            that.updateItem( data )
          }
        }
      }, [
        h( 'i', {
          attrs: {
            class: 'el-icon-edit',
            title: '编辑当前'
          }
        } )
      ] ) : '',
      // canDelete? h( 'button', {
      //   attrs: {
      //     class: 'pull-right delete el-button el-button--text'
      //   },
      //   on: {
      //     'click': function ( $event ) {
      //       $event.stopPropagation()
      //       that.confirmDeleteMenu( data )
      //     }
      //   }
      // }, [
      //     h( 'i', {
      //       attrs: {
      //         class: 'el-icon-delete',
      //         title: '删除当前'
      //       }
      //     } )
      //   ] ):''
    ] )
  }
  addItem ( data ) {
    let { grade, grade0Id, grade1Id } = data
    let newValue: any = {
      grade: grade + 1
    }
    if ( newValue.grade == 1 ) {
      newValue.grade0Id = data.id || 0
    } else if ( newValue.grade == 2 ) {
      newValue.grade1Id = data.id || 0
      newValue.grade0Id = data.parentId || 0
    }

    this.$emit( 'edit', { newValue } )
  }
  updateItem ( data ) {
    this.$emit( 'edit', { oldValue: data } )
  }
  // confirmDeleteMenu ( obj ) {
  //   this.$confirm( '是否删除权限[' + obj.name + ']', '提示', {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning'
  //   } ).then( () => {
  //     this.$emit( 'delete', obj )
  //   } )
  // }

}
</script>
<style lang="stylus" >
.menu-list
  .el-tree
    overflow auto
    .el-tree-node__content
      padding-right 20px
      &:hover
        .el-button
          display block
    .el-button
      display none
  & > .el-button
    margin-top 10px
</style>
