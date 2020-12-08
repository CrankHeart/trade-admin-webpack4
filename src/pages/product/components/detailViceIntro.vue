<template>
  <div class="detail-vice-intro">
    <div class="el-table el-table__body-wrapper" v-for="(items,index) in viceIntro" :key="index">
      <table cellspacing="0" cellpadding="0" border="0" class="el-table__body el-table--border" width="100%">
        <thead>
          <tr>
            <th v-for="(item ,ind) in viceIntroConfig[index]" :key="ind" :class="'is-leaf el-table_1_column_'+ind">
              <div class="cell">{{item.label}}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template>
            <tr v-for="key in 3" :key="key">
              <td v-for="(item,i) in viceIntro[index]" :key="i">
                <div class="cell">
                  <span v-if="key==1">
                    <el-button icon="upload" type="text" size="small">上传</el-button>
                    <input class='edit-file' type="file" :name="'_file'+Math.random()" @change="fileUpload(index,i,item,$event)"></input>
                  </span>
                  <span v-if="key==2 && (index!==2&&item || item&&item.imagePath)" @click="view(index,i)">
                    <el-button icon="view" type="text" size="small">查看</el-button>
                  </span>
                  <span v-if="key==3 && (index!==2&&item || item&&item.imagePath)" @click="del(index,i)">
                    <el-button icon="delete" type="text" size="small">删除</el-button>
                  </span>
                </div>
              </td>
            </tr>
          </template>
          <!-- <template v-if="index===2">
            <tr>
              <td v-for="(item,i) in viceIntro[index]" :key="i">
                <div class="cell">
                  <el-date-picker v-model="item.endDate" :placeholder="item.imagePath?'有效期':'先上传资质'" :disabled="!item.imagePath" size="small" type="date" @change="editDate(item,i)" :key="i"></el-date-picker>
                </div>
              </td>
            </tr>
          </template> -->
        </tbody>
      </table>
    </div>
    <el-dialog v-model="curPicShow" @close="closeDialog">
      <img :src="curPicPath" :style="dialogStyle" />
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import lcTable from '../../../components/table'
import lcTableConfig from '../../../components/table/control.vue'
import { State, Getter, Mutation, Action } from 'vuex-class'
import API from '../../../API'
@Component( {
  name: 'vice-intro-detail',
  components: {
    lcTable,
    lcTableConfig
  }
} )
export default class ViceIntroDetail extends Vue {

  fileUpload ( index, key, item, $event ) {
    let o
    let file = $event.target.files[ 0 ]
    let fileType = ( file.name || '' ).split( '.' )[ 1 ].toLowerCase()
    if ( !( /(bmp|jpg|png|gif|svg)/.test( fileType ) ) ) {
      return this.$message( {
        type: 'error',
        message: "上传图片格式错误！"
      } )
    }
    // if ( index == 0 ) {
    //   // o = this.imageFileUpload( key, item )
    //   // } else if ( index == 2 ) {/*资质*/
    //   //   o = this.aptitudeFileUpload( key )
    // } else { //文描
    o = this.viceFileUpload( key, file )
    // }

    o.id = this.$route.params.id
    o[ 'imgPath[0]' ] = file
    const formData = new FormData()
    for ( var i in o ) {
      formData.append( i, o[ i ] )
    }
    this.$http( API.fileUpload, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      this.$notify( {
        type: 'success',
        message: data.msg
      } )
      this.$emit( 'handler', 'fileUpload', {
        ...o,
        file: file.name
      } )
    }, rej => {
      this.$notify( {
        type: 'error',
        message: '上传错误！'
      } )
    } )
  }
  view ( index, key ) {
    var o: any = {}
    // if ( index == 0 ) { // o 是主图副图，添加了一个主图 所有副图key从1 开始
    //   if ( key == 0 ) {
    //     o = {
    //       type: '1'
    //     }
    //   } else {
    //     o = {
    //       order: key - 1,
    //       type: '3'
    //     }
    //   }
    //   // } else if (index === 2) {/*资质图片查看*/
    //   //   o = {
    //   //     type: '5',
    //   //     order: key
    //   //   }
    // } else {
    o = {
      order: key,
      type: '4'
    }
    // }
    o.id = this.$route.params.id
    this.getPicPath( o )
  }
  del ( index, key ) {
    var o: any = {}
    // if ( index == 0 ) {
    //   if ( key == 0 ) {
    //     o = {
    //       type: '1',
    //       index: ''
    //     }
    //   } else {
    //     o = {
    //       index: key - 1,
    //       type: '2'
    //     }
    //   }
    //   // } else if (index === 2) {/*资质图片删除-处理参数*/
    //   //   o = {
    //   //     type: '5',
    //   //     order: key
    //   //   }
    // } else {
    o = {
      index: key,
      type: '3'
    }
    // }
    o.id = this.$route.params.id
    this.delPicPath( o )
  }

  // editDate ( item, i ) {
  //   let date = item && item.endDate
  //   let params = {
  //     id: this.$route.params.id,
  //     order: i,
  //     endDate: date
  //   }
  //   this.$emit( 'handler', 'editDate', {
  //     endDate: date,
  //     order: i
  //   } )
  //   this.$http( API.updateAptitudeDate, params ).then( res => {
  //     this.$notify( {
  //       type: 'success',
  //       message: '有效期设置成功!'
  //     } )
  //   } )
  // }
  getPicPath ( o ) {
    this.$http( API.getPicPath, o ).then( ( { data } ) => {
      this.curPicPath = data.imgPath + '?' + Math.random()
    } )
  }
  delPicPath ( o ) {
    this.$http( API.delPicPath, o ).then( ( { data } ) => {
      this.$emit( 'handler', 'delPic', {
        type: data.type,
        index: data.index,
        order: o.order
      } )
      this.$message( '删除成功' )
    } )
  }
  // imageFileUpload ( key, item ) {
  //   let o
  //   if ( key == 0 ) {//主图
  //     o = {
  //       type: '1',
  //       imageOld: !!item,
  //       // imageIntroduce:''
  //     }
  //   } else {
  //     if ( item ) { //副图更新旧图
  //       o = {
  //         type: '3',
  //         imageOld: true
  //       }

  //     } else { //副图上传新图
  //       o = {
  //         type: '2',
  //         imageOld: ''
  //       }
  //     }
  //     o.order = key - 1
  //     o.imageIntroduce = ''
  //   }
  //   return o
  // }
  viceFileUpload ( key, file ) {
    let o = {
      type: "4",
      order: key,
      imageOld: '',
      imageIntroduce: ''
    }
    // 拼接薪的 imageIntroduce
    let spu = this.spu,
      arr = Object.assign( new Array( 10 ), spu.imageIntroduce.split( ';' ) )

    arr.forEach( ( v, i ) => {
      if ( v.indexOf( '/' ) > -1 ) {
        arr.splice( i, 1, v.split( '/' )[ 1 ] )
      }
    } )
    arr.splice( o.order, 1, file.name )
    o.imageIntroduce = arr.join( ';' )
    return o
  }
  aptitudeFileUpload ( key ) {
    return {
      type: "5",
      order: key
    }
  }

  curPicPath: string = ''
  get curPicShow (): boolean {
    return !!this.curPicPath
  }
  set curPicShow ( v ) {
    if ( !v ) {
      this.curPicPath = ''
    }
  }
  closeDialog () {
    setTimeout( () => { this.curPicPath = '' }, 300 )
  }

  @Prop( { default: {} } )
  spu

  @Prop( { default: [] } )
  vicePic: any[]

  @Prop()
  aptitudeList: any[]
  @Watch( 'aptitudeList', { deep: true } )
  aptitudeListWatcher () {
    this.initMyAptitudeList()
  }
  myAptitudeList = []

  initMyAptitudeList () {
    // let arr = []
    // this.aptitudeList.forEach(v => {
    //   arr.push(v.endDate)
    // })
    this.myAptitudeList = JSON.parse( JSON.stringify( this.aptitudeList ) )
  }
  // get vicePicList () { // 主图附图
  //   let zhutu = this.spu.goodsImage
  //   let arr = Array.from( { length: this.conf1.length } )
  //   arr.splice( 0, 1, zhutu )
  //   this.vicePic.forEach( ( v, i ) => {
  //     arr.splice( v.sequence + 1, 1, v.image )
  //   } )
  //   return arr
  // }

  get imageIntroduce () { // 文描
    let introduce = this.spu.imageIntroduce || ''
    let arr = introduce.split( ';' )
    return Object.assign( new Array( this.conf2.length ), arr )
  }

  get viceIntro () {
    // return [ this.vicePicList, this.imageIntroduce, this.myAptitudeList ]
    // return [ this.vicePicList, this.imageIntroduce ]
    return [ this.imageIntroduce ]
  }
  get viceIntroConfig () {
    // return [ this.conf1, this.conf2, this.conf3 ]
    // return [ this.conf1, this.conf2 ]
    return [ this.conf2 ]
  }
  get dialogStyle () {
    let maxW = document.documentElement.clientWidth,
      maxH = document.documentElement.clientHeight
    return {
      maxWidth: maxW * 0.8 + 'px',
      maxHeight: ( maxH * .7 - 80 ) + 'px'
    }
  }
  // conf1 = [
  //   { label: "主图" },
  //   { label: "副图1" },
  //   { label: "副图2" },
  //   { label: "副图3" },
  //   { label: "副图4" },
  //   { label: "副图5" }
  // ]
  conf2 = [
    { label: "文描1" },
    { label: "文描2" },
    { label: "文描3" },
    { label: "文描4" },
    { label: "文描5" },
    { label: "文描6" },
    { label: "文描7" },
    { label: "文描8" },
    { label: "文描9" },
    { label: "文描10" }
  ]
  // conf3 = [
  //   { label: "资质1" },
  //   { label: "资质2" },
  //   { label: "资质3" },
  //   { label: "资质4" },
  //   { label: "资质5" },
  //   { label: "资质6" },
  //   { label: "资质7" },
  //   { label: "资质8" },
  //   { label: "资质9" },
  //   { label: "资质10" }
  // ]
}
</script>
<style lang="stylus" >
.detail-vice-intro
  .el-table
    margin-bottom 15px
    &:first-child
      margin-top 15px
  .cell 
    position relative
    input[type="file"]
      position absolute
      left 0
      top 0
      width 100%
      height 100%
      opacity 0
  .el-date-editor.el-input
    max-width 130px
    width 100%
  .el-dialog
    width auto
  .el-dialog__body
    text-align center
</style>