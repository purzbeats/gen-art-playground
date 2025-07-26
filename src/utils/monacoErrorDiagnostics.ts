/**
 * Monaco Editor error diagnostics for better error visualization
 */

import type * as Monaco from 'monaco-editor';

export interface CodeError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
}

// Common JavaScript errors and their patterns
const ERROR_PATTERNS = [
  {
    pattern: /ReferenceError: (\w+) is not defined/,
    message: (match: RegExpMatchArray) => `'${match[1]}' is not defined. Did you mean to declare it?`,
    severity: 'error' as const
  },
  {
    pattern: /SyntaxError: Unexpected token/,
    message: () => 'Syntax error: Check for missing brackets, parentheses, or semicolons',
    severity: 'error' as const
  },
  {
    pattern: /TypeError: Cannot read property '(\w+)' of undefined/,
    message: (match: RegExpMatchArray) => `Cannot access property '${match[1]}' of undefined object`,
    severity: 'error' as const
  },
  {
    pattern: /TypeError: (\w+) is not a function/,
    message: (match: RegExpMatchArray) => `'${match[1]}' is not a function. Check if it's defined correctly`,
    severity: 'error' as const
  }
];

// Parse error messages to extract line numbers and details
export function parseErrorMessage(error: string): CodeError[] {
  const errors: CodeError[] = [];
  const lines = error.split('\n');
  
  for (const line of lines) {
    // Try to extract line number from common error formats
    const lineMatch = line.match(/at.*:(\d+):(\d+)/);
    const lineNumber = lineMatch ? parseInt(lineMatch[1]) : undefined;
    const columnNumber = lineMatch ? parseInt(lineMatch[2]) : undefined;
    
    // Match error patterns
    for (const pattern of ERROR_PATTERNS) {
      const match = line.match(pattern.pattern);
      if (match) {
        errors.push({
          message: pattern.message(match),
          line: lineNumber,
          column: columnNumber,
          severity: pattern.severity
        });
        break;
      }
    }
    
    // Generic error fallback
    if (line.includes('Error:') && !errors.some(e => e.line === lineNumber)) {
      errors.push({
        message: line.replace(/.*Error:\s*/, ''),
        line: lineNumber,
        column: columnNumber,
        severity: 'error'
      });
    }
  }
  
  return errors;
}

// Validate code for common issues
export function validateCode(code: string, projectType: 'p5' | 'three'): CodeError[] {
  const errors: CodeError[] = [];
  const lines = code.split('\n');
  
  // Check for common issues
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for missing semicolons on common statements
    if (/^[\s]*(?:let|const|var|return)\s+.*[^;{}\s]$/.test(line.trim())) {
      errors.push({
        message: 'Consider adding a semicolon',
        line: lineNumber,
        severity: 'warning'
      });
    }
    
    // Check for p5.js specific issues
    if (projectType === 'p5') {
      // Missing setup or draw functions
      if (line.includes('function setup') || line.includes('function draw')) {
        // This is good
      } else if (line.includes('createCanvas') && !code.includes('function setup')) {
        errors.push({
          message: 'createCanvas should be called inside setup() function',
          line: lineNumber,
          severity: 'warning'
        });
      }
      
      // Using p5 functions without proper context
      if (/\b(?:rect|ellipse|circle|line|point|triangle)\s*\(/.test(line) && 
          !code.includes('function draw') && !code.includes('function setup')) {
        errors.push({
          message: 'Drawing functions should be called inside draw() or setup()',
          line: lineNumber,
          severity: 'info'
        });
      }
    }
    
    // Check for Three.js specific issues
    if (projectType === 'three') {
      // Check for missing THREE prefix
      if (/\b(?:BoxGeometry|SphereGeometry|Mesh|Material)\s*\(/.test(line) && 
          !line.includes('THREE.')) {
        errors.push({
          message: 'Three.js objects should be prefixed with THREE.',
          line: lineNumber,
          severity: 'warning'
        });
      }
    }
    
    // Check for unused parameter comments
    if (line.includes('@param') && !code.includes(`let ${line.match(/@param\s+\{[^}]+\}\s+(\w+)/)?.[1] || ''}`)) {
      const paramName = line.match(/@param\s+\{[^}]+\}\s+(\w+)/)?.[1];
      if (paramName) {
        errors.push({
          message: `Parameter '${paramName}' is declared but not used`,
          line: lineNumber,
          severity: 'info'
        });
      }
    }
  });
  
  return errors;
}

// Create Monaco markers from errors
export function createMarkersFromErrors(
  monaco: typeof Monaco,
  model: Monaco.editor.ITextModel,
  errors: CodeError[]
): Monaco.editor.IMarkerData[] {
  return errors.map(error => ({
    severity: error.severity === 'error' 
      ? monaco.MarkerSeverity.Error
      : error.severity === 'warning'
      ? monaco.MarkerSeverity.Warning
      : monaco.MarkerSeverity.Info,
    message: error.message,
    startLineNumber: error.line || 1,
    startColumn: error.column || 1,
    endLineNumber: error.line || 1,
    endColumn: error.column ? error.column + 10 : model.getLineMaxColumn(error.line || 1)
  }));
}

// Create diagnostic provider for Monaco
export function createDiagnosticProvider(monaco: typeof Monaco, projectType: 'p5' | 'three') {
  return {
    provideCodeActions: (model: Monaco.editor.ITextModel, _range: Monaco.Range, context: Monaco.languages.CodeActionContext) => {
      const actions: Monaco.languages.CodeAction[] = [];
      
      for (const marker of context.markers) {
        // Quick fixes for common issues
        if (marker.message.includes('semicolon')) {
          actions.push({
            title: 'Add semicolon',
            kind: 'quickfix',
            edit: {
              edits: [{
                resource: model.uri,
                versionId: model.getVersionId(),
                textEdit: {
                  range: new monaco.Range(marker.startLineNumber, marker.endColumn, marker.startLineNumber, marker.endColumn),
                  text: ';'
                }
              }]
            }
          });
        }
        
        if (marker.message.includes('THREE.') && projectType === 'three') {
          const line = model.getLineContent(marker.startLineNumber);
          const match = line.match(/\b(BoxGeometry|SphereGeometry|Mesh|Material)\b/);
          if (match) {
            actions.push({
              title: `Add THREE. prefix to ${match[1]}`,
              kind: 'quickfix',
              edit: {
                edits: [{
                  resource: model.uri,
                  versionId: model.getVersionId(),
                  textEdit: {
                    range: new monaco.Range(
                      marker.startLineNumber, 
                      line.indexOf(match[1]) + 1,
                      marker.startLineNumber,
                      line.indexOf(match[1]) + 1
                    ),
                    text: 'THREE.'
                  }
                }]
              }
            });
          }
        }
      }
      
      return {
        actions,
        dispose: () => {}
      };
    }
  };
}