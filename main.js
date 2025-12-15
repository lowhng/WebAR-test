// MindAR event handlers and AR controls

// Wait for A-Frame to be ready
window.addEventListener('load', () => {
  const scene = document.querySelector('a-scene');
  const info = document.getElementById('info');
  const status = document.getElementById('status');
  const loading = document.getElementById('loading');
  const retryBtn = document.getElementById('retry-btn');
  
  if (!scene) {
    console.error('A-Frame scene not found');
    status.textContent = 'Error: Scene not found';
    status.style.color = '#ef4444';
    return;
  }

  // Show loading indicator
  loading.classList.remove('hide');

  // Check if we're in a secure context (HTTPS required for camera)
  if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost') {
    status.textContent = 'Error: HTTPS required for camera access';
    status.style.color = '#ef4444';
    loading.classList.add('hide');
    console.error('Camera access requires HTTPS');
    return;
  }

  // Check if getUserMedia is supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = 'Camera not supported in this browser';
    status.style.color = '#ef4444';
    loading.classList.add('hide');
    if (retryBtn) retryBtn.classList.remove('hide');
    console.error('getUserMedia not supported');
    return;
  }

  // Timeout for camera initialization (15 seconds)
  let initTimeout;
  let arReady = false;

  const onSceneLoaded = () => {
    console.log('A-Frame scene loaded, waiting for AR system...');

    // Set timeout to detect stuck initialization
    initTimeout = setTimeout(() => {
      if (!arReady) {
        console.error('Camera initialization timeout');
        status.textContent = 'Camera timeout. Please refresh and allow camera access.';
        status.style.color = '#ef4444';
        loading.classList.add('hide');
        if (retryBtn) retryBtn.classList.remove('hide');
        
        // Try to get more info about the error
        const arSystem = scene.systems['mindar-image-system'];
        if (arSystem) {
          console.error('AR System state:', arSystem);
        }
      }
    }, 15000);

    // Handle AR system events
    scene.addEventListener('arReady', () => {
      arReady = true;
      clearTimeout(initTimeout);
      console.log('AR system ready!');
      status.textContent = 'Camera ready! Point at marker.';
      status.style.color = '#4ade80';
      loading.classList.add('hide');
    });

    scene.addEventListener('arError', (event) => {
      clearTimeout(initTimeout);
      arReady = true; // Prevent timeout from firing
      
      // Extract error message - event.detail can be an object or string
      let errorMsg = 'Unknown error';
      if (event.detail) {
        if (typeof event.detail === 'string') {
          errorMsg = event.detail;
        } else if (typeof event.detail === 'object') {
          // Handle object format like {error: 'VIDEO_FAIL'}
          errorMsg = event.detail.error || event.detail.message || JSON.stringify(event.detail);
        }
      }
      
      console.error('AR Error:', errorMsg, 'Full event:', event);
      
      // Provide user-friendly error messages
      let userMessage = 'AR Error: ';
      const errorStr = String(errorMsg).toLowerCase();
      
      if (errorStr === 'video_fail' || errorStr.includes('video_fail')) {
        userMessage = 'Camera access failed. Please allow camera permissions and refresh.';
      } else if (errorStr.includes('permission') || errorStr.includes('notallowed')) {
        userMessage = 'Camera permission denied. Please allow camera access in browser settings and refresh.';
      } else if (errorStr.includes('notfound') || errorStr.includes('not found')) {
        userMessage = 'No camera found. Please check your device has a camera.';
      } else if (errorStr.includes('notreadable') || errorStr.includes('not readable')) {
        userMessage = 'Camera is in use by another app. Please close other apps using the camera.';
      } else if (errorStr.includes('overconstrained') || errorStr.includes('constraint')) {
        userMessage = 'Camera constraints not supported. Please try a different device.';
      } else {
        userMessage += errorMsg;
      }
      
      status.textContent = userMessage;
      status.style.color = '#ef4444';
      loading.classList.add('hide');
      if (retryBtn) retryBtn.classList.remove('hide');
    });

    // Additional error handling for MindAR-specific events
    scene.addEventListener('mindar-video-loaded', () => {
      console.log('MindAR video stream loaded');
    });

    // Handle model reference
    const astronautModel = document.getElementById('astronaut-model');

    // Handle marker detection
    const target = document.querySelector('[mindar-image-target]');
    
    if (target) {
      target.addEventListener('targetFound', () => {
        status.textContent = 'Marker detected!';
        status.style.color = '#4ade80';
        info.classList.add('hide');
        if (astronautModel) astronautModel.emit('targetFound');
      });

      target.addEventListener('targetLost', () => {
        status.textContent = 'Point at marker...';
        status.style.color = '#fbbf24';
        info.classList.remove('hide');
        if (astronautModel) astronautModel.emit('targetLost');
      });
    } else {
      console.warn('No mindar-image-target found');
    }

    // Handle model loading
    if (astronautModel) {
      astronautModel.addEventListener('model-loaded', () => {
        console.log('Astronaut model loaded successfully');
      });
      
      astronautModel.addEventListener('error', (event) => {
        console.error('Model loading error:', event);
      });
    }

    // Log AR system initialization and try manual start if needed
    setTimeout(() => {
      const arSystem = scene.systems['mindar-image-system'];
      if (arSystem) {
        console.log('AR System initialized:', arSystem);
        console.log('AR System state:', {
          el: arSystem.el,
          video: arSystem.video,
          isVideoReady: arSystem.isVideoReady,
          isStarted: arSystem.isStarted
        });
        
        // If autoStart didn't work, try manual start after a delay
        if (!arSystem.isStarted && !arSystem.isVideoReady) {
          console.log('AutoStart may have failed, attempting manual start...');
          setTimeout(() => {
            try {
              arSystem.start();
              console.log('Manual start attempted');
            } catch (error) {
              console.error('Manual start failed:', error);
            }
          }, 2000);
        }
      } else {
        console.warn('AR System not found in scene systems');
        console.log('Available systems:', Object.keys(scene.systems));
      }
    }, 1000);
  };

  // Wait for scene to be loaded (or run immediately if already loaded)
  if (scene.hasLoaded) {
    onSceneLoaded();
  } else {
    scene.addEventListener('loaded', onSceneLoaded);
  }

  // Also listen for scene errors
  scene.addEventListener('error', (event) => {
    console.error('Scene error:', event);
    clearTimeout(initTimeout);
    status.textContent = 'Scene error occurred. Please refresh.';
    status.style.color = '#ef4444';
    loading.classList.add('hide');
    if (retryBtn) retryBtn.classList.remove('hide');
  });
});
