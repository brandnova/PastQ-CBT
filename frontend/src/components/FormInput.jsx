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
  rightElement = null
}) => {
  return (
    <div className="mb-6">
      <label 
        htmlFor={name} 
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          className="block w-full pl-12 pr-12 py-1 text-base rounded-lg
                   border-2 border-gray-300 
                   focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                   hover:border-gray-400
                   transition-all duration-200
                   bg-white shadow-sm
                   placeholder:text-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInput;