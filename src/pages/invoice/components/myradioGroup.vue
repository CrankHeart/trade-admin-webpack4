
<script>
import Vue from 'vue'
export default {
  name: 'myradio-group',
  props: {
    value: {
      type: Number
    },

  },
  computed: {
  },
  watch: {
    myValue( val ) {
      this.$emit( 'input', this.myValue )
    },
    value( val ) {
      this.myValue = val
      // 如果group 值变化,通知radios 更新状态
      this.sendMsgToChilds( val )
    }
  },
  data() {
    return {
      myValue: null,
      eventHub: new Vue()
    }
  },
  computed: {
  },
  methods: {
    sendMsgToChilds( msg ) {
      // 向子类发送广播
      this.$children.forEach( child => {
        child.subCall && child.subCall( { value: msg } )
      } )
    }
  },
  render( h ) {
    let self = this
    return h( 'div', {
      on: {
      }
    }, self.$slots.default )
  },
  created() {
    let that = this
    this.eventHub.$on( 'radioclick', ( e ) => {
      that.myValue = e.value
    } )
  }
}
</script>
<style lang="stylus" scoped>
.invoice-list-item
  border 1px solid #E3E3E3
  position relative
  box-sizing border-box
  padding 15px 50px 15px 50px
  font-size 14px
  .checkbox
    position absolute
    top 50px
    left 15px
    cursor pointer
.invoice-list-item-text
  width 50%
  overflow hidden
  text-overflow ellipsis
  line-height 20px
  float left
.invoice-list-title
  margin-top 15px
.oper
  position absolute
  top -17px
  right 0px
.oper
  .oper-item
    background #50bfff
    color #fff
    padding 0 15px
  .default
    background #ff5000
    cursor default
.clear
  clear both
</style>

