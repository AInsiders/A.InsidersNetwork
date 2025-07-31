# Blake Zimmerman - Profile Picture Tools

This directory contains tools to create and display professional profile pictures for Blake Zimmerman from the source image.

## Files Created

### 1. `blake-zimmerman-profile-simple.html`
A simple, clean profile picture viewer with:
- Interactive size controls (Small, Medium, Large)
- Download functionality
- Professional styling
- Responsive design

### 2. `blake-zimmerman-profile.html`
A comprehensive profile picture showcase with:
- Multiple size variations displayed simultaneously
- Professional card-based layout
- Usage instructions
- Link to the profile picture generator

### 3. `profile-picture-generator.html`
An advanced profile picture generator with:
- Canvas-based image processing
- Custom size selection
- Real-time preview
- Download functionality
- Professional circular cropping

### 4. `profile-picture.css`
CSS styles for profile pictures including:
- Circular cropping with `border-radius: 50%`
- Multiple size classes (small, medium, large, xlarge)
- Hover effects and transitions
- Responsive design
- Professional borders and shadows

### 5. `create-profile-pictures.ps1`
PowerShell script for batch processing:
- Creates multiple sized profile pictures
- Uses ImageMagick if available
- Creates HTML fallback if ImageMagick not available
- Automated file organization

## How to Use

### Quick Start
1. Open `blake-zimmerman-profile-simple.html` in your web browser
2. Use the size buttons to preview different sizes
3. Click "Download Profile Picture" to save the current size
4. Right-click on any image to save it directly

### Advanced Usage
1. Open `profile-picture-generator.html` for custom sizing
2. Use the canvas-based generator for precise control
3. Download high-quality PNG files
4. Use the CSS classes in your own projects

### For Developers
1. Include `profile-picture.css` in your project
2. Use the CSS classes:
   ```html
   <img src="blake-zimmerman.jpg" class="profile-picture medium" alt="Blake Zimmerman">
   ```
3. Available classes: `small`, `medium`, `large`, `xlarge`

## Image Specifications

- **Source Image**: `blake-zimmerman.jpg`
- **Format**: JPG
- **Cropping**: Automatic circular crop with `object-fit: cover`
- **Border**: Professional blue border (#667eea)
- **Shadow**: Subtle drop shadow for depth
- **Sizes Available**:
  - Small: 100px × 100px
  - Medium: 200px × 200px
  - Large: 300px × 300px
  - Extra Large: 400px × 400px

## Use Cases

### Social Media
- LinkedIn profile pictures
- Twitter/X avatars
- Facebook profile photos
- Instagram profile pictures

### Professional Use
- Email signatures
- Business cards
- Portfolio websites
- Presentation slides
- Company directories

### Web Development
- User avatars
- Team member profiles
- About pages
- Contact forms

## Technical Details

### CSS Features
- `border-radius: 50%` for perfect circles
- `object-fit: cover` for proper image scaling
- CSS transitions for smooth interactions
- Responsive design with media queries
- Professional color scheme

### JavaScript Features
- Canvas-based image processing
- Dynamic size adjustment
- Download functionality
- Aspect ratio preservation
- Cross-browser compatibility

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Progressive enhancement
- Graceful degradation

## Customization

### Colors
The default color scheme uses:
- Primary: #667eea (blue)
- Secondary: #764ba2 (purple)
- Success: #4CAF50 (green)
- Text: #333 (dark gray)
- Background: #f8f9fa (light gray)

### Sizes
You can customize sizes by modifying the CSS:
```css
.profile-picture.custom-size {
    width: 150px;
    height: 150px;
    border-width: 4px;
}
```

### Borders
Adjust border styles:
```css
.profile-picture {
    border: 5px solid #667eea; /* Change color or width */
    border-radius: 50%; /* Keep for circular shape */
}
```

## Troubleshooting

### Image Not Loading
- Ensure `blake-zimmerman.jpg` is in the same directory
- Check file permissions
- Verify image format is supported

### Download Not Working
- Check browser security settings
- Ensure JavaScript is enabled
- Try right-clicking and "Save image as..."

### Styling Issues
- Clear browser cache
- Check CSS file is loaded
- Verify class names are correct

## Support

For technical support or customization requests, refer to the main project documentation or contact the development team.

---

**Created for**: Blake Zimmerman  
**Purpose**: Professional profile picture generation and display  
**Last Updated**: July 30, 2025 