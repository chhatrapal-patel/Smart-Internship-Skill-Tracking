/**
 * Global Toast Notification System
 */
export const toast = {
  show(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const color = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';

    toast.className = 'animate-fade-in-up';
    toast.style.cssText = `
      background: white;
      color: var(--color-gray-800);
      padding: 12px 20px;
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      border-left: 4px solid ${color};
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 280px;
      pointer-events: auto;
    `;

    toast.innerHTML = `
      <i data-lucide="${icon}" style="width:20px;height:20px;color:${color};"></i>
      <span style="font-weight:500; font-size:14px;">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); }
};
