#!/usr/bin/env node
import fs from 'fs';
import { createCanvas } from 'canvas';

// Colors from the app
const bgColor = '#fffefb';
const primaryColor = '#00668c';
const accentColor = '#71c4ef';

function generateIcon(size, filepath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Circle background
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner circle accent
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Draw "V" letter
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', centerX, centerY);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated ${filepath}`);
}

// Generate icons
try {
  generateIcon(192, './public/pwa-192x192.png');
  generateIcon(512, './public/pwa-512x512.png');
  generateIcon(180, './public/apple-touch-icon.png');

  // Generate a simple favicon (16x16)
  const faviconSize = 32;
  const canvas = createCanvas(faviconSize, faviconSize);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, faviconSize, faviconSize);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${faviconSize * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', faviconSize / 2, faviconSize / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./public/favicon.png', buffer);
  console.log('Generated ./public/favicon.png');

  console.log('\nAll icons generated successfully!');
  console.log('You may want to replace these placeholder icons with professionally designed ones.');
} catch (error) {
  console.error('Error generating icons:', error);
  console.error('\nNote: This script requires the "canvas" package.');
  console.error('Install it with: npm install --save-dev canvas');
  process.exit(1);
}
