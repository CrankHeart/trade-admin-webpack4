<template>
  <el-dialog
    :title="title"
    class="aptitude-pop"
    v-model="value"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <lc-table
      :data="renderDataList"
      :config="config"
      :has-page="false"
      :loading="loading"
      :height="330"
    >
      <template slot-scope="scope">
        <template v-if="!isEdit">
          <template v-if="scope.con.prop=='relativePath'">
            <el-button
              type="text"
              v-if="scope.row.absolutePath"
              style="marginLeft:10px"
              @click="viewPath = scope.row.absolutePath"
            >查看</el-button>
          </template>
          <template
            v-else-if="scope.con.prop=='medicalRegistType'"
          >{{convartData(scope.row.medicalRegistType,'medicalRegistType')}}</template>
          <template
            v-else-if="scope.con.prop=='remaining'"
          >{{computedRemaining(scope.row.expireTime)}}</template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
        <template v-else>
          <template v-if="scope.row.control">
            <template v-if="scope.con.prop=='control'">
              <el-button type="text" @click="addDataItem">新增</el-button>
            </template>
          </template>
          <template v-else>
            <template v-if="scope.con.prop=='relativePath'">
              <input-file-upload @change="fileUpload(scope.row,$event)">
                <el-button type="text">上传</el-button>
              </input-file-upload>
              <el-button
                type="text"
                v-if="scope.row.absolutePath"
                style="marginLeft:10px"
                @click="viewPath = scope.row.absolutePath"
              >查看</el-button>
            </template>
            <template v-else-if="scope.con.prop=='index'">{{scope.row.index+1}}</template>
            <template v-else-if="scope.con.prop=='expireTime'">
              <el-date-picker
                :editable="false"
                clearable
                v-model="scope.row.expireTime"
                align="left"
                format="yyyy-MM-dd"
                @change="multipleChange(scope.row.expireTime)"
              ></el-date-picker>
            </template>
            <template
              v-else-if="scope.con.prop=='remaining'"
            >{{computedRemaining(scope.row.expireTime)}}</template>
            <template v-else-if="scope.con.prop=='control'">
              <el-button-group size="small" v-if="showSortBtn">
                <el-button icon="arrow-left" @click="moveDataItem(scope.row,-1)">上移</el-button>
                <el-button icon="arrow-right" @click="moveDataItem(scope.row,1)">下移</el-button>
              </el-button-group>
              <el-button type="text" size="small" @click="delDataItem(scope.row)">删除</el-button>
            </template>
            <template v-else-if="scope.con.prop=='medicalRegistNum'">
              <el-input v-model="scope.row[scope.con.prop]" placeholder="空" size="small"></el-input>
            </template>
            <template v-else-if="scope.con.prop=='medicalRegistType'">
              <el-select v-model="scope.row[scope.con.prop]" placeholder="请选择" size="small">
                <el-option
                  v-for="medicalRegistTypeStatus in medicalRegistTypeStatuses"
                  :label="medicalRegistTypeStatus.name"
                  :value="medicalRegistTypeStatus.id"
                  :key="medicalRegistTypeStatus.id"
                ></el-option>
              </el-select>
            </template>
            <template v-else>{{scope.row[scope.con.prop]}}</template>
          </template>
        </template>
      </template>
    </lc-table>
    <span slot="footer" class="dialog-footer" v-if="isEdit">
      <!-- <el-button @click="handleClose">取 消</el-button> -->
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
    <div class="view-mask" v-if="viewPath" @click="viewPath=''">
      <div class="img">
        <img :src="viewPath" />
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table'
import inputFileUpload from '../../../components/inputFileUpload.vue'
import { Action } from 'vuex-class'
import { medicalRegistTypeStatuses } from '../const'
import { matchArrItem } from '../../../utils'
@Component( {
  name: 'AptitudePop',
  components: {
    lcTable,
    inputFileUpload
  }
} )
export default class AptitudePop extends Vue {
  @Action( 'message/msgHandled' ) callBack
  @Prop()
  value: boolean
  @Prop()
  isEdit: boolean
  @Prop()
  type: number
  @Prop( { default: () => ( {} ) } )
  item: any

  get needAptitude () {
    return this.item.needAptitude
  }

  showSortBtn = true
  uploadImg = API.uploadAptitudeImg

  updateInfo = API.updateAptitudeInfo

  deleteInfo = API.deleteAptitudeInfo

  getInfo = API.getAptitudeInfo

  imgType = 'aptitudeId'

  medicalRegistTypeStatuses = medicalRegistTypeStatuses
  convartData ( value, prop ) {
    let arr = []
    switch ( prop ) {
      case 'medicalRegistType':
        arr = this.medicalRegistTypeStatuses
        break
    }
    return matchArrItem( value, arr, 'id' ).name || '--'
  }
  get title () {
    let { name, specification } = this.item
    return `${name || specification}资质管理`
  }
  viewPath: string = ''
  loading: boolean = false
  handleClose () {
    this.$emit( 'input', false )
    // let tips = this.messageTip()
    // if ( tips && !this.isEdit) {
    //   this.$notify( {
    //     type: 'error',
    //     message: tips
    //   } )
    // } else {
    //   this.$emit( 'input', false )
    // }
  }
  multipleSettingLen = 1
  multipleChange ( time ) {
    if ( this.multipleSettingLen > 1 ) {
      this.dataList.forEach( v => {
        if ( !v.expireTime ) {
          v.expireTime = time
        }
      } )
    }
  }
  fileUpload ( item, e ) {
    if ( this.dataList.length <= 1 ) {
      let files = e.target.files

      let len = files.length
      this.multipleSettingLen = len
      let upload = async () => {
        for ( let i = 0; i < len; i++ ) {
          if ( i ) {
            this.addDataItem()
          }
          await this.singleFileUpload( this.dataList[ i ], files[ i ] )
        }
      }
      upload()
    } else {
      let file = e.target.files[ 0 ]
      this.singleFileUpload( item, file )
    }
  }
  singleFileUpload ( item, file ) {
    let o: any = {}
    // let file = e.target.files[ 0 ]
    let fileType = ''
    let fileSize = 0
    try {
      fileType = ( ( file.name || '' ).split( '.' ).slice( -1 )[ 0 ] || '' ).toLowerCase()
      fileSize = file.size
    } catch ( e ) { }

    if ( !( /(bmp|jp(e?)g|png|gif|svg)/.test( fileType ) ) ) {
      this.$message( {
        type: 'error',
        message: "上传图片格式错误！"
      } )
      return false
    }
    // if ( fileSize > 200 * 1024 && this.uploadImg == API.uploadGoodsImg ) {
    //   this.$message( {
    //     type: 'error',
    //     message: "上传图片大小不能大于200kb！"
    //   } )
    //   return false
    // }
    let { sort, absolutePath, medicalRegistType } = item
    let { id, lcCode } = this.item
    o[ 'imgPath[0]' ] = file
    o.type = this.type
    o.id = id
    o.lcCode = lcCode
    o.sort = sort
    o.medicalRegistType = medicalRegistType
    if ( item.id ) {
      o[ this.imgType ] = item.id
    }
    const formData = new FormData()
    for ( let i in o ) {
      formData.append( i, o[ i ] )
    }
    item.absolutePath = ''
    return this.$http( this.uploadImg, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      this.fileUploadCallBack( data, item )
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
  fileUploadCallBack ( data, item ) {
    let { absolutePath, relativePath, id } = data

    this.$set( item, 'id', id )
    this.$set( item, 'sort', item.sort )
    this.$set( item, 'relativePath', relativePath )
    this.$set( item, 'absolutePath', absolutePath )
  }
  handleSubmit () {
    this.validateAptitdude()
  }
  messageTip () {
    let medicalRegistTypeStatus = medicalRegistTypeStatuses.filter( v => v.id !== 10 ).map( v => v.id )
    let bo = false
    for ( let i = 0, l = this.dataList.length; i < l; i++ ) {
      let { relativePath, expireTime, medicalRegistNum, medicalRegistType } = this.dataList[ i ]
      if ( medicalRegistType === '' ) {
        return '请您选择资质信息'
      } else if ( medicalRegistTypeStatus.indexOf( medicalRegistType ) > -1 ) {
        if ( !relativePath || !expireTime || !medicalRegistNum ) {
          return `请确保序号为${i + 1}的一行输入内容有效，包括不限于资质图片/有效期/械字号/资质类型，并删除冗余内容`
        }
      } else {
        // bo += this.needAptitude ? 0 : 1
        if ( !medicalRegistNum ) {
          return `请确保序号为${i + 1}的一行输入内容有效，包括不限于械字号/资质类型，并删除冗余内容`
        }
      }
      // needAptitude 0 不需要  1需要
      if ( this.needAptitude == !( medicalRegistType == 10 ) ) {
        bo = true
      }
    }
    if ( !bo ) {
      return `请您至少输入一条${this.needAptitude ? '' : '不'}需要资质的信息`
    }
  }
  validateAptitdude () {
    let tips = this.messageTip()
    if ( tips ) {
      this.$notify( {
        type: 'error',
        message: tips
      } )
    } else {
      this.saveAptitdude()
    }

  }
  @Inject() formatMyDate
  saveAptitdude () {
    let myType = this.type == 0 ? 'spu' : 'sku'
    let { id, lcCode } = this.item
    this.$http( this.updateInfo, {
      type: this.type,
      aptitudeInfo: this.dataList.map( ( v, i ) => ( {
        ...v,
        expireTime: v.expireTime ? this.formatMyDate( v.expireTime ) : '',
        [ this.type == 0 ? 'spuId' : 'skuId' ]: id,
        [ this.type == 0 ? 'lcSpuCode' : 'lcSkuCode' ]: lcCode,
        imgUrl: v.relativePath,
        sort: i
      } ) )
    } ).then( () => {
      this.$emit( 'save' )
      this.$emit( 'input', false )
      this.$notify( {
        type: 'success',
        message: '保存成功！'
      } )
      let { type } = this.$route.query
      if ( type !== undefined ) {
        this.callBack( { id, type } )
      }
    }, () => {
      this.$notify( {
        type: 'error',
        message: '保存失败！'
      } )
    } )

  }
  get nowTime () {
    return Date.now()
  }
  computedRemaining ( time: any ) {
    if ( !time ) {
      return ''
    }
    if ( !( time instanceof Date ) ) {
      time = new Date( time.replace( /\s/i, 'T' ) )
    }
    if ( time > this.nowTime ) {
      return '剩余' + Math.ceil( ( time - this.nowTime ) / 1000 / 60 / 60 / 24 ) + '天'
    }
    return '已过期'
  }
  created () {
    this.getData()
  }
  deactivated () {
    this.dataList = []
  }
  config = [
    { prop: 'index', label: '序号', width: '70px' },
    { prop: 'relativePath', label: '图片', width: '120px' },
    { prop: 'expireTime', label: '到期时间', width: '200px' },
    { prop: 'remaining', label: '到期剩余时间', width: '200px' },
    { prop: 'medicalRegistNum', label: '械字号' },
    { prop: 'medicalRegistType', label: '资质类型' },
    { prop: 'control', label: '操作' },
  ]
  dataList: any[] = []
  get renderDataList () {
    if ( this.isEdit ) {
      return this.dataList.concat( { control: true } )
    }
    return this.dataList.concat()
  }
  delDataItem ( item ) {
    let i = this.dataList.indexOf( item )
    this.dataList.splice( i, 1 )
    if ( item.id ) {
      this.$http( this.deleteInfo, {
        type: this.type,
        ids: item.id.toString()
      } ).then( ( { data } ) => {
        this.$notify( {
          type: 'success',
          message: '删除成功！'
        } )
      } )
    }
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
    let l = Math.max.apply( null, this.dataList.map( v => +v.index ).concat( -1 ) ) + 1
    this.dataList.push( {
      relativePath: '',
      absolutePath: '',
      id: void 0,
      expireTime: '',
      sort: l,
      index: l,
      medicalRegistNum: '',
      medicalRegistType: this.needAptitude ? 0 : 10
    } )
  }
  getData () {
    this.loading = true
    this.$http( this.getInfo, {
      type: this.type,
      id: this.item.id
    } ).then( ( { data } ) => {
      this.dataList = data.list.map( ( v, i ) => ( { ...v, sort: v.sort, index: i } ) )
      if ( !data.list.length ) {
        this.addDataItem()
      }
      this.loading = false
    }, () => {
      this.loading = false
    } )
  }
}
</script>
<style lang="stylus" >
.aptitude-pop
  .el-dialog
    width 80%
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
