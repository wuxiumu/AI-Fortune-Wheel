/* ============================================================
   AI Fortune Wheel - Admin Script
   ============================================================ */

// Admin 通用功能
const Admin = {
  // 显示提示
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // 确认对话框
  async confirm(message) {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  },

  // 格式化日期
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  },

  // 格式化时间
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN');
  },

  // 防抖
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Toast 样式
const style = document.createElement('style');
style.textContent = `
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 15px;
    box-shadow: var(--shadow-lg);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s;
    z-index: 9999;
  }

  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }

  .toast-success {
    border-color: var(--success);
  }

  .toast-error {
    border-color: var(--danger);
  }

  .toast-warning {
    border-color: var(--warning);
  }

  .toast-info {
    border-color: var(--primary);
  }
`;
document.head.appendChild(style);

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Admin;
}
