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
          <div className="space-y-2">
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
            {/* Color palette */}
            <div className="grid grid-cols-8 gap-1">
              {[
                '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff',
                '#ff8000', '#8000ff', '#0080ff', '#80ff00', '#ff0080', '#00ff80', '#808080', '#404040'
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => onChange(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
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

      case 'vector2':
        const vec2Value = (value as string).split(',').map(v => parseFloat(v.trim()) || 0);
        const [x, y] = vec2Value.length >= 2 ? vec2Value : [0, 0];
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                value={x}
                onChange={(e) => onChange(`${parseFloat(e.target.value) || 0}, ${y}`)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                step={parameter.step || 0.1}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={y}
                onChange={(e) => onChange(`${x}, ${parseFloat(e.target.value) || 0}`)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                step={parameter.step || 0.1}
              />
            </div>
          </div>
        );

      case 'vector3':
        const vec3Value = (value as string).split(',').map(v => parseFloat(v.trim()) || 0);
        const [vx, vy, vz] = vec3Value.length >= 3 ? vec3Value : [0, 0, 0];
        return (
          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                value={vx}
                onChange={(e) => onChange(`${parseFloat(e.target.value) || 0}, ${vy}, ${vz}`)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                step={parameter.step || 0.1}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={vy}
                onChange={(e) => onChange(`${vx}, ${parseFloat(e.target.value) || 0}, ${vz}`)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                step={parameter.step || 0.1}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Z</label>
              <input
                type="number"
                value={vz}
                onChange={(e) => onChange(`${vx}, ${vy}, ${parseFloat(e.target.value) || 0}`)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                step={parameter.step || 0.1}
              />
            </div>
          </div>
        );

      case 'range':
        const rangeValue = (value as string).split(',').map(v => parseFloat(v.trim()) || 0);
        const [minVal, maxVal] = rangeValue.length >= 2 ? rangeValue : [0, 100];
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Min</label>
                <input
                  type="number"
                  value={minVal}
                  onChange={(e) => onChange(`${parseFloat(e.target.value) || 0}, ${maxVal}`)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  step={parameter.step || 1}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Max</label>
                <input
                  type="number"
                  value={maxVal}
                  onChange={(e) => onChange(`${minVal}, ${parseFloat(e.target.value) || 0}`)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  step={parameter.step || 1}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Range: {minVal} - {maxVal}
            </div>
          </div>
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