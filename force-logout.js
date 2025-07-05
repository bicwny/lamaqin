
// Force logout script - Run this in browser console or call forceLogoutAll()
console.log('🚨 Starting FORCE LOGOUT process...');

// Clear all possible storage
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Web storage cleared');
} catch (e) {
  console.log('⚠️ Web storage clear failed:', e);
}

// Force reload to login screen
setTimeout(() => {
  console.log('🔄 Forcing page reload...');
  window.location.href = window.location.origin;
}, 1000);
