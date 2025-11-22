import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useGame } from '@/lib/game-context';

export default function Layout({ children, className }: { children: React.ReactNode; className?: string }) {
  const { state } = useGame();
  
  return (
    <div className={cn(
      "min-h-screen w-full bg-background text-foreground font-sans overflow-hidden relative transition-colors duration-300",
      state.appSettings.highContrast && "high-contrast"
    )}>
      {/* Background Texture - Hide in High Contrast */}
      {!state.appSettings.highContrast && (
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
          {/* Using the generated asset */}
          <div 
            className="absolute inset-0 bg-repeat"
            style={{ 
              backgroundImage: `url('/attached_assets/generated_images/Dark_topographic_spy_map_texture_600c8586.png')`,
              backgroundSize: '500px',
              filter: 'grayscale(100%) contrast(1.2)'
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "relative z-10 flex flex-col min-h-screen p-4 md:p-8 lg:p-10 w-full max-w-5xl mx-auto overflow-y-scroll",
          className
        )}
        style={{ scrollbarGutter: 'stable both-edges' }}
      >
        {children}
      </main>
    </div>
  );
}
