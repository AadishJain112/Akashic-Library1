import React, { Component, ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTheme } from '../../app/ThemeContext';
import { BookOpen } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('WebGL scene encounter an issue, switching to Lite mode fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-parchment-200/50 rounded-2xl border border-wood/30">
            <BookOpen className="w-8 h-8 text-wood mb-2 opacity-60" />
            <p className="text-sm font-serif text-ink-light">Lite reading room active</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

interface CanvasContainerProps {
  children: ReactNode;
  className?: string;
  liteFallback?: ReactNode;
  camera?: any;
  frameloop?: 'always' | 'demand';
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
  className = 'w-full h-full',
  liteFallback,
  camera = { position: [0, 1, 5], fov: 45 },
  frameloop = 'always',
}) => {
  const { lite3D } = useTheme();

  if (lite3D) {
    return (
      <div className={className}>
        {liteFallback || (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-parchment-100/60 rounded-2xl border border-wood/20">
            <BookOpen className="w-10 h-10 text-wood/60 mb-3" />
            <p className="text-sm font-serif text-ink font-semibold">Lite 3D Mode</p>
            <p className="text-xs text-ink-light mt-1">High-performance parchment view active</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <WebGLErrorBoundary fallback={liteFallback}>
        <Canvas
          camera={camera}
          dpr={[1, 1.5]}
          frameloop={frameloop}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
