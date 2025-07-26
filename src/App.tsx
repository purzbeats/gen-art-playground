import { Playground } from './components/Playground';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Playground />
    </ErrorBoundary>
  );
}

export default App
