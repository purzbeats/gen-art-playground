import React, { useEffect } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { ParameterControl } from './ui/ParameterControl';
import { parseParametersFromCode, convertToProjectParameters } from '../utils/parameterParser';
import { Button } from './ui/Button';

export const ParameterPanel: React.FC = () => {
  const {
    currentProject,
    isParameterPanelOpen,
    toggleParameterPanel,
    updateParameter,
    addParameter,
    removeParameter
  } = useProjectStore();

  // Auto-parse parameters from code when code changes
  useEffect(() => {
    if (!currentProject) return;

    const parsedParams = parseParametersFromCode(currentProject.code);
    const newParams = convertToProjectParameters(parsedParams);
    
    // Only update if parameters actually changed to avoid infinite loops
    const existingParamNames = currentProject.parameters.map(p => p.name).sort();
    const newParamNames = newParams.map(p => p.name).sort();
    
    const parametersChanged = 
      existingParamNames.length !== newParamNames.length ||
      existingParamNames.some((name, index) => name !== newParamNames[index]);
    
    if (parametersChanged) {
      // Remove parameters that no longer exist in code
      currentProject.parameters.forEach(param => {
        if (!newParams.find(p => p.name === param.name)) {
          removeParameter(param.name);
        }
      });
      
      // Add or update parameters from code
      newParams.forEach(param => {
        const existing = currentProject.parameters.find(p => p.name === param.name);
        if (!existing) {
          addParameter(param);
        } else if (
          existing.type !== param.type ||
          existing.min !== param.min ||
          existing.max !== param.max ||
          existing.step !== param.step ||
          JSON.stringify(existing.options) !== JSON.stringify(param.options) ||
          existing.description !== param.description
        ) {
          // Update parameter definition but keep current value if compatible
          const updatedParam = { ...param };
          if (existing.type === param.type) {
            updatedParam.value = existing.value;
          }
          removeParameter(param.name);
          addParameter(updatedParam);
        }
      });
    }
  }, [currentProject?.code, currentProject?.parameters, addParameter, removeParameter]);

  if (!currentProject) return null;

  return (
    <>
      {/* Parameter Panel Toggle Button */}
      <Button
        onClick={toggleParameterPanel}
        variant={isParameterPanelOpen ? 'primary' : 'secondary'}
        size="sm"
        className="mb-2"
      >
        Parameters ({currentProject.parameters.length})
      </Button>

      {/* Parameter Panel */}
      {isParameterPanelOpen && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Parameters</h3>
              <Button
                onClick={toggleParameterPanel}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            {currentProject.parameters.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Add @param comments to your code to create interactive controls.
              </p>
            )}
          </div>
          
          {currentProject.parameters.length > 0 && (
            <div className="p-4 max-h-96 overflow-y-auto">
              {currentProject.parameters.map((parameter) => (
                <ParameterControl
                  key={parameter.name}
                  parameter={parameter}
                  value={parameter.value}
                  onChange={(value) => updateParameter(parameter.name, value)}
                />
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 Tip: Use @param comments in your code like:<br/>
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    // @param {"{number}"} size - Circle size [min=10, max=100]
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};