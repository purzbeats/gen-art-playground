import type { ProjectParameter } from '../types';

export interface ParsedParameter {
  name: string;
  type: 'number' | 'boolean' | 'color' | 'select' | 'vector2' | 'vector3' | 'range';
  defaultValue: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

/**
 * Parses @param comments from code to extract parameter definitions
 * 
 * Supported formats:
 * @param {number} name - description [min=0, max=100, step=1]
 * @param {boolean} name - description
 * @param {color} name - description [default=#ff0000]
 * @param {select} name - description [options=red,blue,green]
 * @param {vector2} name - description [default=0,0, step=0.1]
 * @param {vector3} name - description [default=0,0,0, step=0.1]  
 * @param {range} name - description [default=0,100, step=1]
 */
export function parseParametersFromCode(code: string): ParsedParameter[] {
  const paramRegex = /@param\s+\{(number|boolean|color|select|vector2|vector3|range)\}\s+(\w+)(?:\s*-\s*([^[\n]+))?(?:\s*\[([^\]]+)\])?/g;
  const parameters: ParsedParameter[] = [];
  
  let match;
  while ((match = paramRegex.exec(code)) !== null) {
    const [, type, name, description, options] = match;
    
    const param: ParsedParameter = {
      name,
      type: type as 'number' | 'boolean' | 'color' | 'select' | 'vector2' | 'vector3' | 'range',
      defaultValue: getDefaultValue(type as 'number' | 'boolean' | 'color' | 'select' | 'vector2' | 'vector3' | 'range'),
      description: description?.trim()
    };
    
    // Parse options like [min=0, max=100, step=1] or [options=red,blue,green]
    if (options) {
      parseParameterOptions(param, options);
    }
    
    parameters.push(param);
  }
  
  return parameters;
}

function getDefaultValue(type: string): number | boolean | string {
  switch (type) {
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'color':
      return '#000000';
    case 'select':
      return '';
    case 'vector2':
      return '0, 0';
    case 'vector3':
      return '0, 0, 0';
    case 'range':
      return '0, 100';
    default:
      return 0;
  }
}

function parseParameterOptions(param: ParsedParameter, optionsString: string) {
  const optionPairs = optionsString.split(',').map(s => s.trim());
  
  for (const pair of optionPairs) {
    const [key, value] = pair.split('=').map(s => s.trim());
    
    switch (key) {
      case 'min':
        param.min = parseFloat(value);
        break;
      case 'max':
        param.max = parseFloat(value);
        break;
      case 'step':
        param.step = parseFloat(value);
        break;
      case 'default':
        if (param.type === 'number') {
          param.defaultValue = parseFloat(value);
        } else if (param.type === 'boolean') {
          param.defaultValue = value.toLowerCase() === 'true';
        } else {
          param.defaultValue = value;
        }
        break;
      case 'options':
        param.options = value.split(',').map(s => s.trim());
        if (param.type === 'select' && param.options.length > 0) {
          param.defaultValue = param.options[0];
        }
        break;
    }
  }
}

/**
 * Converts parsed parameters to ProjectParameter format
 */
export function convertToProjectParameters(parsedParams: ParsedParameter[]): ProjectParameter[] {
  return parsedParams.map(param => ({
    name: param.name,
    type: param.type,
    value: param.defaultValue,
    min: param.min,
    max: param.max,
    step: param.step,
    options: param.options,
    description: param.description
  }));
}

/**
 * Updates code with current parameter values by replacing variable declarations
 */
export function injectParametersIntoCode(code: string, parameters: ProjectParameter[]): string {
  let updatedCode = code;
  
  // For each parameter, find and replace const/let/var declarations
  parameters.forEach(param => {
    let value: string;
    
    switch (param.type) {
      case 'color':
      case 'select':
        value = `"${param.value}"`;
        break;
      case 'vector2':
      case 'vector3':
      case 'range':
        // For vector and range types, inject as array
        const components = String(param.value).split(',').map(v => v.trim());
        value = `[${components.join(', ')}]`;
        break;
      default:
        value = String(param.value);
    }
    
    // Match variable declarations like: const paramName = anything;
    const varRegex = new RegExp(`((?:const|let|var)\\s+${param.name}\\s*=\\s*)[^;\\n]+`, 'g');
    updatedCode = updatedCode.replace(varRegex, `$1${value}`);
  });
  
  return updatedCode;
}