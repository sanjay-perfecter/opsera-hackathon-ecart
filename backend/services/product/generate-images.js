const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Product images configuration
const images = [
    // Vegetables
    { name: 'placeholder-tomato.jpg', color: '#FF6347', emoji: '🍅', text: 'Tomato' },
    { name: 'placeholder-potato.jpg', color: '#D2B48C', emoji: '🥔', text: 'Potato' },
    { name: 'placeholder-onion.jpg', color: '#DDA0DD', emoji: '🧅', text: 'Onion' },
    { name: 'placeholder-carrot.jpg', color: '#FF8C00', emoji: '🥕', text: 'Carrot' },
    { name: 'placeholder-spinach.jpg', color: '#228B22', emoji: '🥬', text: 'Spinach' },
    { name: 'placeholder-broccoli.jpg', color: '#7FFF00', emoji: '🥦', text: 'Broccoli' },
    { name: 'placeholder-bell-pepper.jpg', color: '#FFD700', emoji: '🫑', text: 'Bell Pepper' },
    { name: 'placeholder-cucumber.jpg', color: '#90EE90', emoji: '🥒', text: 'Cucumber' },
    
    // Fruits
    { name: 'placeholder-apple.jpg', color: '#DC143C', emoji: '🍎', text: 'Apple' },
    { name: 'placeholder-banana.jpg', color: '#FFFF00', emoji: '🍌', text: 'Banana' },
    { name: 'placeholder-orange.jpg', color: '#FFA500', emoji: '🍊', text: 'Orange' },
    { name: 'placeholder-mango.jpg', color: '#FFB347', emoji: '🥭', text: 'Mango' },
    { name: 'placeholder-grapes.jpg', color: '#6F2DA8', emoji: '🍇', text: 'Grapes' },
    { name: 'placeholder-watermelon.jpg', color: '#FC6C85', emoji: '🍉', text: 'Watermelon' },
    { name: 'placeholder-strawberry.jpg', color: '#FF0800', emoji: '🍓', text: 'Strawberry' },
    { name: 'placeholder-kiwi.jpg', color: '#8EE53F', emoji: '🥝', text: 'Kiwi' }
];

// Function to create SVG image
const createSVG = (color, emoji, text) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="${color}"/>
  <text x="50%" y="45%" font-size="120" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <text x="50%" y="70%" font-size="32" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white" stroke="black" stroke-width="1">${text}</text>
</svg>`;
};

// Generate all images
console.log('Generating product placeholder images...\n');

images.forEach(image => {
    const svg = createSVG(image.color, image.emoji, image.text);
    const filepath = path.join(uploadsDir, image.name.replace('.jpg', '.svg'));
    
    fs.writeFileSync(filepath, svg);
    console.log(`✓ Generated: ${path.basename(filepath)}`);
});

console.log('\n✅ All placeholder images generated successfully!');
console.log(`Images saved to: ${uploadsDir}`);
console.log('\nNote: Images are in SVG format and will work perfectly in browsers.');
