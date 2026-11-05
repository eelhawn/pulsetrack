
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            if (reg) reg.update().catch(() => {});
          })
          .catch(err => console.warn('Service worker registration failed:', err));
      });
    }
  