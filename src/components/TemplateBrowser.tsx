import React, { useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  ALL_TEMPLATES, 
  TEMPLATE_CATEGORIES, 
  searchTemplates,
  type Template 
} from '../templates';

interface TemplateBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ isOpen, onClose }) => {
  const { createProject } = useProjectStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'p5' | 'three'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const getFilteredTemplates = (): Template[] => {
    let templates = ALL_TEMPLATES;

    // Filter by search query
    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      templates = templates.filter(t => t.type === selectedType);
    }

    return templates;
  };

  const handleCreateFromTemplate = (template: Template) => {
    const projectName = `${template.name} - ${new Date().toLocaleDateString()}`;
    createProject(projectName, template.type);
    
    // Update the project with template code
    setTimeout(() => {
      const store = useProjectStore.getState();
      if (store.currentProject) {
        store.updateCode(template.code);
      }
    }, 100);
    
    onClose();
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Template Browser</h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              ×
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'p5', label: 'p5.js' },
                { value: 'three', label: 'Three.js' }
              ]}
              className="w-32"
            />
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...TEMPLATE_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
              className="w-40"
            />
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No templates found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <div className="flex gap-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        template.type === 'p5' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCreateFromTemplate(template)}
                      size="sm"
                      className="flex-1"
                    >
                      Use Template
                    </Button>
                    <Button
                      onClick={() => {
                        // Preview functionality - show code in modal
                        alert(`Preview:\n\n${template.code.slice(0, 200)}...`);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};