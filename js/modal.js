/* ============================================================
   modal.js — 自定义模态框组件
   替代浏览器原生 confirm/alert，提供更好的用户体验
   ============================================================ */

const Modal = (() => {
  let modalEl = null;

  /**
   * 创建模态框 DOM
   */
  function createModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.className = 'custom-modal';
    modalEl.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-icon"></div>
          <h3 class="modal-title"></h3>
        </div>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-cancel">取消</button>
          <button class="modal-btn modal-btn-confirm">确定</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);
    return modalEl;
  }

  /**
   * 显示确认对话框
   * @param {Object} options
   * @param {string} options.title - 标题
   * @param {string} options.message - 消息内容
   * @param {string} options.confirmText - 确认按钮文字（默认：确定）
   * @param {string} options.cancelText - 取消按钮文字（默认：取消）
   * @param {string} options.type - 类型：'warning' | 'danger' | 'info'（默认：'info'）
   * @returns {Promise<boolean>}
   */
  function confirm(options = {}) {
    return new Promise((resolve) => {
      const modal = createModal();
      const {
        title = '确认',
        message = '',
        confirmText = '确定',
        cancelText = '取消',
        type = 'info'
      } = options;

      // 设置图标
      const iconEl = modal.querySelector('.modal-icon');
      const iconMap = {
        warning: '⚠️',
        danger: '🗑️',
        info: '💬',
        success: '✅'
      };
      iconEl.textContent = iconMap[type] || iconMap.info;

      // 设置标题和消息
      modal.querySelector('.modal-title').textContent = title;
      modal.querySelector('.modal-body').textContent = message;

      // 设置按钮文字
      const confirmBtn = modal.querySelector('.modal-btn-confirm');
      const cancelBtn = modal.querySelector('.modal-btn-cancel');
      confirmBtn.textContent = confirmText;
      cancelBtn.textContent = cancelText;

      // 设置按钮样式
      confirmBtn.className = `modal-btn modal-btn-confirm modal-btn-${type}`;

      // 显示模态框
      modal.classList.add('modal-show');

      // 绑定事件
      const cleanup = () => {
        modal.classList.remove('modal-show');
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
      };

      modal.querySelector('.modal-overlay').addEventListener('click', () => {
        cleanup();
        resolve(false);
      }, { once: true });

      modal.querySelector('.modal-btn-cancel').addEventListener('click', () => {
        cleanup();
        resolve(false);
      }, { once: true });

      modal.querySelector('.modal-btn-confirm').addEventListener('click', () => {
        cleanup();
        resolve(true);
      }, { once: true });

      // 按 ESC 关闭
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          cleanup();
          resolve(false);
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  }

  /**
   * 显示提示对话框（只有确定按钮）
   */
  function alert(options = {}) {
    return new Promise((resolve) => {
      const modal = createModal();
      const {
        title = '提示',
        message = '',
        confirmText = '确定',
        type = 'info'
      } = options;

      // 设置图标
      const iconEl = modal.querySelector('.modal-icon');
      const iconMap = {
        warning: '⚠️',
        danger: '❌',
        info: '💬',
        success: '✅'
      };
      iconEl.textContent = iconMap[type] || iconMap.info;

      // 设置标题和消息
      modal.querySelector('.modal-title').textContent = title;
      modal.querySelector('.modal-body').textContent = message;

      // 隐藏取消按钮
      const cancelBtn = modal.querySelector('.modal-btn-cancel');
      cancelBtn.style.display = 'none';

      // 设置确认按钮
      const confirmBtn = modal.querySelector('.modal-btn-confirm');
      confirmBtn.textContent = confirmText;
      confirmBtn.className = `modal-btn modal-btn-confirm modal-btn-${type}`;

      // 显示模态框
      modal.classList.add('modal-show');

      // 绑定事件
      const cleanup = () => {
        modal.classList.remove('modal-show');
        cancelBtn.style.display = '';
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
      };

      modal.querySelector('.modal-overlay').addEventListener('click', () => {
        cleanup();
        resolve();
      }, { once: true });

      modal.querySelector('.modal-btn-confirm').addEventListener('click', () => {
        cleanup();
        resolve();
      }, { once: true });
    });
  }

  return {
    confirm,
    alert
  };
})();
