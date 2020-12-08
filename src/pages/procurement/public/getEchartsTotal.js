export default function getTotal( series ) {
  let result = []
  series.forEach( item => {
    for ( let i = 0; i < item.data.length; i++ ) {
      let _item = item.data[ i ]
      if ( _item && _item.value ) {
        if ( !result[ i ] ) {
          result[ i ] = _item.value
        } else {
          result[ i ] += _item.value
        }
      }
    }
  } );
  let arr = []
  let total = {
    type: "bar",
    stack: "risk",
    data: arr
  }
  result.forEach( val => {
    let item = {
      value: 0.0000001,
      itemStyle: {
        normal: {
          color: "rgba(0,0,0,0)"
        }
      },
      label: {
        normal: {
          show: true,
          color: 'black',
          position: "insideBottom",
          formatter: `${val}`,
        }
      }
    }
    arr.push( item )
  } );
  series.push( total )
}
