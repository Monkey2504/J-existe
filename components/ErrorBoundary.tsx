
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-[3rem] shadow-xl border border-stone-100">
            <h1 className="text-4xl font-serif font-bold text-stone-900">Oups...</h1>
            <p className="text-stone-600 leading-relaxed">
              Une erreur inattendue s'est produite. Ne vous inquiétez pas, l'existence continue, mais cette page a besoin d'un nouveau départ.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
