import AptitudePop from './aptitudePop.vue'
import { Component, Prop } from 'vue-property-decorator'
import API from '../../../API'
import { compare } from '../../../utils/'
@Component( {
  name: 'imgPop'
} )
export default class ImgPop extends AptitudePop {
  imgType = 'imgId'
  config = [
    { prop: 'index', label: '序号', width: '70px' },
    { prop: 'relativePath', label: '图片', width: '' },
    { prop: 'control', label: '操作' },
  ]
  uploadImg = API.uploadGoodsImg

  deleteInfo = API.deleteGoodsImg

  get title () {
    let { name, specification } = this.item
    return `${name || specification}图片管理`
  }
  // callBack = null
  // showSortBtn = false
  handleClose ( bo?) {
    if ( bo !== true ) {
      this.item.imgList = this.dataList.sort( compare( 'sort' ) )
    }
    this.$emit( 'input', false )
  }
  handleSubmit () {
    let arr = this.dataList.filter( v => v.id )
    let { type } = this.$route.query
    if ( type !== undefined ) {
      this.callBack( { id: this.item.id, type: 3 } )
    }
    if ( arr.every( ( v, i ) => v.sort == i ) ) {
      this.handleClose()
      return
    }
    let imgs = arr.map( ( v, i ) => ( { imgId: v.id, sequence: i } ) )
    let { id } = this.item
    if ( arr.length ) {
      this.$http( API.updateGoodsImgInfo, {
        type: this.type,
        goodsId: id,
        imgs
      } ).then( () => {
        this.handleClose( true )
      } )
    } else {
      this.handleClose()
    }
    // this.handleClose()
    // console.log( this.dataList )

    // {
    //   type,
    //   goodsIs
    //   this.dataList
    // }
  }

  getData () {
    this.item.imgList.forEach( ( v, i ) => ( Object.assign( v, { sort: v.sequence, index: i } ) ) )
    this.dataList = this.item.imgList
  }
  fileUploadCallBack ( data, item ) {
    let { absolutePath, relativePath, imgId } = data

    this.$set( item, 'id', imgId )
    this.$set( item, 'sort', item.sort )
    this.$set( item, 'relativePath', relativePath )
    this.$set( item, 'absolutePath', absolutePath )
  }
  delDataItem ( item: any ) {
    let i = this.dataList.indexOf( item )
    this.dataList.splice( i, 1 )
    if ( item.id ) {
      this.$http( this.deleteInfo, {
        type: this.type,
        imgId: item.id,
        goodsId: this.item.id
      } ).then( ( { data } ) => {
        this.$notify( {
          type: 'success',
          message: '删除成功！'
        } )
      } )
    }
  }
}