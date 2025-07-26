import React, { useMemo, lazy, Suspense } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ErrorBoundary } from './ErrorBoundary';
import * as THREE from 'three';

// Lazy load heavy components
const Editor = lazy(() => import('@monaco-editor/react'));
const P5Renderer = lazy(() => import('./renderers/P5Renderer').then(module => ({ default: module.P5Renderer })));
const ThreeRenderer = lazy(() => import('./renderers/ThreeRenderer').then(module => ({ default: module.ThreeRenderer })));

// Import RNG functions and context
import { createRNGExecutionContext } from '../utils/rngHelpers';

export const Playground: React.FC = () => {
  const {
    currentProject,
    projects,
    rendererConfig,
    isCodeEditorOpen,
    isParameterPanelOpen,
    currentError,
    createProject,
    loadProject,
    updateCode,
    updateSeed,
    generateNewSeed,
    toggleCodeEditor,
    toggleParameterPanel,
    updateRendererConfig,
    setError
  } = useProjectStore();

  // Compile user code safely
  const compiledSketch = useMemo(() => {
    if (!currentProject) return null;

    try {
      setError(null);
      
      // Get RNG functions for current seed
      const rngContext = createRNGExecutionContext(currentProject.seed);
      
      if (currentProject.type === 'p5') {
        // For p5.js, we need to create a function that sets up the sketch
        const wrappedCode = `
          ${currentProject.code}
          
          return function(p) {
            if (typeof setup === 'function') {
              p.setup = () => setup(p);
            }
            if (typeof draw === 'function') {
              p.draw = () => draw(p);
            }
          };
        `;
        
        return new Function('random', 'randomRange', 'randomInt', 'choice', 'shuffle', wrappedCode)(
          rngContext.random, rngContext.randomRange, rngContext.randomInt, rngContext.choice, rngContext.shuffle
        );
      } else {
        // For three.js, we return the setup function directly
        const wrappedCode = `
          ${currentProject.code}
          
          if (typeof setup === 'function') {
            return setup;
          } else {
            return () => {};
          }
        `;
        
        return new Function('random', 'randomRange', 'randomInt', 'choice', 'shuffle', 'THREE', wrappedCode)(
          rngContext.random, rngContext.randomRange, rngContext.randomInt, rngContext.choice, rngContext.shuffle, THREE
        );
      }
    } catch (error) {
      console.error('Code compilation error:', error);
      setError(`Code Error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }, [currentProject, setError]);

  const handleCreateProject = () => {
    const name = prompt('Project name:');
    if (!name) return;
    
    const type = prompt('Project type (p5/three):') as 'p5' | 'three';
    if (type !== 'p5' && type !== 'three') {
      alert('Invalid project type. Please enter "p5" or "three"');
      return;
    }
    
    createProject(name, type);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Generative Art Playground</h1>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleCreateProject} size="sm">
              New Project
            </Button>
            
            {currentProject && (
              <>
                <Button onClick={toggleCodeEditor} variant="secondary" size="sm">
                  {isCodeEditorOpen ? 'Hide Code' : 'Show Code'}
                </Button>
                <Button onClick={toggleParameterPanel} variant="secondary" size="sm">
                  {isParameterPanelOpen ? 'Hide Panel' : 'Show Panel'}
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Project selector */}
        {projects.length > 0 && (
          <div className="mt-3 flex items-center gap-4">
            <Select
              value={currentProject?.id || ''}
              onChange={(e) => loadProject(e.target.value)}
              options={[
                { value: '', label: 'Select a project...' },
                ...projects.map(p => ({ value: p.id, label: `${p.name} (${p.type})` }))
              ]}
              className="w-64"
            />
          </div>
        )}
      </header>

      {/* Error display */}
      {currentError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{currentError}</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        {currentProject && isCodeEditorOpen && (
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">Code Editor</h2>
            </div>
            <div className="flex-1">
              <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-gray-500">Failed to load editor</div>}>
                <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500">Loading editor...</div>}>
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    value={currentProject.code}
                    onChange={(value) => value && updateCode(value)}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* Renderer */}
        <div className={`${isCodeEditorOpen ? 'w-1/2' : 'flex-1'} flex flex-col`}>
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-medium text-gray-900">
              {currentProject ? `${currentProject.name} (${currentProject.type})` : 'No Project Selected'}
            </h2>
            
            {currentProject && (
              <div className="flex items-center gap-2">
                <Input
                  value={currentProject.seed}
                  onChange={(e) => updateSeed(e.target.value)}
                  placeholder="Seed"
                  className="w-32"
                />
                <Button onClick={generateNewSeed} size="sm" variant="secondary">
                  New Seed
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-white">
            {currentProject && compiledSketch ? (
              <ErrorBoundary 
                fallback={<div className="text-center text-red-500">Failed to load renderer</div>}
                onError={(error) => setError(`Renderer Error: ${error.message}`)}
              >
                <Suspense fallback={<div className="text-center text-gray-500">Loading renderer...</div>}>
                  {currentProject.type === 'p5' ? (
                    <P5Renderer
                      sketch={compiledSketch}
                      config={rendererConfig}
                      seed={currentProject.seed}
                      onError={(error) => setError(`Render Error: ${error.message}`)}
                    />
                  ) : (
                    <ThreeRenderer
                      sketch={compiledSketch}
                      config={rendererConfig}
                      seed={currentProject.seed}
                      onError={(error) => setError(`Render Error: ${error.message}`)}
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            ) : (
              <div className="text-center text-gray-500">
                {!currentProject ? (
                  <div>
                    <p className="text-lg mb-4">Welcome to the Generative Art Playground!</p>
                    <Button onClick={handleCreateProject}>Create Your First Project</Button>
                  </div>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Parameter Panel */}
        {currentProject && isParameterPanelOpen && (
          <div className="w-64 border-l border-gray-200 bg-white flex flex-col">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">Parameters</h2>
            </div>
            
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canvas Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={rendererConfig.width}
                      onChange={(e) => updateRendererConfig({ width: parseInt(e.target.value) || 800 })}
                      placeholder="Width"
                    />
                    <Input
                      type="number"
                      value={rendererConfig.height}
                      onChange={(e) => updateRendererConfig({ height: parseInt(e.target.value) || 600 })}
                      placeholder="Height"
                    />
                  </div>
                </div>
                
                {currentProject.parameters.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No parameters defined. Add @param comments to your code to create controls.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};