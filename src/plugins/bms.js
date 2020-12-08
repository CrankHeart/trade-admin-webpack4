let tempWin = window.parent || window.top

// let OTHER_ORIGIN

// try {
//   const postReady = () => {
//     tempWin.postMessage( { name: 'ready' }, '*' )
//   }
//   const receiveMessage = event => {
//     let msgObj = event.data
//     if ( msgObj.name === 'config' ) {
//       window.UserData.setConfig( event.data.data )
//       OTHER_ORIGIN = event.data.data.msgOrigin
//       tempWin = event.source || tempWin
//     }
//   }
//   window.addEventListener( 'message', receiveMessage, false )
//   postReady()
// } catch ( e ) {
// }

export const bmsMessage = data => {
  tempWin.postMessage( { name: 'bmsMessage', data }, '*' )
}
