import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { HelmetProvider } from 'react-helmet-async';

// 1. 헬멧 컨텍스트 명시 (에러 방지용)
const helmetContext = {};

// 2. 에러가 나면 흰 화면 대신 에러 메시지를 보여주는 부품 (에러 경계)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      // 에러 발생 시 이 화면이 뜹니다
      return (
        <div style={{ padding: 20, color: 'red', wordBreak: 'break-all' }}>
          <h1>💥 앱 실행 중 오류 발생</h1>
          <p>{this.state.error.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // 3. StrictMode 제거 (버전 체크 로직 충돌 방지)
  // <React.StrictMode>  <-- 이거 때문에 폰에서 꼬일 수 있어서 뺍니다.
    <ErrorBoundary>
      <HelmetProvider context={helmetContext}>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  // </React.StrictMode>
);

serviceWorkerRegistration.register();
