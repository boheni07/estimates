'use client';

import React from 'react';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string | null | undefined;
  onChange: (val: number) => void;
  allowDecimal?: boolean;
}

export default function FormattedNumberInput({
  value,
  onChange,
  allowDecimal = false,
  className = '',
  placeholder = '0',
  ...props
}: FormattedNumberInputProps) {
  // 숫자 -> 콤마 문자열 포맷팅
  const formatValue = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined || num === '') return '';
    const n = typeof num === 'number' ? num : parseFloat(num.toString().replace(/,/g, ''));
    if (isNaN(n)) return '';
    
    if (allowDecimal) {
      const parts = num.toString().replace(/,/g, '').split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    
    return Math.round(n).toLocaleString('ko-KR');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // 콤마 제거
    const cleanVal = rawVal.replace(/,/g, '');

    if (cleanVal === '') {
      onChange(0);
      return;
    }

    if (allowDecimal) {
      // 숫자 및 소수점만 허용
      if (/^\d*\.?\d*$/.test(cleanVal)) {
        const num = parseFloat(cleanVal);
        onChange(isNaN(num) ? 0 : num);
      }
    } else {
      // 정수만 허용
      const cleanInt = cleanVal.replace(/[^\d]/g, '');
      const num = parseInt(cleanInt, 10);
      onChange(isNaN(num) ? 0 : num);
    }
  };

  const displayString = value === 0 && placeholder !== '' ? (props.min !== undefined && Number(props.min) > 0 ? '' : '0') : formatValue(value);

  return (
    <input
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={displayString}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}
