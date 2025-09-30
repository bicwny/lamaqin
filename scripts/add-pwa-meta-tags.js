const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist-web', 'index.html');
const manifestPath = path.join(__dirname, '..', 'dist-web', 'manifest.json');

// Add PWA meta tags to index.html
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Check if meta tags already exist
  if (!html.includes('apple-mobile-web-app-capable')) {
    const metaTags = `
    <!-- PWA Configuration -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="三殊胜">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icon.png">`;
    
    html = html.replace(
      '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />' + metaTags
    );
    
    fs.writeFileSync(htmlPath, html);
    console.log('✅ PWA meta tags added to index.html');
  } else {
    console.log('ℹ️ PWA meta tags already exist in index.html');
  }
} else {
  console.log('⚠️ index.html not found');
}

// Create manifest.json if it doesn't exist
if (!fs.existsSync(manifestPath)) {
  const manifest = {
    name: "三殊胜",
    short_name: "三殊胜",
    description: "佛教修行追踪应用",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ manifest.json created');
} else {
  console.log('ℹ️ manifest.json already exists');
}
