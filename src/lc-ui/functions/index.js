import Vue from 'vue'
import Dialog from '../components/dialog/dialog2.vue'

function createComp( config = {} ) {
  let data = {
    props: {
      title: config.title,
      size: config.size,
      template: config.template,
      props: config.props,
      confirm: config.confirm
    }
  }
  if ( config.close ) {
    data.on = {
      close: config.close
    }
  }
  const instance = new Vue( {
    render( createElement ) {
      if ( config.slots ) {
        data.scopedSlots = config.slots( createElement )
      }
      return createElement( Dialog, data, [] )
    },
    methods: {
      init() {
        document.body.appendChild( this.$el )
      },
      destroy() {
        this.$destroy()
        document.body.removeChild( this.$el )
      }
    }
  } )
  instance.$mount()
  instance.init()
  const component = instance.$children[ 0 ]
  component.destroy = instance.destroy
  component.show()
  return component
}

Vue.prototype.$popup = createComp
