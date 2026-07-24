import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px auto', 
          maxWidth: '600px', 
          background: 'rgba(20,20,20,0.9)', 
          border: '1px solid #444', 
          borderRadius: '8px',
          color: '#eee',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#ff5555', marginTop: 0 }}>Đã có lỗi xảy ra!</h2>
          <p>Ứng dụng gặp sự cố nhưng tiến trình lưu tự động có thể vẫn còn. Mã lỗi:</p>
          <pre style={{ 
            background: '#000', 
            padding: '10px', 
            overflowX: 'auto',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#ff8888'
          }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#444',
              color: 'white',
              border: '1px solid #666',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tải lại ứng dụng
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
