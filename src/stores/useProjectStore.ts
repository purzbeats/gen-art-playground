import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectParameter, RendererConfig, ParameterValue } from '../types';
import { SeededRandomGenerator } from '../utils/seededRNG';
import { importProjectFromURL } from '../utils/exportUtils';

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
  updateParameter: (name: string, value: ParameterValue) => void;
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
  importFromURL: () => void;
}

const DEFAULT_P5_CODE = `// p5.js Generative Art Template
// Use the global seeded random functions: random(), randomRange(), randomInt(), choice()

// @param {number} circleCount - Number of circles to draw [min=10, max=200, default=50]
// @param {number} minSize - Minimum circle size [min=5, max=50, default=10]
// @param {number} maxSize - Maximum circle size [min=20, max=200, default=50]
// @param {color} bgColor - Background color [default=#000000]
// @param {boolean} showStroke - Show circle outlines [default=false]

const circleCount = 50;
const minSize = 10;
const maxSize = 50;
const bgColor = "#000000";
const showStroke = false;

function setup(p) {
  p.background(bgColor);
  
  // Draw random circles with parameters
  for (let i = 0; i < circleCount; i++) {
    p.fill(randomRange(0, 255), randomRange(0, 255), randomRange(0, 255), 150);
    
    if (showStroke) {
      p.stroke(255);
      p.strokeWeight(1);
    } else {
      p.noStroke();
    }
    
    p.circle(
      randomRange(0, p.width),
      randomRange(0, p.height),
      randomRange(minSize, maxSize)
    );
  }
}`;

const DEFAULT_THREE_CODE = `// Three.js Generative Art Template
// Use the global seeded random functions: random(), randomRange(), randomInt(), choice()

// @param {number} cubeCount - Number of cubes to create [min=5, max=100, default=20]
// @param {number} cubeSize - Size of each cube [min=0.1, max=1.0, step=0.1, default=0.2]
// @param {number} spread - How spread out the cubes are [min=1, max=10, default=3]
// @param {color} bgColor - Background color [default=#000000]
// @param {select} shapeType - Type of shape [options=cube,sphere,cylinder]

const cubeCount = 20;
const cubeSize = 0.2;
const spread = 3;
const bgColor = "#000000";
const shapeType = "cube";

function setup(scene, camera, renderer) {
  // Set background color
  renderer.setClearColor(bgColor);
  
  // Create random shapes
  for (let i = 0; i < cubeCount; i++) {
    let geometry;
    
    switch (shapeType) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(cubeSize, 8, 6);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(cubeSize, cubeSize, cubeSize * 2);
        break;
      default:
        geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    }
    
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(random(), random(), random())
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      randomRange(-spread, spread),
      randomRange(-spread, spread),
      randomRange(-spread, spread)
    );
    
    scene.add(mesh);
  }
  
  camera.position.z = 5;
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

      updateParameter: (name: string, value: ParameterValue) => {
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
      },

      importFromURL: () => {
        const project = importProjectFromURL();
        if (project) {
          set(state => ({
            projects: [...state.projects, project],
            currentProject: project
          }));
          // Clear the URL parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('project');
          window.history.replaceState({}, '', url.toString());
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