import { useEffect } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useToast } from '../contexts/ToastContext';

interface ShortcutHandlers {
  onNewProject?: () => void;
  onOpenProjects?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onToggleCode?: () => void;
  onToggleParameters?: () => void;
  onNewSeed?: () => void;
  onFormat?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const { generateNewSeed, toggleCodeEditor, toggleParameterPanel } = useProjectStore();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).contentEditable === 'true') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + N - New Project
      if (modKey && e.key === 'n') {
        e.preventDefault();
        handlers.onNewProject?.();
        showToast('New project (Cmd+N)', 'info', 1000);
      }

      // Cmd/Ctrl + O - Open Projects
      if (modKey && e.key === 'o') {
        e.preventDefault();
        handlers.onOpenProjects?.();
        showToast('Open projects (Cmd+O)', 'info', 1000);
      }

      // Cmd/Ctrl + S - Save/Export
      if (modKey && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
        showToast('Save project (Cmd+S)', 'info', 1000);
      }

      // Cmd/Ctrl + E - Export
      if (modKey && e.key === 'e') {
        e.preventDefault();
        handlers.onExport?.();
        showToast('Export (Cmd+E)', 'info', 1000);
      }

      // Cmd/Ctrl + \ - Toggle Code Editor
      if (modKey && e.key === '\\') {
        e.preventDefault();
        toggleCodeEditor();
        showToast('Toggle code editor (Cmd+\\)', 'info', 1000);
      }

      // Cmd/Ctrl + P - Toggle Parameters
      if (modKey && e.key === 'p') {
        e.preventDefault();
        toggleParameterPanel();
        showToast('Toggle parameters (Cmd+P)', 'info', 1000);
      }

      // Cmd/Ctrl + G - Generate New Seed
      if (modKey && e.key === 'g') {
        e.preventDefault();
        generateNewSeed();
        showToast('New seed generated (Cmd+G)', 'success', 1000);
      }

      // Cmd/Ctrl + Shift + F - Format Code
      if (modKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        handlers.onFormat?.();
        showToast('Format code (Cmd+Shift+F)', 'info', 1000);
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        // This is handled by individual modals
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, generateNewSeed, toggleCodeEditor, toggleParameterPanel, showToast]);
};

// Export keyboard shortcut list for documentation
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Cmd/Ctrl', 'N'], description: 'New Project' },
  { keys: ['Cmd/Ctrl', 'O'], description: 'Open Projects' },
  { keys: ['Cmd/Ctrl', 'S'], description: 'Save Project' },
  { keys: ['Cmd/Ctrl', 'E'], description: 'Export' },
  { keys: ['Cmd/Ctrl', '\\'], description: 'Toggle Code Editor' },
  { keys: ['Cmd/Ctrl', 'P'], description: 'Toggle Parameters' },
  { keys: ['Cmd/Ctrl', 'G'], description: 'Generate New Seed' },
  { keys: ['Cmd/Ctrl', 'Shift', 'F'], description: 'Format Code' },
  { keys: ['Esc'], description: 'Close Modals' }
];