<template>
  <div>
    <lc-title text="客服中心"></lc-title>
    <el-row type="flex" :gutter="30">
      <el-col :span="16">
        <h3>
          <span>当前会话</span>
        </h3>
        <div :style="{height:boxHeight+20+'px'}">
          <div class="message-box" ref="message-box" :style="{height:boxHeight-105+'px'}">
            <ul>
              <template v-for="(msg,index) in curMsg">
                <li :class="'type-'+msg.type" v-if="msg.type!=='sys'" :key="index">
                  <p
                    v-if="!curMsg[index-1] || (curMsg[index-1].uri!==msg.uri || curMsg[index-1].type!==msg.type)"
                  >
                    <span>{{msg.type?'客服':curUser.name}}</span>

                    {{formatMyDate(msg.time,'MM-dd hh:mm:ss')}}
                    <em
                      v-if="!msg.type || (!msg.type&& (!curMsg[index-1] || curMsg[index-1].uri!==msg.uri))"
                    >
                      <a :href="realUrl(msg.uri)" target="_blank">所在访问的页面 > {{msg.uri}}</a>
                    </em>
                  </p>
                  <p>{{msg.content}}</p>
                </li>
              </template>
            </ul>
            <span
              class="tips"
              v-if="curUser&&curUser.pop"
              @click="readMyMsg(curUser)"
            >您有{{curUser&&curUser.pop}}条未读信息！</span>
          </div>
          <div class="short-cut">
            <el-button type="text" @click="fastReplyVisible=!fastReplyVisible">快速回复</el-button>
            <el-button type="text" class="pull-right" @click="toggleWebNotice">
              <i v-if="showNotice">关闭</i>
              <i v-else>开启</i>桌面提醒
            </el-button>

            <div class="fast-reply" v-if="fastReplyVisible">
              <ul>
                <li
                  v-for="(item,index) in fastReply"
                  :key="index"
                  @click="handleClick(item)"
                >{{item}}</li>
              </ul>
            </div>
          </div>
          <div class="input-textarea">
            <div class="el-textarea">
              <textarea
                rows="2"
                class="el-textarea__inner"
                ref="textarea"
                v-model="reply"
                @keyup.enter="submit"
                @focus="fastReplyVisible = false"
              ></textarea>
            </div>
            <el-button @click="submit">发送</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <h3>
          <span>会员列表</span>
        </h3>

        <div class="custom-user-list box" :style="{height:boxHeight+'px'}">
          <ul>
            <li
              v-for="user in userList"
              :key="user.id"
              :class="{'is-active':curUser&&user.id ===curUser.id,'off-line':!user.online}"
              @click="selectUser(user)"
            >
              <i class="iconfont icon-yonghu"></i>
              <i class="icon-circle pull-right" v-if="hasRead(user)">有新消息{{user.pop}}</i>
              <i class="icon-off-line pull-right" v-if="!user.online">离线</i>
              {{user.name}}
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Inject, Watch } from "vue-property-decorator"
import lcTitle from "../../../components/title.vue"
import { State, Action, Getter } from "vuex-class"
import { htmlEncodeByRegExp } from "../../../utils/"
@Component( {
  name: "custom-server",
  components: {
    lcTitle
  }
} )
export default class CustomServer extends Vue {
  @Getter( "customServer/getterCustoms" ) customs
  @State( state => state.customServer.msgLists )
  msgLists

  @Inject() formatMyDate
  @State( 'clientHeight' ) clientHeight
  @Action( "customServer/readMsg" ) readMsg
  @Action( "customServer/sendMsg" ) sendMsg

  showNotice: boolean = !+( localStorage.showNotice || 0 )
  fastReply = [
    "您好，请问有什么可以帮助您的吗？",
    "感谢理解，我们会尽快给你发货！",
    "感谢理解，我们的实施经理会尽快和您联系，帮您解决问题。",
    "我们的销售经理会尽快上门与您沟通签约事宜。"
  ]
  fastReplyVisible: boolean = false
  reply: string = ""

  get boxHeight () {
    return this.clientHeight - 240
  }
  curUser: any = null
  get curMsg () {
    let curUser = this.curUser
    return curUser ? this.msgLists[ curUser.id ] : []
  }
  @Watch( "customs" )
  customsWatcher ( v ) {
    console.log( v )
  }
  handleClick ( text ) {
    if ( !this.curUser ) {
      return ( this.fastReplyVisible = false )
    }
    this.sendMsg( {
      usrId: this.curUser.id,
      text,
      isAdmin: 1
    } )

    this.fastReplyVisible = false
  }
  submit () {
    let user = this.curUser
    if ( !user ) return console.log( "未选中对话" )
    this.readMyMsg( user )
    let reply = htmlEncodeByRegExp( this.reply.trim() )

    this.sendMsg( {
      usrId: user.id,
      text: reply,
      isAdmin: 1
    } )
    this.reply = ""
  }
  toggleWebNotice () {
    this.showNotice = !this.showNotice
    localStorage.showNotice = +this.showNotice
  }
  realUrl ( uri ) {
    if (
      uri.indexOf( "order/detail" ) > -1 ||
      uri.indexOf( "product/detail" ) > -1
    ) {
      return "/#" + uri.replace( "?orderId=", "/" ).replace( "?productid=", "/" )
    }
  }
  selectUser ( user ) {
    this.curUser = user
    this.msgBoxAutoScrol()
    this.readMyMsg( user )
  }

  readMyMsg ( user ) {
    this.readMsg( {
      user: { id: user.id },
      type: "admin"
    } )
    user.pop = 0
  }
  msgBoxAutoScrol () {
    this.$nextTick( () => {
      let wH = window.innerHeight - 300
      let messageBox: any = this.$refs[ "message-box" ]
      if ( messageBox ) {
        var ul = messageBox.querySelector( "ul" ),
          ulH = ul.offsetHeight
        messageBox.scrollTop = ulH - wH + 120
      }
    } )
  }
  hasRead ( custom ) {
    if ( this.curUser && custom.id == this.curUser.id ) {
      return false
    }
    if ( !custom.pop ) {
      return false
    }
    return true
  }
  get userList () {
    let data = this.customs

    let arr = [],
      arr2 = []
    data = data || {}
    Object.keys( data ).forEach( v => {
      let o = data[ v ]
      if ( o.online ) {
        arr2.push( o )
      } else {
        arr.push( o )
      }
    } )
    arr = arr.sort( compare( "pop" ) )
    function compare ( name ) {
      return function ( o1, o2 ) {
        let v1 = ( o1[ name ] && 1 ) || 0,
          v2 = ( o2[ name ] && 1 ) || 0
        return +( v1 < v2 )
      }
    }
    return arr2.concat( arr )
  }
}
</script>
<style lang="stylus" scoped>
h3
  border-bottom 2px solid #20a0ff
  span
    font-weight normal
    padding 5px 15px
    display inline-block
    background #20a0ff
    color #fff
    border-bottom none
    border-top-left-radius 4px
    border-top-right-radius 4px
.icon-off-line, .icon-circle
  display block
  line-height 20px
  background #20a0ff
  border-radius 6px
  padding 3px 10px
  -webkit-transform scale(0.65)
  transform scale(0.65)
  -webkit-transform-origin right
  transform-origin right
  color #fff
  font-style normal
  margin-top 2px
[class*='icon-'].pull-right +[class*='icon-'].pull-right
  margin-right -25px
.off-line
  color #ccc
.icon-off-line
  background #ccc
.custom-user-list
  li
    line-height 26px
    height 26px
    overflow hidden
    cursor pointer
    &.is-active
      background #ccc
      padding-left 10px
      color #333
.message-box
  border 1px solid #20a0ff
  box-sizing border-box
  padding 20px 30px
  overflow auto
  li
    line-height 30px
    p
      margin-top 0
      margin-bottom 0
      span
        margin-right 20px
      &:last-child
        color #333
        text-indent 20px
        word-break break-all
        &:before
          content '·'
          font-size 16px
          position relative
          left -10px
      em, em a
        color #ccc
        font-size 12px
        font-style normal
        text-decoration none
    &.type-0
      color rgb(78, 169, 233)
    &.type-1
      color #999
.input-textarea
  display flex
  width 100%
  border 1px solid #20a0ff
  .el-textarea
    margin 0
    .el-textarea__inner
      border-radius 0
      height 95px
  button
    border-radius 0
    background rgba(32, 160, 255, 0.8)
    color #fff
    border-left none
    padding 10px 35px
.short-cut
  position relative
  .fast-reply
    position absolute
    left 0
    bottom 34px
    background #efefef
    border 1px solid #ccc
    line-height 30px
    font-size 14px
    li
      padding 0 15px
      cursor pointer
</style>
