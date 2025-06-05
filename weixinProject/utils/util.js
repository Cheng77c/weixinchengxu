// util.js
/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @param {string} format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  
  const formatMap = {
    'YYYY': year,
    'MM': padZero(month),
    'M': month,
    'DD': padZero(day),
    'D': day,
    'HH': padZero(hour),
    'H': hour,
    'mm': padZero(minute),
    'm': minute,
    'ss': padZero(second),
    's': second
  };
  
  return format.replace(/(YYYY|MM|M|DD|D|HH|H|mm|m|ss|s)/g, match => formatMap[match]);
};

/**
 * 数字前补零
 * @param {number} n 数字
 * @returns {string} 补零后的字符串
 */
const padZero = n => {
  return n < 10 ? '0' + n : '' + n;
};

/**
 * 格式化文件大小
 * @param {number} size 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
const formatFileSize = (size) => {
  if (size === null || size === undefined) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let index = 0;
  
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }
  
  return size.toFixed(2) + ' ' + units[index];
};

module.exports = {
  formatDate,
  padZero,
  formatFileSize
}; 