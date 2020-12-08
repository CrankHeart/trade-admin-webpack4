


export function validateMoney ( msg: any ) {
  // 验证正整数
  return function ( rule, value, callback ) {
    value += '';
    value = value.trim();
    // 允许不填
    if ( value == '' ) {
      return callback( '金额不能为空' );
    }

    // 排除 "","0","0.0","0.00"格式
    if ( !value || value == '0' || value == '0.0' || value == '0.00' ) {
      return callback( new Error( `${msg}金额不能为0` ) );
    }

    // 验证是否是数字
    const n = Number( value );
    if ( isNaN( n ) ) {
      return callback( new Error( '请输入数字' ) );
    }

    if ( n > 0 && n <= 99999.99 ) {
      const reg = /^(0|[1-9]\d*)(\s|$|\.\d{1,2}\b)/;

      if ( !reg.test( value ) ) {
        return callback(
          new Error( '请输入大于等于0的金额，小数点最多包含两位小数' )
        );
      }
    } else {
      return callback( new Error( '请输入[0.01—99999.99]之间的数' ) );
    }

    callback();
  };
}