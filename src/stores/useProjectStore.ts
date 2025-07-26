import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectParameter, RendererConfig } from '../types';
import { SeededRandomGenerator } from '../utils/seededRNG';

interface ProjectStore {
  // Current project state
  currentProject: Project | null;
  projects: Project[];
  
  // Renderer state
  rendererConfig: RendererConfig;
  
  // UI state
  isCodeEditorOpen: boolean;
  isParameterPanelOpen: boolean;
  currentError: string | null;
  
  // Actions
  createProject: (name: string, type: 'p5' | 'three') => void;
  loadProject: (id: string) => void;
  updateProject: (updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string, newName: string) => void;
  
  // Code and parameters
  updateCode: (code: string) => void;
  updateSeed: (seed: string) => void;
  generateNewSeed: () => void;
  updateParameter: (name: string, value: any) => void;
  addParameter: (parameter: ProjectParameter) => void;
  removeParameter: (name: string) => void;
  
  // Renderer config
  updateRendererConfig: (config: Partial<RendererConfig>) => void;
  
  // UI actions
  toggleCodeEditor: () => void;
  toggleParameterPanel: () => void;
  setError: (error: string | null) => void;
  
  // Utility
  exportProject: () => string;
  importProject: (projectData: string) => void;
}

const DEFAULT_P5_CODE = `// p5.js Generative Art Template
// Use the global seeded random functions: random(), randomRange(), randomInt(), choice()

function setup(p) {
  p.background(0);
  
  // Draw some random circles
  for (let i = 0; i < 50; i++) {
    p.fill(randomRange(0, 255), randomRange(0, 255), randomRange(0, 255), 150);
    p.noStroke();
    p.circle(
      randomRange(0, p.width),
      randomRange(0, p.height),
      randomRange(10, 50)
    );
  }
}`;

const DEFAULT_THREE_CODE = `// Three.js Generative Art Template
// Use the global seeded random functions: random(), randomRange(), randomInt(), choice()

function setup(scene, camera, renderer) {
  // Set background color
  renderer.setClearColor(0x000000);
  
  // Create random cubes
  for (let i = 0; i < 20; i++) {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(random(), random(), random())
    });
    
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      randomRange(-3, 3),
      randomRange(-3, 3),
      randomRange(-3, 3)
    );
    
    scene.add(cube);
  }
  
  // No cleanup needed for this simple example
}`;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      rendererConfig: {
        width: 800,
        height: 600,
        pixelDensity: 1
      },
      isCodeEditorOpen: true,
      isParameterPanelOpen: true,
      currentError: null,

      // Project actions
      createProject: (name: string, type: 'p5' | 'three') => {
        const id = Date.now().toString();
        const seed = new SeededRandomGenerator().seed;
        const now = new Date();
        
        const newProject: Project = {
          id,
          name,
          type,
          code: type === 'p5' ? DEFAULT_P5_CODE : DEFAULT_THREE_CODE,
          seed,
          parameters: [],
          createdAt: now,
          updatedAt: now
        };

        set(state => ({
          projects: [...state.projects, newProject],
          currentProject: newProject
        }));
      },

      loadProject: (id: string) => {
        const project = get().projects.find(p => p.id === id);
        if (project) {
          set({ currentProject: project });
        }
      },

      updateProject: (updates) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updatedProject = {
          ...currentProject,
          ...updates,
          updatedAt: new Date()
        };

        set(state => ({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === currentProject.id ? updatedProject : p
          )
        }));
      },

      deleteProject: (id: string) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        }));
      },

      duplicateProject: (id: string, newName: string) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return;

        const newId = Date.now().toString();
        const now = new Date();
        
        const duplicatedProject: Project = {
          ...project,
          id: newId,
          name: newName,
          createdAt: now,
          updatedAt: now
        };

        set(state => ({
          projects: [...state.projects, duplicatedProject]
        }));
      },

      // Code and parameters
      updateCode: (code: string) => {
        get().updateProject({ code });
      },

      updateSeed: (seed: string) => {
        get().updateProject({ seed });
      },

      generateNewSeed: () => {
        const newSeed = new SeededRandomGenerator().seed;
        get().updateProject({ seed: newSeed });
      },

      updateParameter: (name: string, value: any) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updatedParameters = currentProject.parameters.map(param =>
          param.name === name ? { ...param, value } : param
        );

        get().updateProject({ parameters: updatedParameters });
      },

      addParameter: (parameter: ProjectParameter) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updatedParameters = [...currentProject.parameters, parameter];
        get().updateProject({ parameters: updatedParameters });
      },

      removeParameter: (name: string) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updatedParameters = currentProject.parameters.filter(
          param => param.name !== name
        );
        get().updateProject({ parameters: updatedParameters });
      },

      // Renderer config
      updateRendererConfig: (config: Partial<RendererConfig>) => {
        set(state => ({
          rendererConfig: { ...state.rendererConfig, ...config }
        }));
      },

      // UI actions
      toggleCodeEditor: () => {
        set(state => ({ isCodeEditorOpen: !state.isCodeEditorOpen }));
      },

      toggleParameterPanel: () => {
        set(state => ({ isParameterPanelOpen: !state.isParameterPanelOpen }));
      },

      setError: (error: string | null) => {
        set({ currentError: error });
      },

      // Utility
      exportProject: () => {
        const { currentProject } = get();
        if (!currentProject) return '';
        return JSON.stringify(currentProject, null, 2);
      },

      importProject: (projectData: string) => {
        try {
          const project: Project = JSON.parse(projectData);
          project.id = Date.now().toString(); // Generate new ID
          project.createdAt = new Date();
          project.updatedAt = new Date();

          set(state => ({
            projects: [...state.projects, project],
            currentProject: project
          }));
        } catch (error) {
          console.error('Failed to import project:', error);
          get().setError('Failed to import project: Invalid format');
        }
      }
    }),
    {
      name: 'generative-art-projects',
      partialize: (state) => ({
        projects: state.projects,
        rendererConfig: state.rendererConfig,
        isCodeEditorOpen: state.isCodeEditorOpen,
        isParameterPanelOpen: state.isParameterPanelOpen
      })
    }
  )
);