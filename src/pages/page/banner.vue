<template>
  <div id="page-banner">
    <lc-title text="banner管理"></lc-title>
    <el-tabs v-model="type">
      <el-tab-pane label="pc端" name="pc"></el-tab-pane>
      <el-tab-pane label="app端" name="app"></el-tab-pane>
      <el-tab-pane label="小程序端" name="wechat"></el-tab-pane>
    </el-tabs>

    <div class="el-table el-table__body-wrapper" :class="type+'__table'">
      <table
        cellspacing="0"
        cellpadding="0"
        border="0"
        class="el-table__body el-table--border"
        width="100%"
      >
        <thead>
          <tr>
            <th width="100">
              <div class="cell">{{type}}</div>
            </th>
            <th v-for="(item ,ind) in config" :key="ind" :class="'is-leaf el-table_1_column_'+ind">
              <div class="cell">{{item}}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in 3" :key="key" v-if="type=='pc' || key!==2">
            <td style="width:100px;">
              <div class="cell">{{key==1?'大图':key==2?'缩略图':key==3?'跳转链接':'结束时间'}}</div>
            </td>
            <td v-for="(item,i) in myData" :key="i+'_'+key">
              <div class="cell">
                <div class="img-box">
                  <img
                    :src="checkShow(key,item)+'?'+Math.random()"
                    v-if="checkShow(key,item)"
                    :key="i+'_'+key+checkShow(key,item)"
                  />
                  <div class="flex v-middle middle">
                    <template v-if="key==1 || key==2">
                      <el-button
                        type="text"
                        v-if="checkShow(key,item)"
                        @click="view(type,key,i,item)"
                        icon="view"
                        :key="i+'1_'+key"
                      >查看</el-button>
                      <el-button type="text" icon="upload">
                        上传
                        <input
                          type="file"
                          :name="'_file_'+key+i+Math.random()"
                          @change="fileUpload(type,key,i,$event)"
                          :key="i+'2_'+key"
                        />
                      </el-button>
                      <el-button
                        type="text"
                        v-if="checkShow(key,item)"
                        @click="del(type,key,i,item)"
                        icon="delete"
                        :key="i+'3_'+key"
                      >删除</el-button>
                    </template>
                    <template v-if="key==3">
                      <el-tooltip
                        class="item"
                        :content="item.linkAddress || '请填写跳转链接！'"
                        placement="bottom-start"
                      >
                        <lock-input
                          v-model="item.linkAddress"
                          :payload="{item:item,i:i}"
                          @change="updateLink"
                        ></lock-input>
                      </el-tooltip>
                    </template>
                    <template v-if="key==4">
                      <el-date-picker
                        size="small"
                        v-model="item.date"
                        type="date"
                        placeholder="选择日期"
                      ></el-date-picker>
                    </template>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <el-dialog title="提示" v-model="viewPicPathShow" @close="closeDialog" class="center">
      <img :src="viewPicPath" />
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import LockInput from '../../components/lockInput.vue'
import API from '../../API'
interface appModel {
  imagePath: string
  linkAddress: string
  sequence: number
  [ propName: string ]: any
}
interface pcModel extends appModel {
  smallImgPath: string
}
interface wechatModel extends appModel { }
@Component( {
  name: 'page-banner',
  components: {
    lcTitle,
    LockInput
  }
} )
export default class PageBanner extends Vue {
  type: string = 'pc'
  pc: pcModel[] = []
  app: appModel[] = []
  wechat = []
  config = [ "坑位1", "坑位2", "坑位3", "坑位4", "坑位5", "坑位6", "坑位7", "坑位8" ]
  viewPicPathShow: boolean = false
  viewPicPath: string = ''
  get myData () {
    return this[ this.type ]
  }
  checkShow ( key, item ) {
    return key == 1 && item.imagePath || key == 2 && item.smallImgPath
  }
  closeDialog () {
    setTimeout( () => {
      this.viewPicPath = ''
    }, 300 )
  }
  initData () {
    let o: any = {
      imagePath: '',
      linkAddress: '',
      sequence: ''
    }
    if ( this.type == 'pc' ) {
      o.smallImgPath = ''
    }
    let data = this[ this.type ]
    let l = this.config.length
    while ( l-- ) {
      data.push( Object.assign( {}, o ) )
    } 2
  }

  del ( type, key, i, item ) {

    let img = ( key == 2 ? item.smallImgPath : item.imagePath ).split( '/' ).splice( -1, 1 )[ 0 ]

    if ( key == 2 ) {
      item.smallImgPath = ""
    } else {
      item.imagePath = ""
    }

    this.$http( API.deleteBannerPic, {
      type: key == 2 ? 4 : type == 'pc' ? 3 : type == 'app' ? 2 : 6,
      fileName: img,
      sequence: i
    } )
  }
  updateLink ( txt: string, cb: Function, { item, i } ) {
    console.log( cb )
    return this.$http( API.updateBannerLink, {
      type: this.type == 'pc' ? 3 : this.type == 'app' ? 2 : 6,
      linkAddress: txt,
      sequence: i
    } ).then( ( { data } ) => {
      item.linkAddress = txt
      cb()
    } )
  }
  view ( type, key, i, item ) {
    let imgSrc = key == 2 ? item.smallImgPath : item.imagePath
    if ( /^http/.test( imgSrc ) ) {
      this.viewPicPathShow = true
      let img = new Image()
      img.src = imgSrc + '?' + Math.random()
      img.onload = () => {
        this.viewPicPath = imgSrc
      }

    } else {
      this.$notify( {
        type: 'error',
        message: '图片获取失败，请刷新页面后重新尝试！'
      } )
    }
  }
  fileUpload ( type, key, i, $event ) {
    let o: any = {},
      file = $event.target.files[ 0 ]
    if ( file.size > 409600 ) { // 400*1024
      return this.$message( {
        type: 'error',
        message: "上传图片不能超过400KB！"
      } )
    }
    if ( !( /(bmp|jpg|png|gif|svg)/.test( file.name.split( '.' ).splice( -1, 1 )[ 0 ].toLowerCase() ) ) ) {
      return this.$message( {
        type: 'error',
        message: "上传图片格式错误！"
      } )
    }

    if ( type == 'pc' ) {
      o.type = key == 1 ? 3 : 4
    } else if ( type == 'app' ) {
      o.type = 2
    } else {
      o.type = 6
    }
    o.sequence = i
    o.file = file
    const formData = new FormData()
    for ( let j in o ) {
      formData.append( j, o[ j ] )
    }
    this.$http( API.bannerUpload, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      let m = this[ type ][ i ]
      if ( key == 1 ) { // 大图小图
        m.imagePath = data.realImagePath
        // let temp = Object.assign({},this[ type ][i],{imagePath: data.realImagePath})
        // 修复属性更改后不刷新bug
        this.$set( this[ type ], i, m )
      } else if ( key == 2 ) {
        m.smallImgPath = data.realImagePath
        this.$set( this[ type ], i, m )
      }
    } )
  }
  @Watch( 'type' )
  typeWatcher ( v, o ) {
    this.getData()
  }
  activated () {
    this.getData()
  }
  getData () {
    let mydata = this[ this.type ] || []
    if ( mydata.length ) return
    this.initData()
    this.$http( API.getBannersByType, {
      type: this.type == 'pc' ? 3 : this.type == 'app' ? 2 : 6
    } ).then( ( { data } ) => {
      data.banners = data.banners || {}
      for ( let i = 0, l = this.config.length; i < l; i++ ) {
        Object.assign( mydata[ i ], data.banners[ i ] )
      }
    } )
  }
}
</script>
<style lang="stylus" >
#page-banner
  img
    max-width 100%
    height 140px
    // margin-top 10px
    // margin-bottom 10px
  .img-box
    position relative
    text-align center
    img +.flex
      opacity 0
      background rgba(0, 0, 0, 0.3)
      position absolute
      width 100%
      height 100%
      left 0
      top 0
      &:hover
        opacity 1
      .el-button--text
        color #fff
    .flex
      flex-wrap wrap
      input[type='file']
        position absolute
        left 0
        top 0
        width 100%
        height 100%
        opacity 0
        cursor pointer
      .el-button--text
        position relative
        padding-top 5px
        padding-bottom 5px
  .el-dialog
    img
      height auto
      max-height 300px
</style>

