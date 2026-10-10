/* ============================================================
   AI Fortune Wheel - Admin Authentication
   ============================================================ */

// 授权密码列表 - 可以配置多个密码
const AUTH_PASSWORDS = [
  'admin123',
  'ai2024',
  'fortune888'
];

// Session storage key
const AUTH_KEY = 'admin_authenticated';
const AUTH_TIMESTAMP_KEY = 'admin_auth_timestamp';
// 认证有效期（24小时）
const AUTH_EXPIRY = 24 * 60 * 60 * 1000;

const Auth = {
  // 检查是否已认证
  isAuthenticated() {
    const authenticated = sessionStorage.getItem(AUTH_KEY);
    const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);

    if (!authenticated || !timestamp) {
      return false;
    }

    // 检查是否过期
    const now = Date.now();
    const authTime = parseInt(timestamp, 10);
    if (now - authTime > AUTH_EXPIRY) {
      this.logout();
      return false;
    }

    return true;
  },

  // 验证密码
  verifyPassword(password) {
    return AUTH_PASSWORDS.includes(password.trim());
  },

  // 登录
  login(password) {
    if (this.verifyPassword(password)) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
      return true;
    }
    return false;
  },

  // 登出
  logout() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
  },

  // 初始化认证检查
  init() {
    // 如果已经认证，不显示登录框
    if (this.isAuthenticated()) {
      return;
    }

    // 隐藏页面内容
    document.body.style.overflow = 'hidden';
    this.createLoginOverlay();
  },

  // 创建登录覆盖层
  createLoginOverlay() {
    // 隐藏原始内容
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebar) sidebar.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';

    // 创建登录模态框
    const loginModal = document.createElement('div');
    loginModal.id = 'auth-login-modal';
    loginModal.className = 'auth-login-overlay';
    loginModal.innerHTML = `
      <div class="auth-login-container">
        <div class="auth-login-header">
          <div class="auth-logo">🔮</div>
          <h1 class="auth-title">管理后台登录</h1>
          <p class="auth-subtitle">AI Fortune Wheel Admin</p>
        </div>
        <form class="auth-login-form" id="authLoginForm">
          <div class="auth-form-group">
            <label class="auth-form-label">请输入授权密码</label>
            <input 
              type="password" 
              class="auth-form-input" 
              id="authPasswordInput" 
              placeholder="请输入密码..."
              autocomplete="off"
              required
            >
            <div class="auth-error-message" id="authErrorMessage"></div>
          </div>
          <button type="submit" class="auth-login-btn">
            <span>🔐</span>
            <span>进入管理后台</span>
          </button>
        </form>
        <div class="auth-login-footer">
          <a href="../index.html" class="auth-back-link">← 返回前台</a>
        </div>
      </div>
    `;

    document.body.appendChild(loginModal);

    // 添加样式
    this.addStyles();

    // 绑定事件
    this.bindEvents();

    // 聚焦输入框
    setTimeout(() => {
      const input = document.getElementById('authPasswordInput');
      if (input) input.focus();
    }, 100);
  },

  // 添加样式
  addStyles() {
    if (document.getElementById('auth-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'auth-styles';
    styles.textContent = `
      .auth-login-overlay {
        position: fixed;
        inset: 0;
        background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-sidebar) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 20px;
      }

      .auth-login-container {
        width: 100%;
        max-width: 420px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 48px 40px;
        box-shadow: var(--shadow-lg);
      }

      .auth-login-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .auth-logo {
        font-size: 56px;
        margin-bottom: 16px;
        animation: auth-float 3s ease-in-out infinite;
      }

      @keyframes auth-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      .auth-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 8px;
        background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .auth-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
      }

      .auth-login-form {
        margin-bottom: 24px;
      }

      .auth-form-group {
        margin-bottom: 20px;
      }

      .auth-form-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
      }

      .auth-form-input {
        width: 100%;
        padding: 14px 18px;
        background: var(--bg-dark);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 16px;
        transition: var(--transition);
        font-family: inherit;
        letter-spacing: 2px;
      }

      .auth-form-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
      }

      .auth-form-input.error {
        border-color: var(--danger);
        animation: auth-shake 0.5s ease;
      }

      @keyframes auth-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }

      .auth-error-message {
        margin-top: 8px;
        font-size: 13px;
        color: var(--danger);
        display: none;
      }

      .auth-error-message.show {
        display: block;
      }

      .auth-login-btn {
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        border: none;
        border-radius: var(--radius-md);
        color: white;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .auth-login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 102, 204, 0.4);
      }

      .auth-login-btn:active {
        transform: translateY(0);
      }

      .auth-login-footer {
        text-align: center;
      }

      .auth-back-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 14px;
        transition: var(--transition);
      }

      .auth-back-link:hover {
        color: var(--text-primary);
      }

      /* 成功动画 */
      .auth-success {
        animation: auth-success-pulse 0.5s ease;
      }

      @keyframes auth-success-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styles);
  },

  // 绑定事件
  bindEvents() {
    const form = document.getElementById('authLoginForm');
    const input = document.getElementById('authPasswordInput');
    const errorMsg = document.getElementById('authErrorMessage');

    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const password = input.value.trim();

      if (!password) {
        this.showError('请输入密码');
        return;
      }

      if (this.login(password)) {
        // 登录成功
        this.showSuccess();
      } else {
        // 登录失败
        this.showError('密码错误，请重试');
        input.value = '';
        input.focus();
      }
    });

    // 输入时清除错误状态
    input.addEventListener('input', () => {
      input.classList.remove('error');
      errorMsg.classList.remove('show');
    });

    // 按 Escape 键返回前台
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.location.href = '../index.html';
      }
    });
  },

  // 显示错误
  showError(message) {
    const input = document.getElementById('authPasswordInput');
    const errorMsg = document.getElementById('authErrorMessage');

    if (input) {
      input.classList.add('error');
    }
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.classList.add('show');
    }
  },

  // 显示成功并跳转
  showSuccess() {
    const container = document.querySelector('.auth-login-container');
    if (container) {
      container.classList.add('auth-success');
    }

    // 显示成功消息
    const btn = document.querySelector('.auth-login-btn');
    if (btn) {
      btn.innerHTML = '<span>✓</span><span>验证成功</span>';
      btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    }

    // 延迟后移除登录框并显示内容
    setTimeout(() => {
      const modal = document.getElementById('auth-login-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
      }

      // 显示原始内容
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');

      if (sidebar) {
        sidebar.style.display = '';
      }
      if (mainContent) {
        mainContent.style.display = '';
      }

      document.body.style.overflow = '';

      // 完全移除登录框
      setTimeout(() => {
        if (modal) modal.remove();
        // 显示欢迎提示
        if (typeof Admin !== 'undefined' && Admin.showToast) {
          Admin.showToast('欢迎回来，管理员！', 'success');
        }
      }, 300);
    }, 800);
  },

  // 添加退出登录功能
  addLogoutButton() {
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (!sidebarFooter) return;

    // 检查是否已存在退出按钮
    if (document.getElementById('auth-logout-btn')) return;

    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'auth-logout-btn';
    logoutBtn.className = 'auth-logout-btn';
    logoutBtn.innerHTML = '<span>🚪</span><span>退出登录</span>';
    logoutBtn.onclick = () => {
      this.logout();
      window.location.reload();
    };

    // 在返回前台链接前插入退出按钮
    const backLink = sidebarFooter.querySelector('.back-link');
    if (backLink) {
      sidebarFooter.insertBefore(logoutBtn, backLink);
    } else {
      sidebarFooter.appendChild(logoutBtn);
    }

    // 添加退出按钮样式
    const styles = document.createElement('style');
    styles.textContent = `
      .auth-logout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 16px;
        margin-bottom: 12px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: var(--radius-md);
        color: var(--danger);
        font-size: 14px;
        cursor: pointer;
        transition: var(--transition);
      }

      .auth-logout-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(styles);
  }
};

// 自动初始化认证
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
    // 如果已认证，添加退出按钮
    if (Auth.isAuthenticated()) {
      setTimeout(() => Auth.addLogoutButton(), 100);
    }
  });
} else {
  Auth.init();
  if (Auth.isAuthenticated()) {
    setTimeout(() => Auth.addLogoutButton(), 100);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
