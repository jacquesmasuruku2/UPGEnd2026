import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { error: Error | null };

/**
 * Affiche une erreur lisible si React plante au lieu d’un écran blanc.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background text-foreground p-6 font-sans">
          <div className="max-w-lg mx-auto mt-16 space-y-4">
            <h1 className="text-xl font-bold">Le site n’a pas pu s’afficher</h1>
            <p className="text-muted-foreground text-sm">
              Une erreur technique s’est produite. Vous pouvez recharger la page. Détail utile pour le support&nbsp;:
            </p>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap border border-border">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              onClick={() => window.location.reload()}
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
