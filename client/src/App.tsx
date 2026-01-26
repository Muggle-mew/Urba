import { Component, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { CombatScreen } from './components/combat/CombatScreen';
import { GameLayout } from './components/layout/GameLayout';
import { CityScreen } from './components/city/CityScreen';
import { useCharacterStore } from './store/useCharacterStore';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-black/50 p-4 rounded overflow-auto">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

type ViewState = 'city' | 'combat';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('city');
  const { profile } = useCharacterStore();

  // If traveling, force city view
  const activeView = profile.location.isTraveling ? 'city' : currentView;

  return (
    <ErrorBoundary>
      <GameLayout>
        {activeView === 'city' ? (
          <CityScreen onNavigateToCombat={() => setCurrentView('combat')} />
        ) : (
          <div className="relative h-full flex flex-col">
            <button 
              onClick={() => setCurrentView('city')}
              className="absolute top-2 left-2 z-50 px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded border border-gray-600 hover:bg-gray-700"
            >
              ← Вернуться в город
            </button>
            <CombatScreen />
          </div>
        )}
      </GameLayout>
    </ErrorBoundary>
  )
}

export default App
