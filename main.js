// MindAR event handlers and AR controls

// Wait for A-Frame to be ready
window.addEventListener('load', () => {
  const scene = document.querySelector('a-scene');
  const info = document.getElementById('info');
  const status = document.getElementById('status');
  const loading = document.getElementById('loading');
  
  if (!scene) {
    console.error('A-Frame scene not found');
    return;
  }

  // Wait for scene to be loaded
  scene.addEventListener('loaded', () => {
    // Handle AR system events
    scene.addEventListener('arReady', () => {
      status.textContent = 'Camera ready! Point at marker.';
      status.style.color = '#4ade80';
      loading.classList.add('hide');
    });

    scene.addEventListener('arError', (event) => {
      status.textContent = 'AR Error: ' + (event.detail || 'Unknown error');
      status.style.color = '#ef4444';
      loading.classList.add('hide');
    });

    // Handle marker detection
    const target = document.querySelector('[mindar-image-target]');
    
    if (target) {
      target.addEventListener('targetFound', () => {
        status.textContent = 'Marker detected!';
        status.style.color = '#4ade80';
        info.classList.add('hide');
      });

      target.addEventListener('targetLost', () => {
        status.textContent = 'Point at marker...';
        status.style.color = '#fbbf24';
        info.classList.remove('hide');
      });
    }

    // Handle model loading
    const astronautModel = document.getElementById('astronaut-model');
    if (astronautModel) {
      astronautModel.addEventListener('model-loaded', () => {
        console.log('Astronaut model loaded successfully');
      });
    }
  });
});
