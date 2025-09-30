import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, shrink-to-fit=no" 
        />
        
        {/* PWA Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="三殊胜" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#000000" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/icon.png" />
        
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
