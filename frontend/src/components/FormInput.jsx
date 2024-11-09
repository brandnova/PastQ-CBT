import React from 'react';

const FormInput = ({ 
  label, 
  icon: Icon, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  rightElement = null,
  options = [],
  min,
  max,
  step,
  showValue = false,
  unit
}) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            className="block w-full pl-12 pr-12 py-1.5 text-base rounded-lg
                     border-2 border-gray-300 
                     focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                     hover:border-gray-400
                     transition-all duration-200
                     bg-white shadow-sm
                     appearance-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio-group':
        return (
          <div className="space-y-2 mt-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  className="form-radio text-blue-500 focus:ring-blue-200"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="pt-2">
            <div className="flex items-center space-x-4">
              <div className="relative flex-grow">
                <input
                  type="range"
                  name={name}
                  id={name}
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={onChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-blue-100
                           accent-blue-500
                           [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:bg-blue-500
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:transition-all
                           [&::-webkit-slider-thumb]:duration-150
                           [&::-webkit-slider-thumb]:hover:scale-110
                           [&::-moz-range-thumb]:w-4
                           [&::-moz-range-thumb]:h-4
                           [&::-moz-range-thumb]:appearance-none
                           [&::-moz-range-thumb]:bg-blue-500
                           [&::-moz-range-thumb]:border-0
                           [&::-moz-range-thumb]:rounded-full
                           [&::-moz-range-thumb]:transition-all
                           [&::-moz-range-thumb]:duration-150
                           [&::-moz-range-thumb]:hover:scale-110"
                />
                <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                  <span>{min}{unit}</span>
                  <span>{max}{unit}</span>
                </div>
              </div>
              <div className="flex items-center justify-center bg-gray-100 rounded-md px-3 py-1 min-w-[4rem]">
                <span className="text-sm font-medium text-gray-700">{value}{unit}</span>
              </div>
            </div>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            name={name}
            id={name}
            required={required}
            className="block w-full pl-12 pr-12 py-1.5 text-base rounded-lg
                     border-2 border-gray-300 
                     focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                     hover:border-gray-400
                     transition-all duration-200
                     bg-white shadow-sm
                     [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
          />
        );

      default:
        return (
          <input
            type={type}
            name={name}
            id={name}
            required={required}
            className="block w-full pl-12 pr-12 py-1.5 text-base rounded-lg
                     border-2 border-gray-300 
                     focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                     hover:border-gray-400
                     transition-all duration-200
                     bg-white shadow-sm"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        );
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label 
          htmlFor={name} 
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
        </label>
      </div>
      <div className="relative">
        {Icon && type !== 'range' && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-500" />
          </div>
        )}
        {Icon && type === 'range' && (
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4 text-gray-500" />
          </div>
        )}
        {renderInput()}
        {rightElement && type !== 'range' && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInput;