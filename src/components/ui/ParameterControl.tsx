import React from 'react';
import type { ProjectParameter } from '../../types';

interface ParameterControlProps {
  parameter: ProjectParameter;
  value: number | boolean | string;
  onChange: (value: number | boolean | string) => void;
}

export const ParameterControl: React.FC<ParameterControlProps> = ({
  parameter,
  value,
  onChange
}) => {
  const renderControl = () => {
    switch (parameter.type) {
      case 'number':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={parameter.min ?? 0}
              max={parameter.max ?? 100}
              step={parameter.step ?? 1}
              value={value as number}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{parameter.min ?? 0}</span>
              <input
                type="number"
                value={value as number}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center"
                min={parameter.min}
                max={parameter.max}
                step={parameter.step}
              />
              <span className="text-xs text-gray-500">{parameter.max ?? 100}</span>
            </div>
          </div>
        );
      
      case 'boolean':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">{value ? 'True' : 'False'}</span>
          </label>
        );
      
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded font-mono"
              placeholder="#000000"
            />
          </div>
        );
      
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
          >
            {parameter.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {parameter.name}
        </label>
        <span className="text-xs text-gray-500 uppercase">{parameter.type}</span>
      </div>
      
      {parameter.description && (
        <p className="text-xs text-gray-600 mb-2">{parameter.description}</p>
      )}
      
      {renderControl()}
    </div>
  );
};