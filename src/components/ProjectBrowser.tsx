import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { VirtualScrollList } from './ui/VirtualScrollList';
import { getPlaceholderThumbnail } from '../utils/thumbnailUtils';
import { useToast } from '../contexts/ToastContext';
import type { Project } from '../types';

interface ProjectBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectBrowser: React.FC<ProjectBrowserProps> = ({ isOpen, onClose }) => {
  const { projects, currentProject, loadProject, deleteProject, duplicateProject } = useProjectStore();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'p5' | 'three'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'modified'>('modified');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    // Sort projects
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'modified':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return sorted;
  }, [projects, searchQuery, filterType, sortBy]);

  const handleLoadProject = (project: Project) => {
    loadProject(project.id);
    showToast(`Loaded project: ${project.name}`, 'success');
    onClose();
  };

  const handleDeleteProject = (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProject(project.id);
      showToast(`Deleted project: ${project.name}`, 'info');
      setSelectedProject(null);
    }
  };

  const handleDuplicateProject = (project: Project) => {
    const newName = `${project.name} (Copy)`;
    duplicateProject(project.id, newName);
    showToast(`Duplicated project as: ${newName}`, 'success');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ProjectCard component for reuse
  const ProjectCard: React.FC<{
    project: Project;
    isCurrentProject: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onLoad: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    formatDate: (date: Date) => string;
  }> = ({ project, isCurrentProject, isSelected, onSelect, onLoad, onDuplicate, onDelete, formatDate }) => (
    <div
      className={`group relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        isCurrentProject ? 'ring-2 ring-blue-500' : 'border-gray-200'
      } ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
      onClick={onSelect}
      onDoubleClick={onLoad}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <img
          src={project.thumbnail || getPlaceholderThumbnail(project.type)}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        {isCurrentProject && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Current
          </div>
        )}
      </div>

      {/* Project info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs px-2 py-1 rounded ${
            project.type === 'p5' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {project.type}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>

      {/* Actions overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLoad();
            }}
          >
            Open
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            Duplicate
          </Button>
          {!isCurrentProject && (
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Browser"
      size="xl"
    >
      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'p5', label: 'p5.js' },
              { value: 'three', label: 'Three.js' }
            ]}
            className="w-32"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            options={[
              { value: 'modified', label: 'Last Modified' },
              { value: 'date', label: 'Date Created' },
              { value: 'name', label: 'Name' }
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Project grid */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No projects found</p>
          <p className="text-sm mt-2">
            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first project to get started'}
          </p>
        </div>
      ) : filteredAndSortedProjects.length > 20 ? (
        // Use virtual scrolling for large lists
        <VirtualScrollList
          items={filteredAndSortedProjects}
          itemHeight={200}
          containerHeight={400}
          className="pr-2"
          renderItem={(project) => (
            <div className="px-1 pb-4">
              <ProjectCard
                project={project}
                isCurrentProject={currentProject?.id === project.id}
                isSelected={selectedProject === project.id}
                onSelect={() => setSelectedProject(project.id)}
                onLoad={() => handleLoadProject(project)}
                onDuplicate={() => handleDuplicateProject(project)}
                onDelete={() => handleDeleteProject(project)}
                formatDate={formatDate}
              />
            </div>
          )}
        />
      ) : (
        // Regular grid for smaller lists
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isCurrentProject={currentProject?.id === project.id}
              isSelected={selectedProject === project.id}
              onSelect={() => setSelectedProject(project.id)}
              onLoad={() => handleLoadProject(project)}
              onDuplicate={() => handleDuplicateProject(project)}
              onDelete={() => handleDeleteProject(project)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Footer with project count */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600 text-center">
        {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </Modal>
  );
};