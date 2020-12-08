/* eslint-disable */
import fnChineseFirstPY from './fnChineseFirstPY'

let checkCn = function ( str ) {
  let reg = new RegExp( "[\\u4E00-\\u9FFF]+", "g" );
  return reg.test( str );
};
// str 输入的文字
// datas查询的数据集合
// id 查询的字段
const firstPYSearch = function ( str, datas, id ) {
  let l = datas.length, selected = [];


  function fn( v ) {
    selected.push( v )
  }
  for ( let j = 0; j < l; j++ ) {
    let data = datas[ j ],
      text = data[ id ].toLocaleLowerCase()
    str = str.toLocaleLowerCase()
    if ( checkCn( str ) ) {// 常规中文索引
      var dx = text.indexOf( str );
      if ( dx >= 0 ) fn( data );
    } else {// 字母索引
      let arrayq = fnChineseFirstPY( text );
      if ( arrayq.length > 1 ) {// 多音字
        for ( let i = 0; i < arrayq.length; i++ ) {
          var dx = arrayq[ i ].toLocaleLowerCase().indexOf( str );
          if ( dx >= 0 ) {
            fn( data );
            break;
          }
        }
      } else {// 非多音字
        var dx = arrayq.join( '' ).toLocaleLowerCase().indexOf( str );
        if ( dx >= 0 ) fn( data );
      }
    }
  }
  return selected
}
export default firstPYSearch