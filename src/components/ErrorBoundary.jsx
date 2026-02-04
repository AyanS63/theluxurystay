import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We encountered an unexpected error. Please try reloading the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
               <div className="mb-6 text-left bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-auto max-h-48 text-xs font-mono text-red-500">
                  {this.state.error.toString()}
               </div>
            )}

            <button 
              onClick={this.handleReload}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
