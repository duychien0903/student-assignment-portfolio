/**
 * ============================================================================
 * 個人作業成果展示平台 — 核心控制腳本 (SCRIPT.JS)
 * 學生：裴維戰 (學號: 1111310133)
 * 系所：資訊科技應用系 (醒吾科技大學)
 * 
 * 核心功能：
 * 1. 個人資料與統計數據即時綁定 (Hero Metrics Calculation)
 * 2. 課程分類過濾標籤 (Category Filter Pills)
 * 3. 即時關鍵字搜尋與無相符狀態處理 (Search & Filter Engine)
 * 4. 作業成果卡片動態渲染 (Assignment Cards Grid)
 * 5. 修習課程領域卡片摘要生成 (Courses Overview Grid)
 * 6. 作業詳細檢視彈窗對話框 (Assignment Detail Modal)
 * 7. 實作成果截圖高清放大燈箱 (Screenshot Lightbox Viewer)
 * 8. 行動裝置抽屜式選單與平滑捲動 (Mobile Drawer & Navigation)
 * 9. 捲動置頂按鈕與導覽列陰影效果 (Back to Top & Sticky Header)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. 安全輔助函式 (UTILITY FUNCTIONS)
  // --------------------------------------------------------------------------

  /**
   * 轉義 HTML 特殊字元以避免 XSS
   * @param {string} str 原始字串
   * @returns {string} 轉義後字串
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --------------------------------------------------------------------------
  // 2. DOM 元素快取 (DOM ELEMENTS CACHE)
  // --------------------------------------------------------------------------

  const DOM = {
    // 導覽與頁首
    siteHeader: document.getElementById('siteHeader'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileToggle: document.getElementById('mobileToggle'),
    mobileCloseBtn: document.getElementById('mobileCloseBtn'),
    mobileNav: document.getElementById('mobileNav'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),

    // Hero 統計數據與學生資訊
    studentNameElements: document.querySelectorAll('.student-name-text'),
    studentIdElements: document.querySelectorAll('.student-id-text'),
    studentDeptElements: document.querySelectorAll('.student-dept-text'),
    statTotalAssignments: document.getElementById('statTotalAssignments'),
    statCompletedRate: document.getElementById('statCompletedRate'),
    statLatestDate: document.getElementById('statLatestDate'),

    // 作業工具列、搜尋與過濾
    assignmentSearchInput: document.getElementById('assignmentSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    categoryFilterContainer: document.getElementById('categoryFilterContainer'),
    assignmentsGrid: document.getElementById('assignmentsGrid'),
    emptyStateBox: document.getElementById('emptyStateBox'),
    resetFilterBtn: document.getElementById('resetFilterBtn'),

    // 課程分類摘要
    coursesSummaryGrid: document.getElementById('coursesSummaryGrid'),

    // 關於作者資訊
    aboutBioText: document.getElementById('aboutBioText'),
    interestTagsContainer: document.getElementById('interestTagsContainer'),
    currentYear: document.getElementById('currentYear'),

    // 作業詳情彈窗
    assignmentModal: document.getElementById('assignmentModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalBackBtn: document.getElementById('modalBackBtn'),
    modalNextBtn: document.getElementById('modalNextBtn'),
    mCourseBadge: document.getElementById('mCourseBadge'),
    mStatusBadge: document.getElementById('mStatusBadge'),
    mDateText: document.getElementById('mDateText'),
    modalAssignmentTitle: document.getElementById('modalAssignmentTitle'),
    modalAssignmentBody: document.getElementById('modalAssignmentBody'),

    // 截圖燈箱
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxCaption: document.getElementById('lightboxCaption'),

    // 置頂按鈕
    backToTopBtn: document.getElementById('backToTopBtn')
  };

  // --------------------------------------------------------------------------
  // 3. 狀態管理 (APPLICATION STATE)
  // --------------------------------------------------------------------------

  const state = {
    activeCategory: 'all',
    searchQuery: '',
    assignments: Array.isArray(window.ASSIGNMENTS_DATA) ? window.ASSIGNMENTS_DATA : [],
    categories: Array.isArray(window.COURSE_CATEGORIES) ? window.COURSE_CATEGORIES : [],
    profile: window.STUDENT_PROFILE || {}
  };

  // --------------------------------------------------------------------------
  // 4. 學生個人資料與儀表板統計 (PROFILE & HERO METRICS)
  // --------------------------------------------------------------------------

  function initProfileAndMetrics() {
    // 綁定學生姓名
    if (state.profile.name) {
      DOM.studentNameElements.forEach(el => {
        el.textContent = state.profile.name;
      });
    }

    // 綁定學號
    if (state.profile.studentId) {
      DOM.studentIdElements.forEach(el => {
        el.textContent = state.profile.studentId;
      });
    }

    // 綁定系所
    if (state.profile.department) {
      DOM.studentDeptElements.forEach(el => {
        el.textContent = state.profile.department;
      });
    }

    // 綁定自我介紹
    if (state.profile.bio && DOM.aboutBioText) {
      DOM.aboutBioText.textContent = state.profile.bio;
    }

    // 綁定興趣標籤
    if (Array.isArray(state.profile.interests) && DOM.interestTagsContainer) {
      DOM.interestTagsContainer.innerHTML = state.profile.interests
        .map(interest => `<span class="interest-pill">${escapeHtml(interest)}</span>`)
        .join('');
    }

    // 更新頁尾西元年度
    if (DOM.currentYear) {
      DOM.currentYear.textContent = new Date().getFullYear();
    }

    // 計算 Hero 統計數據
    const totalCount = state.assignments.length;
    if (DOM.statTotalAssignments) {
      DOM.statTotalAssignments.textContent = totalCount;
    }

    if (DOM.statCompletedRate) {
      if (totalCount === 0) {
        DOM.statCompletedRate.textContent = '0%';
      } else {
        const completedCount = state.assignments.filter(item => item.status === 'completed').length;
        const rate = Math.round((completedCount / totalCount) * 100);
        DOM.statCompletedRate.textContent = `${rate}%`;
      }
    }

    // 計算最新更新日期 (從第一篇作業獲取或比對所有日期)
    if (DOM.statLatestDate) {
      if (totalCount === 0) {
        DOM.statLatestDate.textContent = '無作業紀錄';
      } else {
        // 依日期排序取得最新一筆
        const dates = state.assignments
          .map(a => a.date)
          .filter(Boolean)
          .sort()
          .reverse();

        const latest = dates[0] || state.assignments[0].date || '最新';
        DOM.statLatestDate.textContent = latest;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. 課程分類過濾膠囊 (CATEGORY FILTER PILLS)
  // --------------------------------------------------------------------------

  function initCategoryFilters() {
    if (!DOM.categoryFilterContainer) return;

    DOM.categoryFilterContainer.innerHTML = state.categories
      .map(cat => {
        let count = 0;
        if (cat.key === 'all') {
          count = state.assignments.length;
        } else {
          count = state.assignments.filter(a => a.category === cat.key).length;
        }

        const isActive = cat.key === state.activeCategory ? 'active' : '';
        return `
          <button type="button" class="filter-pill ${isActive}" data-category="${escapeHtml(cat.key)}">
            ${escapeHtml(cat.label)} <span class="pill-count" style="font-weight:400; opacity:0.85;">(${count})</span>
          </button>
        `;
      })
      .join('');

    // 綁定點擊事件
    DOM.categoryFilterContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const catKey = btn.getAttribute('data-category');
        setCategoryFilter(catKey);
      });
    });
  }

  function setCategoryFilter(categoryKey) {
    state.activeCategory = categoryKey;

    // 更新按鈕 active 樣式
    if (DOM.categoryFilterContainer) {
      DOM.categoryFilterContainer.querySelectorAll('.filter-pill').forEach(btn => {
        if (btn.getAttribute('data-category') === categoryKey) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    renderAssignments();
  }

  // --------------------------------------------------------------------------
  // 6. 即時搜尋處理 (LIVE SEARCH ENGINE)
  // --------------------------------------------------------------------------

  function initSearch() {
    if (!DOM.assignmentSearchInput) return;

    DOM.assignmentSearchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value.trim().toLowerCase();

      // 切換清除按鈕顯示
      if (DOM.searchClearBtn) {
        DOM.searchClearBtn.style.display = state.searchQuery.length > 0 ? 'block' : 'none';
      }

      renderAssignments();
    });

    if (DOM.searchClearBtn) {
      DOM.searchClearBtn.addEventListener('click', () => {
        DOM.assignmentSearchInput.value = '';
        state.searchQuery = '';
        DOM.searchClearBtn.style.display = 'none';
        DOM.assignmentSearchInput.focus();
        renderAssignments();
      });
    }

    if (DOM.resetFilterBtn) {
      DOM.resetFilterBtn.addEventListener('click', () => {
        if (DOM.assignmentSearchInput) DOM.assignmentSearchInput.value = '';
        if (DOM.searchClearBtn) DOM.searchClearBtn.style.display = 'none';
        state.searchQuery = '';
        setCategoryFilter('all');
      });
    }
  }

  // --------------------------------------------------------------------------
  // 7. 作業卡片渲染 (ASSIGNMENT CARDS RENDERING)
  // --------------------------------------------------------------------------

  function getFilteredAssignments() {
    return state.assignments.filter(item => {
      // 1. 分類過濾
      if (state.activeCategory !== 'all' && item.category !== state.activeCategory) {
        return false;
      }

      // 2. 搜尋過濾
      if (state.searchQuery) {
        const query = state.searchQuery;
        const searchPool = [
          item.title || '',
          item.course || '',
          item.description || '',
          item.date || '',
          Array.isArray(item.technologies) ? item.technologies.join(' ') : '',
          Array.isArray(item.objectives) ? item.objectives.join(' ') : '',
          Array.isArray(item.steps) ? item.steps.map(s => (s.title || '') + ' ' + (s.content || '')).join(' ') : '',
          item.reflection || ''
        ].join(' ').toLowerCase();

        if (!searchPool.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  function renderAssignments() {
    if (!DOM.assignmentsGrid) return;

    const filtered = getFilteredAssignments();

    // 無結果時顯示空狀態
    if (filtered.length === 0) {
      DOM.assignmentsGrid.innerHTML = '';
      if (DOM.emptyStateBox) DOM.emptyStateBox.style.display = 'block';
      return;
    }

    if (DOM.emptyStateBox) DOM.emptyStateBox.style.display = 'none';

    // 渲染卡片
    DOM.assignmentsGrid.innerHTML = filtered
      .map(item => {
        const isCompleted = item.status === 'completed';
        const statusLabel = isCompleted ? '已完成' : '進行中';
        const statusClass = isCompleted ? 'completed' : 'in-progress';
        const thumbUrl = (item.screenshots && item.screenshots[0] && item.screenshots[0].url) 
          ? item.screenshots[0].url 
          : './images/assignments/web-lab-01-result.svg';
        const screenshotCount = Array.isArray(item.screenshots) ? item.screenshots.length : 0;

        const techPills = Array.isArray(item.technologies)
          ? item.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')
          : '';

        return `
          <article class="assignment-card" data-id="${escapeHtml(item.id)}">
            <div class="card-thumbnail-wrap" role="button" tabindex="0" aria-label="點擊查看 ${escapeHtml(item.title)} 實作詳細" data-action="view-detail" data-id="${escapeHtml(item.id)}">
              <img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(item.title)} 實作截圖" loading="lazy">
              <div class="card-top-badges">
                <span class="badge-course">${escapeHtml(item.course)}</span>
                <span class="badge-status ${statusClass}">● ${statusLabel}</span>
              </div>
            </div>

            <div class="card-body">
              <div class="card-date-meta">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="12" height="11" rx="2"></rect>
                  <line x1="2" y1="7" x2="14" y2="7"></line>
                  <line x1="5" y1="1" x2="5" y2="3"></line>
                  <line x1="11" y1="1" x2="11" y2="3"></line>
                </svg>
                <span class="code-font">${escapeHtml(item.date)}</span>
                <span>•</span>
                <span>${screenshotCount} 份佐證截圖</span>
              </div>

              <h3 class="card-title">${escapeHtml(item.title)}</h3>
              <p class="card-description">${escapeHtml(item.description)}</p>

              <div class="card-tech-tags">
                ${techPills}
              </div>

              <div class="card-footer">
                <span class="card-screenshots-count">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2" y="2" width="12" height="12" rx="2"></rect>
                    <circle cx="5.5" cy="5.5" r="1.5"></circle>
                    <polyline points="14 11 10 7 4 13"></polyline>
                  </svg>
                  包含實作佐證
                </span>

                <button type="button" class="btn btn-primary btn-sm btn-view-assignment" data-id="${escapeHtml(item.id)}" data-action="view-detail">
                  <span>查看作業詳細</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    // 綁定查看詳情點擊事件
    DOM.assignmentsGrid.querySelectorAll('[data-action="view-detail"]').forEach(element => {
      element.addEventListener('click', e => {
        e.preventDefault();
        const id = element.getAttribute('data-id');
        openAssignmentModal(id);
      });

      // 支援鍵盤 Enter 開啟
      if (element.classList.contains('card-thumbnail-wrap')) {
        element.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const id = element.getAttribute('data-id');
            openAssignmentModal(id);
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. 課程摘要分類卡片 (COURSES OVERVIEW GRID)
  // --------------------------------------------------------------------------

  function initCoursesSummary() {
    if (!DOM.coursesSummaryGrid) return;

    // 排除 'all'，僅顯示實質課程類別
    const courseCats = state.categories.filter(c => c.key !== 'all');

    // 預設圖示對應表
    const categoryIcons = {
      frontend: `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>`,
      database: `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>`,
      programming: `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>`,
      network: `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="6" height="6" rx="1"></rect>
          <rect x="16" y="2" width="6" height="6" rx="1"></rect>
          <rect x="9" y="16" width="6" height="6" rx="1"></rect>
          <path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"></path>
          <line x1="12" y1="13" x2="12" y2="16"></line>
        </svg>`
    };

    DOM.coursesSummaryGrid.innerHTML = courseCats
      .map(cat => {
        const count = state.assignments.filter(a => a.category === cat.key).length;
        const iconSvg = categoryIcons[cat.key] || categoryIcons.frontend;
        const courseName = cat.courseName || cat.label;

        return `
          <div class="course-summary-card">
            <div class="cs-icon-box">
              ${iconSvg}
            </div>
            <h3 class="cs-title">${escapeHtml(cat.label)}</h3>
            <p class="cs-desc">課程科目：${escapeHtml(courseName)}。包含實作程式碼、架構驗證與截圖佐證紀錄。</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--color-border);">
              <span class="cs-count-tag">${count} 份作業紀錄</span>
              <button type="button" class="btn btn-secondary btn-sm btn-filter-course" data-category="${escapeHtml(cat.key)}">
                檢視作業
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    // 點擊「檢視作業」按鈕連動作業篩選
    DOM.coursesSummaryGrid.querySelectorAll('.btn-filter-course').forEach(btn => {
      btn.addEventListener('click', () => {
        const catKey = btn.getAttribute('data-category');
        setCategoryFilter(catKey);

        // 平滑捲動至作業列表
        const assignmentsSection = document.getElementById('assignments');
        if (assignmentsSection) {
          assignmentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. 作業詳細檢視彈窗 (ASSIGNMENT DETAIL MODAL)
  // --------------------------------------------------------------------------

  function openAssignmentModal(assignmentId) {
    const item = state.assignments.find(a => a.id === assignmentId);
    if (!item || !DOM.assignmentModal) return;

    // 1. 填入標題與中繼資料
    if (DOM.modalAssignmentTitle) DOM.modalAssignmentTitle.textContent = item.title;
    if (DOM.mCourseBadge) DOM.mCourseBadge.textContent = item.course;
    if (DOM.mDateText) DOM.mDateText.textContent = item.date;

    const isCompleted = item.status === 'completed';
    if (DOM.mStatusBadge) {
      DOM.mStatusBadge.textContent = isCompleted ? '已完成' : '進行中';
      DOM.mStatusBadge.className = `modal-status-badge ${isCompleted ? 'completed' : 'in-progress'}`;
    }

    // 2. 構建詳細內容區塊
    let bodyHtml = '';

    // 實作簡述
    if (item.description) {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">📌 實作概要說明</h4>
          <p class="detail-text">${escapeHtml(item.description)}</p>
        </div>
      `;
    }

    // 實作目標
    if (Array.isArray(item.objectives) && item.objectives.length > 0) {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">🎯 學習目標與核心要求</h4>
          <ul class="detail-list">
            ${item.objectives.map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // 使用技術與工具
    if (Array.isArray(item.technologies) && item.technologies.length > 0) {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">🛠️ 使用技術與工具標籤</h4>
          <div class="card-tech-tags">
            ${item.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // 步驟分解
    if (Array.isArray(item.steps) && item.steps.length > 0) {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">📝 實作步驟流程與操作紀錄</h4>
          <div class="steps-container">
            ${item.steps
              .map(step => `
                <div class="step-card-item">
                  <div class="step-item-title">步驟 ${step.step}：${escapeHtml(step.title)}</div>
                  <div class="step-item-content">${escapeHtml(step.content)}</div>
                </div>
              `)
              .join('')}
          </div>
        </div>
      `;
    }

    // 成果截圖佐證 (可點擊放大)
    if (Array.isArray(item.screenshots) && item.screenshots.length > 0) {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">🖼️ 實作成果截圖佐證（點擊圖片可放大燈箱檢視）</h4>
          <div class="screenshots-gallery-grid">
            ${item.screenshots
              .map((shot, idx) => `
                <div class="screenshot-gallery-card" data-url="${escapeHtml(shot.url)}" data-caption="${escapeHtml(shot.caption)}" role="button" tabindex="0" aria-label="點擊放大截圖">
                  <div class="screenshot-preview-wrap">
                    <img src="${escapeHtml(shot.url)}" alt="${escapeHtml(shot.caption)}" loading="lazy">
                    <div class="screenshot-hover-zoom">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                      <span>點擊放大檢視</span>
                    </div>
                  </div>
                  <div class="screenshot-caption-box">
                    <strong style="color:var(--color-primary); font-family:var(--font-mono);">[圖 ${idx + 1}]</strong>
                    ${escapeHtml(shot.caption)}
                  </div>
                </div>
              `)
              .join('')}
          </div>
        </div>
      `;
    } else {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">🖼️ 實作成果截圖佐證</h4>
          <div class="no-screenshots-box">目前暫無上傳此作業之截圖紀錄。</div>
        </div>
      `;
    }

    // 遭遇問題與解決方案
    if (Array.isArray(item.challenges) && item.challenges.length > 0) {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">⚡ 實作遭遇問題與除錯解法 (Troubleshooting)</h4>
          ${item.challenges
            .map(ch => `
              <div class="challenge-card">
                <div class="challenge-problem">⚠️ 遭遇問題：${escapeHtml(ch.problem)}</div>
                <div class="challenge-solution">💡 解決方案：${escapeHtml(ch.solution)}</div>
              </div>
            `)
            .join('')}
        </div>
      `;
    }

    // 學習心得與反思
    if (item.reflection) {
      bodyHtml += `
        <div class="detail-block">
          <h4 class="detail-block-title">💡 學習心得與反思 (Reflection)</h4>
          <div class="reflection-quote-card">
            ${escapeHtml(item.reflection)}
          </div>
        </div>
      `;
    }

    if (DOM.modalAssignmentBody) {
      DOM.modalAssignmentBody.innerHTML = bodyHtml;

      // 綁定截圖點擊放大事件
      DOM.modalAssignmentBody.querySelectorAll('.screenshot-gallery-card').forEach(card => {
        card.addEventListener('click', () => {
          const url = card.getAttribute('data-url');
          const caption = card.getAttribute('data-caption');
          openLightbox(url, caption);
        });

        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const url = card.getAttribute('data-url');
            const caption = card.getAttribute('data-caption');
            openLightbox(url, caption);
          }
        });
      });
    }

    // 顯示彈窗
    DOM.assignmentModal.classList.add('open');
    DOM.assignmentModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAssignmentModal() {
    if (!DOM.assignmentModal) return;
    DOM.assignmentModal.classList.remove('open');
    DOM.assignmentModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModalListeners() {
    if (DOM.modalCloseBtn) DOM.modalCloseBtn.addEventListener('click', closeAssignmentModal);
    if (DOM.modalBackBtn) DOM.modalBackBtn.addEventListener('click', closeAssignmentModal);

    if (DOM.modalNextBtn) {
      DOM.modalNextBtn.addEventListener('click', e => {
        closeAssignmentModal();
      });
    }

    // 點擊彈窗外陰影區域關閉
    if (DOM.assignmentModal) {
      DOM.assignmentModal.addEventListener('click', e => {
        if (e.target === DOM.assignmentModal) {
          closeAssignmentModal();
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // 10. 截圖放大燈箱 (SCREENSHOT LIGHTBOX VIEWER)
  // --------------------------------------------------------------------------

  function openLightbox(imgUrl, captionText) {
    if (!DOM.lightboxModal || !DOM.lightboxImg) return;

    DOM.lightboxImg.src = imgUrl;
    DOM.lightboxImg.alt = captionText || '放大截圖';

    if (DOM.lightboxCaption) {
      DOM.lightboxCaption.textContent = captionText || '';
    }

    DOM.lightboxModal.classList.add('open');
    DOM.lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!DOM.lightboxModal) return;
    DOM.lightboxModal.classList.remove('open');
    DOM.lightboxModal.setAttribute('aria-hidden', 'true');
    if (DOM.lightboxImg) DOM.lightboxImg.src = '';
  }

  function initLightboxListeners() {
    if (DOM.lightboxCloseBtn) {
      DOM.lightboxCloseBtn.addEventListener('click', closeLightbox);
    }

    if (DOM.lightboxModal) {
      DOM.lightboxModal.addEventListener('click', e => {
        // 點擊圖片外暗部區域關閉
        if (e.target === DOM.lightboxModal || e.target.classList.contains('lightbox-content')) {
          closeLightbox();
        }
      });
    }

    // 全域鍵盤 ESC 鍵監聽
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (DOM.lightboxModal && DOM.lightboxModal.classList.contains('open')) {
          closeLightbox();
        } else if (DOM.assignmentModal && DOM.assignmentModal.classList.contains('open')) {
          closeAssignmentModal();
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 11. 行動裝置抽屜選單 (MOBILE DRAWER NAVIGATION)
  // --------------------------------------------------------------------------

  function openMobileNav() {
    if (!DOM.mobileNav) return;
    DOM.mobileNav.classList.add('open');
    DOM.mobileNav.setAttribute('aria-hidden', 'false');
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.classList.add('open');
    if (DOM.mobileToggle) DOM.mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!DOM.mobileNav) return;
    DOM.mobileNav.classList.remove('open');
    DOM.mobileNav.setAttribute('aria-hidden', 'true');
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.classList.remove('open');
    if (DOM.mobileToggle) DOM.mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function initMobileNav() {
    if (DOM.mobileToggle) {
      DOM.mobileToggle.addEventListener('click', () => {
        if (DOM.mobileNav && DOM.mobileNav.classList.contains('open')) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      });
    }

    if (DOM.mobileCloseBtn) {
      DOM.mobileCloseBtn.addEventListener('click', closeMobileNav);
    }

    if (DOM.drawerBackdrop) {
      DOM.drawerBackdrop.addEventListener('click', closeMobileNav);
    }

    // 點擊手機版選單連結自動關閉抽屜
    DOM.mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    const drawerCta = document.querySelector('.mobile-drawer-btn');
    if (drawerCta) {
      drawerCta.addEventListener('click', closeMobileNav);
    }
  }

  // --------------------------------------------------------------------------
  // 12. 捲動置頂與導覽監聽 (SCROLL EFFECTS & SCROLLSPY)
  // --------------------------------------------------------------------------

  function initScrollEffects() {
    const sections = document.querySelectorAll('section[id]');

    function handleScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // 1. 頁首陰影
      if (DOM.siteHeader) {
        if (scrollY > 20) {
          DOM.siteHeader.classList.add('scrolled');
        } else {
          DOM.siteHeader.classList.remove('scrolled');
        }
      }

      // 2. 置頂按鈕顯示 / 隱藏
      if (DOM.backToTopBtn) {
        if (scrollY > 300) {
          DOM.backToTopBtn.classList.add('visible');
        } else {
          DOM.backToTopBtn.classList.remove('visible');
        }
      }

      // 3. ScrollSpy 導覽列當前項目高亮
      let currentSectionId = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      if (currentSectionId) {
        DOM.navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${currentSectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 點擊置頂按鈕平滑回到頂端
    if (DOM.backToTopBtn) {
      DOM.backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 13. 應用程式初始化入口 (DOM READY INITIALIZATION)
  // --------------------------------------------------------------------------

  function init() {
    initProfileAndMetrics();
    initCategoryFilters();
    initSearch();
    renderAssignments();
    initCoursesSummary();
    initModalListeners();
    initLightboxListeners();
    initMobileNav();
    initScrollEffects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
