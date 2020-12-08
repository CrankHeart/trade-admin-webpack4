import {
  DataSet,
  Field,
  Record,
  Dialog,
  Title,
  Card
} from './modules'
import './dataSet'
import './functions'

const components = [
  DataSet,
  Field,
  Record,
  Dialog,
  Title,
  Card
];

function install( Vue ) {
  if ( install.installed ) {
    return
  }
  install.installed = true
  components.forEach( ( Component ) => {
    Vue.use( Component )
  } )
}

const LC = {
  version: '1.0.0',
  install
}

components.forEach( ( Component ) => {
  const name = Component.name.replace( /lc-/, '' )
  LC[ name ] = Component
} )

export default LC
