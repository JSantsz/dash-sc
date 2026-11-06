import { Component, ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('App error:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#e8e4f0', fontFamily: 'monospace', background: '#201d49', minHeight: '100vh' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro na aplicação</h2>
          <pre style={{ background: '#302d71', padding: '1rem', borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
