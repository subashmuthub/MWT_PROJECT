import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🚨 Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-lg mx-auto text-center p-6">
                        <div className="mb-6">
                            <svg className="w-20 h-20 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                🔄 Refresh Page
                            </button>
                            
                            <button 
                                onClick={() => {
                                    this.setState({ hasError: false, error: null, errorInfo: null });
                                    window.history.back();
                                }}
                                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                ← Go Back
                            </button>
                        </div>
                        
                        {/* Show error details in development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 mb-3 font-medium">
                                    🔧 Technical Details (Development Mode)
                                </summary>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-medium text-red-800 mb-2">Error:</h4>
                                    <pre className="text-xs text-red-700 mb-3 overflow-auto">
                                        {this.state.error.toString()}
                                    </pre>
                                    
                                    <h4 className="font-medium text-red-800 mb-2">Component Stack:</h4>
                                    <pre className="text-xs text-red-600 overflow-auto max-h-32">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;