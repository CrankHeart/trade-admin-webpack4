import Vue from 'vue';
import { formatMyDate } from '../utils/index';

Vue.filter( 'currency', ( value ) => {
  value = ( Number( value ) || 0 ).toFixed( 2 );
  const index = value.lastIndexOf( '.' );
  let intPart = value.substring( 0, index );
  const pointPart = value.substring( index + 1, value.length );

  const re = /(-?\d+)(\d{3})/;
  while ( re.test( intPart ) ) {
    intPart = intPart.replace( re, '$1,$2' );
  }

  return `${intPart}.${pointPart}`;
} );

// * 默认为0.00, 不想为0.00传null过来
Vue.filter( 'fixed2', ( value, type ) => {
  if (
    typeof value == 'undefined' ||
    value === null ||
    isNaN( parseFloat( value ) )
  ) {
    return type === null ? null : 0.0;
  }
  return value.toFixed( 2 );
} );

// 格式化日期
Vue.filter( 'mayDate', function ( value, key ) {
  if ( key === 'deliveryDate' ) {
    return formatMyDate( value && value.time, 'yyyy-MM-dd' );
  }
  return value;
} )
