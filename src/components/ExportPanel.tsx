import React, { useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import {
  exportCanvas,
  exportProjectAsJSON,
  exportProjectAsURL,
  getRendererCanvas,
  copyToClipboard,
  type ExportOptions
} from '../utils/exportUtils';

export const ExportPanel: React.FC = () => {
  const { currentProject, setError } = useProjectStore();
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'json' | 'url'>('png');
  const [exportSize, setExportSize] = useState<'current' | 'hd' | 'custom'>('current');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!currentProject) return;
    
    setIsExporting(true);
    setError(null);
    
    try {
      if (exportFormat === 'json') {
        exportProjectAsJSON(currentProject);
      } else if (exportFormat === 'url') {
        const url = exportProjectAsURL(currentProject);
        const copied = await copyToClipboard(url);
        if (copied) {
          setError('✅ Project URL copied to clipboard!');
          setTimeout(() => setError(null), 3000);
        } else {
          setError('Failed to copy URL to clipboard');
        }
      } else {
        // Image export
        const canvas = getRendererCanvas();
        if (!canvas) {
          setError('No canvas found to export');
          return;
        }
        
        const options: ExportOptions = {
          format: exportFormat,
          fileName: `${currentProject.name}-${currentProject.seed}.${exportFormat}`
        };
        
        // Handle different export sizes
        if (exportSize === 'hd') {
          options.width = 1920;
          options.height = 1080;
        } else if (exportSize === 'custom') {
          options.width = customWidth;
          options.height = customHeight;
        }
        
        await exportCanvas(canvas, options);
      }
    } catch (error) {
      setError(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentProject) return null;

  return (
    <>
      {/* Export Panel Toggle Button */}
      <Button
        onClick={() => setIsExportPanelOpen(!isExportPanelOpen)}
        variant={isExportPanelOpen ? 'primary' : 'secondary'}
        size="sm"
      >
        Export
      </Button>

      {/* Export Panel */}
      {isExportPanelOpen && (
        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Export Project</h3>
              <Button
                onClick={() => setIsExportPanelOpen(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                options={[
                  { value: 'png', label: 'PNG Image' },
                  { value: 'svg', label: 'SVG Vector (Coming Soon)' },
                  { value: 'json', label: 'JSON Project File' },
                  { value: 'url', label: 'Shareable URL' }
                ]}
              />
            </div>

            {/* Export Size (only for images) */}
            {(exportFormat === 'png' || exportFormat === 'svg') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Size
                </label>
                <Select
                  value={exportSize}
                  onChange={(e) => setExportSize(e.target.value as any)}
                  options={[
                    { value: 'current', label: 'Current Canvas Size' },
                    { value: 'hd', label: 'HD (1920×1080)' },
                    { value: 'custom', label: 'Custom Size' }
                  ]}
                />
              </div>
            )}

            {/* Custom Size Inputs */}
            {exportSize === 'custom' && (exportFormat === 'png' || exportFormat === 'svg') && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1920)}
                    min={100}
                    max={4000}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1080)}
                    min={100}
                    max={4000}
                  />
                </div>
              </div>
            )}

            {/* Export Description */}
            <div className="text-sm text-gray-600">
              {exportFormat === 'png' && 'Export current artwork as PNG image'}
              {exportFormat === 'svg' && 'Export as scalable vector graphics (coming soon)'}
              {exportFormat === 'json' && 'Export project with code, parameters, and settings'}
              {exportFormat === 'url' && 'Generate shareable URL with project embedded'}
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};