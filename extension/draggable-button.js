// Draggable Enhance Button for Aider Bridge
// Provides a floating, draggable button for quick access to Aider enhancement

class DraggableEnhanceButton {
  constructor() {
    this.button = null;
    this.container = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.buttonStartX = 0;
    this.buttonStartY = 0;
    this.platform = this.detectPlatform();
    this.storageKey = 'aider_button_position';
    
    this.init();
  }

  detectPlatform() {
    const url = window.location.hostname;
    if (url.includes("claude")) return "claude";
    if (url.includes("perplexity")) return "perplexity";
    return "unknown";
  }

  async init() {
    await this.loadPosition();
    this.createButton();
    this.attachEventListeners();
  }

  // Load saved position from Chrome storage
  async loadPosition() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        this.savedPosition = result[this.storageKey] || { 
          x: window.innerWidth - 120, 
          y: window.innerHeight - 120 
        };
        resolve();
      });
    });
  }

  // Save position to Chrome storage
  savePosition(x, y) {
    chrome.storage.local.set({
      [this.storageKey]: { x, y }
    });
  }

  createButton() {
    // Create container
    const container = document.createElement('div');
    container.id = 'aider-button-container';
    container.className = `aider-container aider-platform-${this.platform}`;
    
    // Apply saved position
    container.style.left = this.savedPosition.x + 'px';
    container.style.top = this.savedPosition.y + 'px';

    // Create button
    this.button = document.createElement('button');
    this.button.id = 'aider-enhance-btn';
    this.button.className = 'aider-enhance-btn';
    this.button.innerHTML = `
      <span class="aider-icon">⚡</span>
      <span class="aider-label">Enhance</span>
    `;
    this.button.title = 'Enhance with Aider (Ctrl+Shift+A)\nDrag to move';

    // Create drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'aider-drag-handle';
    dragHandle.title = 'Drag to move button';

    container.appendChild(dragHandle);
    container.appendChild(this.button);
    document.body.appendChild(container);

    this.container = container;
  }

  attachEventListeners() {
    // Click handler
    this.button.addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.onEnhanceClick();
      }
    });

    // Drag handlers
    const dragHandle = this.container.querySelector('.aider-drag-handle');
    
    dragHandle.addEventListener('mousedown', (e) => {
      this.startDrag(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.onDrag(e);
      }
    });

    document.addEventListener('mouseup', (e) => {
      this.endDrag(e);
    });

    // Touch support (for mobile)
    dragHandle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrag(e.touches[0]);
    });

    document.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        this.onDrag(e.touches[0]);
      }
    });

    document.addEventListener('touchend', (e) => {
      this.endDrag(e);
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.onEnhanceClick();
      }
    });

    // Reset position on double-click
    this.container.addEventListener('dblclick', () => {
      this.resetPosition();
    });
  }

  startDrag(e) {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    
    const rect = this.container.getBoundingClientRect();
    this.buttonStartX = rect.left;
    this.buttonStartY = rect.top;

    this.container.classList.add('dragging');
    this.button.style.pointerEvents = 'none'; // Prevent click during drag
  }

  onDrag(e) {
    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;

    let newX = this.buttonStartX + deltaX;
    let newY = this.buttonStartY + deltaY;

    // Boundary checking (keep within viewport)
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;
    
    newX = Math.max(0, Math.min(newX, window.innerWidth - containerWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - containerHeight));

    this.container.style.left = newX + 'px';
    this.container.style.top = newY + 'px';
  }

  endDrag(e) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.button.style.pointerEvents = 'auto';
    this.container.classList.remove('dragging');

    // Save position
    const rect = this.container.getBoundingClientRect();
    this.savePosition(rect.left, rect.top);

    // Visual feedback
    this.container.classList.add('snap-animation');
    setTimeout(() => {
      this.container.classList.remove('snap-animation');
    }, 300);
  }

  resetPosition() {
    const defaultX = window.innerWidth - 120;
    const defaultY = window.innerHeight - 120;
    
    this.container.style.left = defaultX + 'px';
    this.container.style.top = defaultY + 'px';
    this.savePosition(defaultX, defaultY);
    this.showNotification('Position reset to default', 'info');
  }

  async onEnhanceClick() {
    this.setButtonState('loading');

    try {
      // Use existing runAiderBridge function from content.js
      if (typeof window.aiderBridge !== 'undefined') {
        const success = await window.aiderBridge.run();
        
        if (success) {
          this.setButtonState('success');
          this.showNotification('✅ Enhanced successfully!', 'success');
        } else {
          this.setButtonState('error');
          this.showNotification('❌ Enhancement failed. Check console.', 'error');
        }
      } else {
        throw new Error('Aider Bridge not loaded');
      }

    } catch (error) {
      console.error('Enhance error:', error);
      this.setButtonState('error');
      this.showNotification('❌ ' + error.message, 'error');
    } finally {
      setTimeout(() => this.setButtonState('idle'), 2000);
    }
  }

  setButtonState(state) {
    this.container.classList.remove('loading', 'success', 'error', 'idle');
    this.container.classList.add(state);

    if (state === 'loading') {
      this.button.disabled = true;
      this.button.innerHTML = `
        <span class="aider-spinner"></span>
        <span class="aider-label">Processing...</span>
      `;
    } else if (state === 'success') {
      this.button.innerHTML = `
        <span class="aider-icon">✓</span>
        <span class="aider-label">Done</span>
      `;
    } else if (state === 'error') {
      this.button.innerHTML = `
        <span class="aider-icon">✗</span>
        <span class="aider-label">Error</span>
      `;
    } else {
      this.button.disabled = false;
      this.resetButtonDisplay();
    }
  }

  resetButtonDisplay() {
    this.button.innerHTML = `
      <span class="aider-icon">⚡</span>
      <span class="aider-label">Enhance</span>
    `;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `aider-notification aider-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DraggableEnhanceButton();
  });
} else {
  new DraggableEnhanceButton();
}

console.log("✅ Draggable Enhance Button loaded!");

