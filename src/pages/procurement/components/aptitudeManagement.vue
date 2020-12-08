<template>
  <div class="reconciliation-details">
    <div class="header">
      <!-- v-if="$permissionValidate(765)" -->
      <el-button class="export-btn" type="primary" @click="addDataItem">新增资质</el-button>
      <el-button class="export-btn" type="primary" @click="saveAptitude">保存</el-button>
    </div>
    <!-- <aptitude-manage-pop ref="supplierAptitudePop" :item="aptitudeData" :is-edit="isEdit" ></aptitude-manage-pop> -->
    <lc-table
      :data="dataList"
      :config="config"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
      type="index"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='relativePath'">
          <input-file-upload v-if="scope.row.isEdit" @change="singleFileUpload(scope.row,$event)">
            <el-button type="text">上传</el-button>
          </input-file-upload>
          <el-button
            type="text"
            v-if="scope.row.absolutePath"
            @click="viewPath = scope.row.absolutePath"
          >查看</el-button>
        </template>
        <template v-else-if="scope.con.prop=='index'">{{scope.row.index + 1 }}</template>
        <template v-else-if="scope.con.prop=='expireTime'">
          <el-date-picker
            v-if="scope.row.isEdit"
            :editable="false"
            clearable
            v-model="scope.row.expireTime"
            align="left"
            format="yyyy-MM-dd"
            @change="multipleChange(scope.row.expireTime)"
          ></el-date-picker>
          <span v-else>{{ formatMyDate( scope.row.expireTime, 'yyyy-MM-dd' ) || '' }}</span>
        </template>
        <template v-else-if="scope.con.prop=='remaining'">
          <span :class="{redColor: scope.row.isExpired }">{{computedRemaining(scope.row)}}</span>
        </template>
        <template v-else-if="scope.con.prop=='credentialsCode'">
          <el-input
            v-if="scope.row.isEdit"
            v-model="scope.row[scope.con.prop]"
            placeholder="空"
            size="small"
          ></el-input>
          <span v-else>{{scope.row[scope.con.prop]}}</span>
        </template>
        <template v-else-if="scope.con.prop=='credentialsType'">
          <el-select
            v-if="scope.row.isEdit"
            v-model="scope.row[scope.con.prop]"
            placeholder="请选择"
            size="small"
          >
            <el-option
              v-for="type in credentialsTypes"
              :label="type.name"
              :value="type.id"
              :key="type.id"
            ></el-option>
          </el-select>
          <span v-else>{{ convartCredentialsType( scope.row[scope.con.prop] ) }}</span>
        </template>
        <template v-else-if="scope.con.prop=='control'">
          <el-button-group size="small">
            <el-button icon="arrow-up" @click="moveDataItem(scope.row,-1)">上移</el-button>
            <el-button icon="arrow-down" @click="moveDataItem(scope.row,1)">下移</el-button>
          </el-button-group>
          <el-button
            v-if="!scope.row.isEdit"
            type="text"
            size="small"
            @click="editDataItem(scope.row, scope.$index)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.isEdit && scope.row.id "
            type="text"
            size="small"
            @click="cancelEditDataItem(scope.row, scope.$index)"
          >取消</el-button>
          <!-- cancelEditDataItem -->
          <el-button type="text" size="small" @click="delDataItem(scope.row, scope.$index)">删除</el-button>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <div class="view-mask" v-if="viewPath" @click="viewPath=''">
      <div class="img">
        <img :src="viewPath" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table'
import inputFileUpload from '../../../components/inputFileUpload.vue'
import { matchArrItem } from '../../../utils'
import { credentialsTypes } from '../const'

@Component( {
  name: 'aptitude-management',
  components: {
    lcTable,
    inputFileUpload
  }
} )
export default class aptitudeManagement extends Vue {
  @Prop( {
    type: Number
  } )
  supplierId
  @Inject() formatMyDate

  isEdit: boolean = false
  loading: boolean = false
  dataList: any[] = []
  viewPath: string = ''
  credentialsTypes: any[] = credentialsTypes

  config = [
    { prop: 'index', label: '序号', width: '70px' },
    { prop: 'relativePath', label: '图片', width: '120px' },
    { prop: 'expireTime', label: '到期时间', width: '200px' },
    { prop: 'remaining', label: '到期剩余时间', width: '200px' },
    { prop: 'credentialsCode', label: '械字号' },
    { prop: 'credentialsType', label: '资质类型' },
    { prop: 'control', label: '操作', width: '280px' },
  ]

  page = {
    cur: 1,
    num: 10,
    total: 0
  }


  get aptitudeData () {
    return {
      id: this.supplierId
    }
  }

  get nowTime () {
    return Date.now()
  }

  activated () {
    this.getData()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.getData()
  }

  convartCredentialsType ( type ) {
    return matchArrItem( type, credentialsTypes, 'id' ).name || '--'
  }

  computedRemaining ( item: any ) {
    let time = item.expireTime

    if ( !time ) {
      Vue.set( item, 'isExpired', false )
      return ''
    }
    if ( !( time instanceof Date ) ) {
      time = new Date( time.replace( /\s/i, 'T' ) )
    }
    if ( time > this.nowTime ) {
      Vue.set( item, 'isExpired', false )
      return '剩余' + Math.ceil( ( time - this.nowTime ) / 1000 / 60 / 60 / 24 ) + '天'
    }
    Vue.set( item, 'isExpired', true )
    return '已过期'
  }

  moveDataItem ( item, step ) {
    let i = this.dataList.indexOf( item )
    let nextPos = i + step
    if ( nextPos < 0 || nextPos >= this.dataList ) {
      return
    }
    this.dataList.splice( i, 1 )
    this.dataList.splice( nextPos, 0, item )

  }

  addDataItem () {
    // this.dataList.push( {
    //   isEdit: true
    // } )
    this.dataList.push( {
      isEdit: true,
      index: this.dataList.length,
      relativePath: '',
      expireTime: '',
      credentialsCode: '',
      credentialsType: ''
    } )
  }

  getData () {
    this.loading = true
    let { cur, num } = this.page
    this.$http( API.getAptitudeBySupplierId, {
      supplierId: this.supplierId,
      start: ( cur - 1 ) * num,
      num: num
    } ).then( ( { data } ) => {
      let d = data.data || {}
      this.page.total = d.total
      this.dataList = d.list.map( ( v, i ) => ( {
        ...v,
        index: i,
        isEdit: false
      } ) )
      this.loading = false
    }, () => {
      this.loading = false
    } )
  }



  formatAptitudeSaveParam ( dataList ) {
    let param = {
      supplierAptitude: []
    }
    const supplierId = this.supplierId
    param.supplierAptitude = dataList.map( ( v, i ) => ( {
      ...v,
      sort: i,
      supplierId,
      imgUrl: v.relativePath,
      expireTime: v.expireTime ? this.formatMyDate( v.expireTime ) : ''
    } ) )
    return param
  }

  validateAptitudeData ( dataList ) {
    let credentialsTypeIds = credentialsTypes.map( v => v.id )
    let message = ''
    for ( let i = 0, l = dataList.length; i < l; i++ ) {
      let { index, absolutePath, expireTime, credentialsCode, credentialsType } = dataList[ i ]
      if ( credentialsType === '' ) {
        message = '请您选择资质信息'
        break
      } else if ( credentialsTypeIds.indexOf( credentialsType ) > -1 ) {
        if ( !absolutePath || !expireTime || !credentialsCode ) {
          message = `请确保序号为${index + 1}的一行输入内容有效，包括不限于资质图片/有效期/械字号/资质类型，并删除冗余内容`
          break
        }
      } else {
        if ( !credentialsCode ) {
          message = `请确保序号为${index + 1}的一行输入内容有效，包括不限于械字号/资质类型，并删除冗余内容`
          break
        }
      }
    }
    if ( message.length > 0 ) {
      this.$notify( {
        type: 'error',
        message: message
      } )
    }
    return !!message.length
  }

  saveAptitude () {
    let uploadData: any[] = this.dataList
    // 保存前的数据验证
    if ( this.validateAptitudeData( uploadData ) ) {
      return
    }
    this.$http( API.saveSupplierAptitude, this.formatAptitudeSaveParam( uploadData ) ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: '保存成功！'
      } )
      const ids = data.ids
      uploadData.forEach( ( v, i ) => {
        Vue.set( v, 'id', ids[ i ] )
        v.isEdit = false
      } )
      this.page.total = this.dataList.length
    } )
  }

  delDataItem ( item, index ) {
    if ( item.id ) {
      this.$http( API.deleteSupplierAptitude, {
        ids: item.id
      } ).then( ( { data } ) => {
        this.$notify( {
          type: 'success',
          message: '删除成功！'
        } )
        this.dataList.splice( index, 1 )
        this.page.total = this.dataList.length
      } )
    } else {
      this.dataList.splice( index, 1 )
      this.page.total = this.dataList.length
      this.$notify( {
        type: 'success',
        message: '删除成功！'
      } )
    }

  }

  editDataItem ( item, index ) {
    item.isEdit = true
  }
  cancelEditDataItem ( item, index ) {
    item.isEdit = false
  }

  validateImg ( file ) {
    let isValidate = true

    const fileType = ( ( file.name || '' ).split( '.' ).slice( -1 )[ 0 ] || '' ).toLowerCase()
    const fileSize = file.size
    const maxSize = 400 * 1024

    if ( !( /(bmp|jp(e?)g|png|gif|svg)/.test( fileType ) ) ) {
      this.$message( {
        type: 'error',
        message: "上传图片格式错误！"
      } )
      isValidate = false
    }
    // if ( fileSize > maxSize ) {
    //   this.$message( {
    //     type: 'error',
    //     message: "上传图片大小不能大于400kb！"
    //   } )
    //   isValidate = false
    // }
    return isValidate
  }

  singleFileUpload ( item, e ) {
    let file = e.target.files[ 0 ]
    if ( !this.validateImg( file ) ) {
      return
    }

    const absolutePath = item.absolutePath
    const formData = new FormData()
    formData.append( "id", this.supplierId )
    formData.append( "aptitudeId", item.id )
    formData.append( "imgPath[0]", file )

    this.$http( API.uploadSupplierAptitudeImg, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      const { absolutePath, relativePath } = data
      this.$set( item, 'relativePath', relativePath )
      this.$set( item, 'absolutePath', absolutePath )

      this.$notify( {
        type: 'success',
        message: '上传成功！'
      } )
    }, () => {
      this.$set( item, 'absolutePath', absolutePath )
      this.$notify( {
        type: 'error',
        message: '上传错误！'
      } )
    } )

  }

}

</script>



<style lang="stylus" scoped>
.reconciliation-details
  .header
    text-align right
    margin-bottom 20px
  .redColor
    color #ff4949
  .el-date-editor.el-input
    width 100%
  .el-button-group
    button
      margin-left 0 !important
      margin-right 0 !important
      [class*='el-icon']
        transform rotate(90deg)
  .input-file-upload
    margin-top -3px
  .view-mask
    position fixed
    left 0
    top 0
    right 0
    bottom 0
    z-index 999
    .img
      min-width 200px
      min-height 200px
      max-width 400px
      background rgba(0, 0, 0, 0.3)
      box-shadow 0 0 20px rgba(0, 0, 0, 0.8)
      position absolute
      top 50%
      left 50%
      transform translate3d(-50%, -50%, 0)
      img
        width 100%
        height 100%
</style>
