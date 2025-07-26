import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useProjectStore } from '../stores/useProjectStore';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createProject } = useProjectStore();
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'p5' | 'three'>('p5');
  const [error, setError] = useState('');

  const handleCreate = () => {
    setError('');
    
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    createProject(projectName.trim(), projectType);
    
    // Reset form and close
    setProjectName('');
    setProjectType('p5');
    onClose();
  };

  const handleClose = () => {
    setProjectName('');
    setProjectType('p5');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Project
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <Input
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Awesome Art"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div>
          <label htmlFor="project-type" className="block text-sm font-medium text-gray-700 mb-1">
            Project Type
          </label>
          <Select
            id="project-type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as 'p5' | 'three')}
            options={[
              { value: 'p5', label: 'p5.js (2D Canvas)' },
              { value: 'three', label: 'Three.js (3D WebGL)' }
            ]}
          />
          <p className="mt-1 text-sm text-gray-500">
            {projectType === 'p5' 
              ? 'Best for 2D graphics, patterns, and generative designs'
              : 'Best for 3D scenes, objects, and immersive experiences'
            }
          </p>
        </div>
      </div>
    </Modal>
  );
};