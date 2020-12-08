<template>
  <div class="menu-controller">
    <lc-title text="菜单管理"></lc-title>
    <el-row :gutter="30">
      <el-col :sm="12">
        <el-tabs value="">
          <el-tab-pane label="菜单列表" name="">
            <div class="box">
              <menu-list :list="menuList" @edit="edit" @delete="deleteItem"></menu-list>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :sm="12" v-if="editItem">
        <el-tabs value="">
          <el-tab-pane :label="(oldValue?'编辑':'新增')+'菜单'" name=""></el-tab-pane>
        </el-tabs>
        <div class="box">
          <menu-edit :item="editItem" @submit="submit"></menu-edit>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { State, Action, Getter, Mutation } from 'vuex-class'
import lcTitle from '../../components/title.vue'
import API from '../../API'
import menuEdit from './components/menuEdit.vue'
import menuList from './components/menuList.vue'
@Component( {
  name: 'menu',
  components: {
    lcTitle,
    menuEdit,
    menuList
  }
} )
export default class Menu extends Vue {
  @Action( 'permission/getMenuList' ) getMenuList
  @Getter( 'permission/getterMenuList' ) menuListGroup
  @Mutation( 'permission/changeMenuList' ) changeMenuList
  get menuList () {
    let menuListObj = this.menuListGroup[ 0 ] || {}
    return Object.keys( menuListObj ).map( key => menuListObj[ key ] )
  }
  created () {
    if(this.$permissionValidateWithNotify(610)){
      this.getMenuList()
    }
  }
  editItem: any = null
  get oldValue () {
    return this.editItem && this.editItem.oldValue
  }
  edit ( item ) {
    this.editItem = item
  }
  submit ( item ) {
    if ( item ) {
      let { newValue, oldValue } = item
      let myValue = Object.assign( {}, newValue )
      myValue.type = myValue.grade == 2 ? 2 : 1
      myValue.parentId = myValue.grade1Id || myValue.grade0Id || 0
      delete myValue.grade0Id
      delete myValue.grade1Id
      delete myValue.children
      let promise
      if ( oldValue ) {
        promise = this.updateItem( myValue, oldValue )
      } else {
        promise = this.addItem( myValue )
      }
      promise.then( () => {
        this.editItem = null
      } )
    } else {
      this.editItem = null
    }
  }
  updateItem ( myValue, oldValue ) {
    let o: any = {
      id: myValue.id
    }
    Object.keys( myValue ).forEach( key => {
      let value = myValue[ key ]
      if ( value != oldValue[ key ] ) {
        o[ key ] = value
      }
    } )
    return this.$http( API.menuUpdate, {
      ...o,
      broadcast: true
    } ).then( () => {
      this.changeMenuList( {
        oldValue,
        newValue: myValue
      } )
    } )
  }
  addItem ( myValue ) {
    return this.$http( API.menuInsert, {
      ...myValue,
      broadcast: true
    } ).then( ( { data } ) => {
      this.changeMenuList( {
        newValue: data.data
      } )
    } )
  }
  deleteItem ( oldValue ) {
    return this.$http( API.menuDelete, {
      id: oldValue.id,
      broadcast: true
    } ).then( ( { data } ) => {
      this.changeMenuList( {
        oldValue
      } )
    } )
  }
}
</script>





