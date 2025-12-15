# Marker Generation Instructions

To use image marker tracking with MindAR, you need to generate a `.mind` file from your marker image.

## Steps to Generate a Marker

1. **Install MindAR CLI tool:**
   ```bash
   npm install -g mind-ar-tools
   ```

2. **Prepare your marker image:**
   - Use a high-contrast image (e.g., QR code, logo, or distinctive pattern)
   - Recommended size: 512x512 pixels or larger
   - Format: JPG or PNG
   - The image should have clear, distinct features for better tracking

3. **Generate the marker file:**
   ```bash
   mind-ar-tools image-target ./path-to-your-image.jpg
   ```
   
   This will generate:
   - `target.mind` - The compiled marker file
   - `target.mind.png` - Preview image

4. **Place the generated files:**
   - Copy `target.mind` to this directory (`public/markers/`)
   - The application will automatically load it

## Example Marker Images

You can use any image, but here are some recommendations:
- QR codes work well
- High-contrast logos
- Distinctive patterns or artwork
- Avoid images with too much detail or blur

## Testing

After generating your marker:
1. Print the original image or display it on another screen
2. Open the AR app on your phone
3. Point the camera at the marker image
4. The 3D objects should appear and animate when the marker is detected

