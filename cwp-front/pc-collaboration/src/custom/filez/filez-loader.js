/**
 * gjx-start：联想 FileZ 文档中台集成 —— 加载过渡动画（客开新增文件）
 * ================================================================
 * 视觉与公文模块（apps-edoc-front filez-adapter.js）保持一致：
 *   浅灰白底 + 光环脉冲 + 5 个彩虹色弹跳圆点 + 渐变流光主标题 + 副标题。
 * 生命周期策略也与公文一致：
 *   最短显示 2s（防止一闪而过）→ 0.5s 淡出；失败态红字提示。
 * ================================================================
 */

const OVERLAY_ID = 'filez-loading-overlay';
const STYLE_ID = 'filez-loading-style';

/** 加载动画最短显示时长（毫秒），与公文模块一致 */
export const MIN_OVERLAY_DURATION = 2000;

let stylesInjected = false;

/** 注入加载动画 CSS（全局仅一次；样式与公文模块逐条对齐） */
function ensureLoadingStyles() {
  if (stylesInjected || document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* ===== FileZ 加载动画（与公文模块视觉一致） ===== */
    .filez-loading-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #f7f8fa;
      z-index: 20; min-height: 300px; overflow: hidden;
      opacity: 1;
    }

    /* 光环脉冲 */
    .filez-loading-ring {
      position: relative; width: 80px; height: 80px; margin-bottom: 28px;
      display: flex; align-items: center; justify-content: center;
    }
    .filez-loading-ring::before {
      content: ''; position: absolute; inset: -6px;
      border-radius: 50%;
      border: 2px solid rgba(120, 100, 240, 0.18);
      animation: filez-ring-pulse 2s ease-in-out infinite;
    }
    @keyframes filez-ring-pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.35); opacity: 0.85; }
    }

    /* 彩色弹跳圆点 */
    .filez-loading-dots { display: flex; gap: 10px; position: relative; z-index: 1; }
    .filez-loading-dots .filez-dot {
      width: 14px; height: 14px; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      animation: filez-bounce 1.2s ease-in-out infinite;
    }
    .filez-loading-dots .filez-dot:nth-child(1) { background: #ff6b9d; animation-delay: 0s; }
    .filez-loading-dots .filez-dot:nth-child(2) { background: #c084fc; animation-delay: 0.12s; }
    .filez-loading-dots .filez-dot:nth-child(3) { background: #60a5fa; animation-delay: 0.24s; }
    .filez-loading-dots .filez-dot:nth-child(4) { background: #34d399; animation-delay: 0.36s; }
    .filez-loading-dots .filez-dot:nth-child(5) { background: #fbbf24; animation-delay: 0.48s; }

    @keyframes filez-bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      40% { transform: translateY(-22px) scale(1.3); }
      60% { transform: translateY(-22px) scale(1.3); }
    }

    /* 渐变流光主标题 */
    .filez-loading-text {
      font-size: 15px; font-weight: 600; letter-spacing: 1px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #667eea);
      background-size: 400% 100%;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: filez-shimmer 2.5s linear infinite;
    }
    @keyframes filez-shimmer {
      0% { background-position: 0% 50%; }
      100% { background-position: 400% 50%; }
    }

    /* 副标题 */
    .filez-loading-sub {
      margin-top: 8px; font-size: 12px; color: #b0b0c0; letter-spacing: 0.5px;
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
}

/**
 * 在容器中显示加载动画。容器内已有动画时仅更新文案（保留首次显示时间，
 * 以便 hide 时正确计算"最短显示 2s"）。
 * @param {HTMLElement} container 目标容器
 * @param {Object} [textOptions] {title, sub} 自定义文案
 * @returns {HTMLElement|null} overlay 元素
 */
export function showLoading(container, textOptions) {
  if (!container) return null;
  ensureLoadingStyles();

  let overlay = container.querySelector('#' + OVERLAY_ID);
  const title = (textOptions && textOptions.title) || 'FileZ 文档正在初始化…';
  const sub = (textOptions && textOptions.sub) || '请耐心等待，马上就好 ✨';

  if (overlay) {
    const titleEl = overlay.querySelector('.filez-loading-text');
    const subEl = overlay.querySelector('.filez-loading-sub');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = sub;
    return overlay;
  }

  container.style.position = 'relative';
  overlay = document.createElement('div');
  overlay.className = 'filez-loading-overlay';
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('data-shown-at', String(new Date().getTime()));
  overlay.innerHTML = `
    <div class="filez-loading-ring">
      <div class="filez-loading-dots">
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
      </div>
    </div>
    <div class="filez-loading-text"></div>
    <div class="filez-loading-sub"></div>
  `;
  overlay.querySelector('.filez-loading-text').textContent = title;
  overlay.querySelector('.filez-loading-sub').textContent = sub;
  container.appendChild(overlay);
  return overlay;
}

/**
 * 关闭容器中的加载动画。
 * 默认遵守"最短显示 2s + 0.5s 淡出"；instant 为 true 时立即移除。
 * @param {HTMLElement} container
 * @param {boolean} [instant=false]
 */
export function hideLoading(container, instant = false) {
  if (!container) return;
  const overlay = container.querySelector('#' + OVERLAY_ID);
  if (!overlay) return;

  const doFade = () => {
    overlay.style.transition = 'opacity 0.5s ease-out';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.parentNode && overlay.parentNode.removeChild(overlay), 500);
  };

  if (instant) {
    overlay.parentNode && overlay.parentNode.removeChild(overlay);
    return;
  }

  const shownAt = Number(overlay.getAttribute('data-shown-at')) || 0;
  const elapsed = new Date().getTime() - shownAt;
  const remaining = Math.max(0, MIN_OVERLAY_DURATION - elapsed);
  setTimeout(doFade, remaining);
}

/**
 * 加载失败/超时提示态：主标题换成红色静态文案（与公文模块超时表现一致），
 * 5 秒后自动移除动画。
 * @param {HTMLElement} container
 * @param {string} [message]
 */
export function failLoading(container, message) {
  if (!container) return;
  const overlay = container.querySelector('#' + OVERLAY_ID);
  if (!overlay) return;
  const textEl = overlay.querySelector('.filez-loading-text');
  if (textEl) {
    textEl.textContent = message || '加载时间较长，请检查网络或刷新重试';
    textEl.style.webkitTextFillColor = '#e88080';
    textEl.style.animation = 'none';
  }
  setTimeout(() => hideLoading(container, true), 5000);
}
// gjx-end
