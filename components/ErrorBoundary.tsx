
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  /** Les composants enfants à surveiller par la frontière d'erreur */
  children?: ReactNode;
}

interface State {
  /** État indiquant si une erreur a été capturée */
  hasError: boolean;
}

/**
 * Composant de secours pour capturer les erreurs inattendues dans l'arborescence des composants.
 */
// Comment: Explicitly extending Component and declaring state ensures that inherited properties like 'state' and 'props' are correctly recognized by the TypeScript compiler.
class ErrorBoundary extends Component<Props, State> {
  // Comment: Explicitly declare the state property to satisfy the compiler's check for property existence on the ErrorBoundary type.
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(_: Error): State {
    // Comment: Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Comment: Catch and log errors from the child component tree.
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    // Comment: Accessing 'state' which is inherited from Component and now explicitly recognized.
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

    // Comment: Accessing 'props' which is inherited from Component and now explicitly recognized.
    return this.props.children;
  }
}

export default ErrorBoundary;
