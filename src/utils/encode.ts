/**
 * 搜索值转译工具函数
 */

/**
 * 对搜索条件中的value进行转译
 * 将value转译成"\"1232"\"格式
 * @param value 原始搜索值
 * @returns 转译后的搜索值
 */
export const encodeSearchValue = (value: any): string => {
  // 处理各种类型的输入
  if (value === null || value === undefined) {
    return '';
  }
  
  // 转换为字符串
  const stringValue = String(value);
  
  // 如果为空字符串，直接返回
  if (!stringValue) return stringValue;
  
  // 去除首尾空格
  const trimmedValue = stringValue.trim();
  
  // 如果去除空格后为空，返回空字符串
  if (!trimmedValue) return '';
  
  // 转译成"\"1232"\"格式
  return `"${trimmedValue}"`;
};

/**
 * 批量转译搜索条件数组中的value字段
 * @param columns 搜索条件数组
 * @returns 转译后的搜索条件数组
 */
export const encodeSearchColumns = (columns: any[]): any[] => {
  if (!Array.isArray(columns)) {
    return [];
  }
  
  return columns.map(column => {
    if (!column || typeof column !== 'object') {
      return column;
    }
    
    return {
      ...column,
      value: encodeSearchValue(column.value)
    };
  });
};
