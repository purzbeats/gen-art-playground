import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { AnimationTimeline, animationPresets } from '../utils/animationUtils';
import { useToast } from '../contexts/ToastContext';
import type { EasingFunction, AnimationSettings } from '../types';

export const AnimationPanel: React.FC = () => {
  const { currentProject, updateProject } = useProjectStore();
  const { showToast } = useToast();
  const [isAnimationPanelOpen, setIsAnimationPanelOpen] = useState(false);
  const [timeline, setTimeline] = useState<AnimationTimeline | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const defaultSettings: AnimationSettings = {
    fps: 60,
    duration: 5,
    loop: true,
    easing: 'linear'
  };

  const animationSettings = currentProject?.animationSettings || defaultSettings;

  // Update timeline when settings change
  useEffect(() => {
    if (currentProject?.isAnimated) {
      const newTimeline = new AnimationTimeline(
        animationSettings.duration,
        animationSettings.fps,
        animationSettings.loop,
        animationSettings.easing
      );
      setTimeline(newTimeline);
    } else {
      setTimeline(null);
    }
  }, [currentProject?.isAnimated, animationSettings]);

  const toggleAnimation = () => {
    if (!currentProject) return;

    const newIsAnimated = !currentProject.isAnimated;
    updateProject({ 
      isAnimated: newIsAnimated,
      animationSettings: newIsAnimated ? animationSettings : undefined
    });

    if (newIsAnimated) {
      showToast('Animation enabled', 'success');
    } else {
      showToast('Animation disabled', 'info');
      if (timeline) {
        timeline.stop();
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  const updateAnimationSettings = (updates: Partial<AnimationSettings>) => {
    if (!currentProject) return;

    const newSettings = { ...animationSettings, ...updates };
    updateProject({ animationSettings: newSettings });
  };

  const playAnimation = () => {
    if (!timeline || isPlaying) return;

    timeline.play((tl) => {
      setCurrentTime(tl.getNormalizedTime());
      
      // Trigger re-render by updating a dummy state
      // This allows the canvas to redraw with new animation time
      window.dispatchEvent(new CustomEvent('animationFrame', { 
        detail: { time: tl.getNormalizedTime(), frame: tl.getCurrentFrame() }
      }));
    });

    setIsPlaying(true);
    showToast('Animation started', 'success');
  };

  const pauseAnimation = () => {
    if (!timeline || !isPlaying) return;

    timeline.pause();
    setIsPlaying(false);
    showToast('Animation paused', 'info');
  };

  const stopAnimation = () => {
    if (!timeline) return;

    timeline.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    showToast('Animation stopped', 'info');
  };

  const applyPreset = (presetKey: keyof typeof animationPresets) => {
    const preset = animationPresets[presetKey];
    updateAnimationSettings({
      duration: preset.duration,
      easing: preset.easing
    });
    showToast(`Applied ${preset.name} preset`, 'success');
  };

  if (!currentProject) return null;

  return (
    <>
      {/* Animation Panel Toggle Button */}
      <Button
        onClick={() => setIsAnimationPanelOpen(!isAnimationPanelOpen)}
        variant={isAnimationPanelOpen ? 'primary' : 'secondary'}
        size="sm"
      >
        Animation
      </Button>

      {/* Animation Panel */}
      {isAnimationPanelOpen && (
        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Animation Controls</h3>
              <Button
                onClick={() => setIsAnimationPanelOpen(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Enable/Disable Animation */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable Animation
              </label>
              <Button
                onClick={toggleAnimation}
                variant={currentProject.isAnimated ? 'primary' : 'secondary'}
                size="sm"
              >
                {currentProject.isAnimated ? 'ON' : 'OFF'}
              </Button>
            </div>

            {currentProject.isAnimated && (
              <>
                {/* Animation Controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={playAnimation}
                    disabled={isPlaying}
                    size="sm"
                    className="flex-1"
                  >
                    {isPlaying ? 'Playing...' : 'Play'}
                  </Button>
                  <Button
                    onClick={pauseAnimation}
                    disabled={!isPlaying}
                    variant="secondary"
                    size="sm"
                  >
                    Pause
                  </Button>
                  <Button
                    onClick={stopAnimation}
                    variant="danger"
                    size="sm"
                  >
                    Stop
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Progress: {Math.round(currentTime * 100)}%
                  </label>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${currentTime * 100}%` }}
                    />
                  </div>
                </div>

                {/* Animation Settings */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      value={animationSettings.duration}
                      onChange={(e) => updateAnimationSettings({ duration: parseFloat(e.target.value) || 1 })}
                      min={0.1}
                      max={60}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FPS
                    </label>
                    <Select
                      value={animationSettings.fps.toString()}
                      onChange={(e) => updateAnimationSettings({ fps: parseInt(e.target.value) })}
                      options={[
                        { value: '24', label: '24 FPS (Cinematic)' },
                        { value: '30', label: '30 FPS (Standard)' },
                        { value: '60', label: '60 FPS (Smooth)' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Easing
                    </label>
                    <Select
                      value={animationSettings.easing}
                      onChange={(e) => updateAnimationSettings({ easing: e.target.value as EasingFunction })}
                      options={[
                        { value: 'linear', label: 'Linear' },
                        { value: 'easeInQuad', label: 'Ease In Quad' },
                        { value: 'easeOutQuad', label: 'Ease Out Quad' },
                        { value: 'easeInOutQuad', label: 'Ease In Out Quad' },
                        { value: 'easeInCubic', label: 'Ease In Cubic' },
                        { value: 'easeOutCubic', label: 'Ease Out Cubic' },
                        { value: 'easeInOutCubic', label: 'Ease In Out Cubic' },
                        { value: 'easeInBack', label: 'Ease In Back' },
                        { value: 'easeOutBack', label: 'Ease Out Back' },
                        { value: 'easeInOutBack', label: 'Ease In Out Back' },
                        { value: 'bounce', label: 'Bounce' }
                      ]}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="loop"
                      checked={animationSettings.loop}
                      onChange={(e) => updateAnimationSettings({ loop: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="loop" className="text-sm text-gray-700">
                      Loop animation
                    </label>
                  </div>
                </div>

                {/* Animation Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(animationPresets).map(([key, preset]) => (
                      <Button
                        key={key}
                        onClick={() => applyPreset(key as keyof typeof animationPresets)}
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        title={preset.description}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> Use <code>animateTime()</code> in your code to access the current animation time (0-1).
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};