<template>
  <div class="menu-edit">
    <el-form label-width="80px">
      <el-form-item label="菜单名称">
        <el-input v-model="newValue.name" size="small" />
      </el-form-item>
      <el-form-item label="数据接口">
        <el-input v-model="newValue.url" size="small" />
      </el-form-item>
      <el-form-item label="菜单层级">
        <el-select :value="newValue.grade" size="small" @input="gradeChange" :disabled="isDisabled('grade')">
          <el-option label="一级菜单" :value="0"></el-option>
          <el-option label="二级菜单" :value="1"></el-option>
          <el-option label="三级控件" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="一级父类" v-if="newValue.grade">
        <el-select :value="newValue.grade0Id" :disabled="isDisabled('grade0Id')" size="small" @input="grade0IdChange">
          <el-option v-for="item in grade0List" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级父类" v-if="newValue.grade==2">
        <el-select v-model="newValue.grade1Id" size="small" :disabled="isDisabled('grade1Id')">
          <el-option v-for="item in grade1List" :key="item.id" :label="item.name" :value="+item.id"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="code">
        <lock-input v-model="newValue.code" placeholder="非必填项，创建时不建议填写"></lock-input>
      </el-form-item> -->
      <el-form-item label="备注" >
        <el-input v-model="newValue.remark" type="textarea" :disabled="isDisabled('remark')"/>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="confirm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Action, Getter } from 'vuex-class'
// import lockInput from '../../../components/lockInput.vue'
@Component( {
  name: 'menu-edit',
  // components: {
  //   lockInput
  // }
} )
export default class MenuEdit extends Vue {
  @Getter( 'permission/getterMenuList' ) menuListGroup
  @Prop()
  item: any
  newValue: any = {}
  oldValue: any = {}

  get grade0List () {
    let menuListObj = this.menuListGroup[ 0 ] || {}
    return Object.keys( menuListObj ).map( key => menuListObj[ key ] )
  }
  get grade1List () {
    let grade0Id = this.newValue.grade0Id
    let grade0Obj = this.menuListGroup[ 0 ][ grade0Id ] || {}
    return grade0Obj.children || []
  }
  created () {
    this.initEdit()
  }
  @Watch( 'item' )
  itemWatcher ( v ) {
    this.initEdit()
  }
  initEdit () {
    let { newValue, oldValue } = this.item
    this.newValue = Object.assign( {}, newValue || oldValue )
    this.oldValue = oldValue 
  }
  confirm () {
    this.$emit( 'submit', {
      newValue: this.newValue,
      oldValue: this.oldValue
    } )
  }
  isDisabled ( prop ) {
    return !!this.oldValue 
  }
  cancel () {
    this.$emit( 'submit', null )
  }
  gradeChange ( v ) {
    this.$set( this.newValue, 'grade', v )
    this.$set( this.newValue, 'grade0Id', undefined )
    this.$set( this.newValue, 'grade1Id', undefined )
  }
  grade0IdChange ( v ) {
    this.$set( this.newValue, 'grade0Id', v )
    this.$set( this.newValue, 'grade1Id', undefined )
  }
}
</script>

