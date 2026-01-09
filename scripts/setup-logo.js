const fs = require('fs');
const path = require('path');

// Get project root (assuming script is in scripts/ folder)
const projectRoot = path.resolve(__dirname, '..');
const logoSource = path.join(projectRoot, 'brand-identity', 'logo', 'NOVA — Crystal Core X Mark.png');
const publicDir = path.join(projectRoot, 'public');
const frontendPublicDir = path.join(projectRoot, 'frontend', 'public');

console.log('Setting up Nova-XFinity logo...\n');
console.log('Project root:', projectRoot);

// Check if source logo exists
if (!fs.existsSync(logoSource)) {
  console.error('❌ Error: Logo file not found at:');
  console.error('  ', logoSource);
  console.error('\nPlease ensure the logo file exists in brand-identity/logo/');
  process.exit(1);
}

console.log('✓ Found logo at:', logoSource);

// Create public directories if they don't exist
const dirs = [publicDir, frontendPublicDir];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('✓ Created directory:', dir);
  }
});

// Copy logo to both locations
const destinations = [
  path.join(publicDir, 'nova-logo.png'),
  path.join(frontendPublicDir, 'nova-logo.png')
];

destinations.forEach(dest => {
  try {
    fs.copyFileSync(logoSource, dest);
    const stats = fs.statSync(dest);
    console.log('✓ Copied logo to:', dest);
    console.log('  File size:', (stats.size / 1024).toFixed(2), 'KB');
  } catch (error) {
    console.error('✗ Failed to copy to:', dest);
    console.error('  Error:', error.message);
  }
});

console.log('\n✅ Logo setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Restart your dev server (Ctrl+C, then: npm run dev)');
console.log('2. Refresh your browser (Ctrl+F5 for hard refresh)');
console.log('3. Check the sidebar to verify the logo appears');
