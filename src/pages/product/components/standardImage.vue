<template>
  <div class="standard-image">
    <el-card class="box-card">
      <div slot="header">
        <span>文描图片</span>
      </div>
      <el-row :gutter="30" type="flex">
        <div v-for="index in 10" :key="index">
          <el-card :body-style="{ padding: '0px' }">
            <div class="img">
              <input-file-upload @change="fileUpload(index-1,$event)" v-if="canEdit&& editable">
                <img v-src="imageIntroduce[index-1]" v-if="imageIntroduce[index-1]" />
                <i class="el-icon-upload2"></i>
              </input-file-upload>
              <img v-src="imageIntroduce[index-1]" v-if="!canEdit && imageIntroduce[index-1]" />
            </div>
            <div style="padding: 14px;">
              <el-button-group>
                <template v-if="imageIntroduce[index-1]">
                  <el-button size="small" type="text" @click="view(index-1)">
                    <i class="el-icon-view"></i>查看
                  </el-button>
                  <el-button
                    size="small"
                    type="text"
                    @click="del(index-1)"
                    v-if="canEdit&&editable"
                  >
                    <i class="el-icon-delete2"></i>删除
                  </el-button>
                </template>
              </el-button-group>

              <p>文描{{index}}</p>
            </div>
          </el-card>
        </div>
      </el-row>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import inputFileUpload from '../../../components/inputFileUpload.vue'
import API from '../../../API'

function imgLazy ( el, value ) {
  let img = new Image()
  img.src = value
  img.onload = () => el.src = value
  img.onerror = () => el.src = 'https://b.linkedcare.cn/saas/static/default.png'
}

@Component( {
  name: 'standardImage',
  components: {
    inputFileUpload
  },
  directives: {
    src: {
      bind ( el, { value } ) {
        imgLazy( el, value )
      },
      update ( el, { value } ) {
        imgLazy( el, value )
      }
    }
  }
} )
export default class standardImage extends Vue {
  @Prop()
  spu: any
  @Prop()
  editable: boolean
  @Prop( { default: true } )
  canEdit: boolean
  get imageIntroduce (): any[] { // 文描
    let introduce = this.spu.imageIntroduce || ''
    return introduce.split( ';' )
  }
  set imageIntroduce ( imageIntroduce ) {
    this.spu.imageIntroduce = imageIntroduce.join( ';' )
  }

  fileUpload ( key, $event ) {
    let o
    let file = $event.target.files[ 0 ] || {}
    let fileType = ( file.name || '' ).split( '.' )[ 1 ].toLowerCase()
    if ( !( /(bmp|jpg|jpeg|png|gif|svg)/.test( fileType ) ) ) {
      return this.$message( {
        type: 'error',
        message: "上传图片格式错误！"
      } )
    }

    o = this.viceFileUpload( key, file )

    o.id = this.$route.params.id
    o[ 'imgPath[0]' ] = file
    const formData = new FormData()
    for ( let i in o ) {
      formData.append( i, o[ i ] )
    }
    this.$http( API.fileUpload, formData, {
      headers: {
        'Content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      let arr = this.imageIntroduce.concat()
      arr.splice( key, 1, file.name )
      this.imageIntroduce = arr
      // this.spu.imageIntroduce = o.imageIntroduce
      this.$notify( {
        type: 'success',
        message: data.msg
      } )
    }, rej => {
      this.$notify( {
        type: 'error',
        message: '上传错误！'
      } )
    } )
  }
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
        let t = v.split( '/' )
        let last = t[ t.length - 1 ]
        arr.splice( i, 1, last.split( '?' )[ 0 ] )
      }
    } )
    arr.splice( o.order, 1, file.name )
    o.imageIntroduce = arr.join( ';' )
    return o
  }

  view ( order ) {
    let o: any = {
      order,
      type: '4',
      id: this.$route.params.id
    }
    this.getPicPath( o )
  }
  del ( index ) {
    let o: any = {
      index,
      type: '3',
      id: this.$route.params.id
    }
    this.delPicPath( o )
  }
  getPicPath ( o ) {
    this.$http( API.getPicPath, o ).then( ( { data } ) => {
      let index = o.order
      this.imageIntroduce.splice( index, 1, data.imgPath + '?' + Math.random() )
      this.imageIntroduce = this.imageIntroduce
    } )
  }
  delPicPath ( o ) {
    this.$http( API.delPicPath, o ).then( ( { data } ) => {
      let { index } = o
      this.imageIntroduce.splice( index, 1, '' )
      this.imageIntroduce = this.imageIntroduce
      this.$message( '删除成功' )
    } )
  }
}
</script>
<style lang="stylus" scoped>
.el-row
  flex-wrap wrap
  & > div
    width 20%
    flex-grow 0
    flex-shrink 0
    padding 8px
    box-sizing border-box
.input-file-upload
  width 100%
  height 100%
  display flex !important
  justify-content center
  align-items center
  border 1px dotted #ccc
  .el-icon-upload2
    position absolute
    left 50%
    top 50%
    z-index 9
    transform translate(-50%, -50%)
  &:hover
    .el-icon-upload2
      visibility visible
.el-col
  margin-bottom 20px
.el-button-group
  height 40px
.img
  width 100%
  height 200px
img
  width 100%
  max-height 100%
  & + .el-icon-upload2
    visibility hidden
</style>
