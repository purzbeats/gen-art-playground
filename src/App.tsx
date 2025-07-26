import { Playground } from './components/Playground';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Playground />
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App
