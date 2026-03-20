/**
 * AI 实时建议模块
 * 在用户填写表单时实时提供智能建议
 */

const AIRealtimeAssistant = (function() {
  // 配置
  let config = {
    baseUrl: 'https://223.167.85.184:3000/v1',
    apiKey: 'sk-HlAhQoWHPvKeeHwGmKE2s1LPq7QautJBHURXgX47N7YQPWQg',
    model: 'glm-5-fp8'
  };

  // 实时建议的防抖定时器
  let debounceTimers = {};

  /**
   * 从 LocalStorage 加载用户配置
   */
  function loadUserConfig() {
    try {
      const settings = localStorage.getItem('xc_project_pa_settings');
      if (settings) {
        const data = JSON.parse(settings);
        const configManager = window.configManager;
        const defaultKey = data.apiKeys?.find(k => k.isDefault);
        if (defaultKey && configManager) {
          config.apiKey = configManager.decryptKey(defaultKey.encryptedKey);
          config.model = defaultKey.model;
          if (defaultKey.customBaseUrl) {
            config.baseUrl = defaultKey.customBaseUrl;
          }
        }
      }
    } catch (e) {
      console.log('使用默认配置');
    }
    return config;
  }

  /**
   * 为字段添加实时建议功能
   * @param {string} fieldId - 字段 ID
   * @param {string} fieldType - 字段类型描述
   * @param {function} getContext - 获取上下文的函数
   */
  function attachRealtimeSuggestion(fieldId, fieldType, getContext) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // 创建建议面板容器
    const suggestionPanel = document.createElement('div');
    suggestionPanel.className = 'ai-realtime-suggestion';
    suggestionPanel.style.cssText = `
      margin-top: 10px;
      padding: 15px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-left: 3px solid #667eea;
      border-radius: 8px;
      display: none;
      font-size: 13px;
      line-height: 1.6;
      color: #333;
    `;
    suggestionPanel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #667eea;">
        <span>💡</span>
        <span>AI 实时建议</span>
        <span style="margin-left: auto; cursor: pointer; opacity: 0.6;" onclick="this.closest('.ai-realtime-suggestion').style.display='none'">✕</span>
      </div>
      <div class="suggestion-content"></div>
      <div style="margin-top: 10px; display: flex; gap: 8px;">
        <button class="apply-suggestion" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">应用建议</button>
        <button class="refresh-suggestion" style="padding: 6px 12px; background: white; color: #667eea; border: 1px solid #667eea; border-radius: 4px; cursor: pointer; font-size: 12px;">🔄 刷新</button>
      </div>
    `;

    // 插入到字段后面
    field.parentNode.insertBefore(suggestionPanel, field.nextSibling);

    // 监听输入事件
    field.addEventListener('input', () => {
      // 清除之前的定时器
      if (debounceTimers[fieldId]) {
        clearTimeout(debounceTimers[fieldId]);
      }

      // 显示加载状态
      suggestionPanel.style.display = 'block';
      suggestionPanel.querySelector('.suggestion-content').innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #999;">
          <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #667eea; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>
          <span>AI 思考中...</span>
        </div>
      `;

      // 防抖：3 秒后获取建议
      debounceTimers[fieldId] = setTimeout(async () => {
        const context = getContext ? getContext() : field.value;
        const result = await getSuggestion(context, fieldType);

        if (result.success) {
          suggestionPanel.querySelector('.suggestion-content').innerHTML = formatSuggestion(result.content);
          
          // 绑定应用按钮
          suggestionPanel.querySelector('.apply-suggestion').onclick = () => {
            const text = extractExample(result.content);
            if (text && field.tagName === 'TEXTAREA') {
              field.value = text;
              field.dispatchEvent(new Event('input'));
            }
          };

          // 绑定刷新按钮
          suggestionPanel.querySelector('.refresh-suggestion').onclick = async () => {
            suggestionPanel.querySelector('.suggestion-content').innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; color: #999;">
                <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #667eea; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>
                <span>AI 思考中...</span>
              </div>
            `;
            const newResult = await getSuggestion(context, fieldType);
            if (newResult.success) {
              suggestionPanel.querySelector('.suggestion-content').innerHTML = formatSuggestion(newResult.content);
            }
          };
        } else {
          suggestionPanel.querySelector('.suggestion-content').innerHTML = `
            <div style="color: #f44336;">
              ⚠️ 获取建议失败：${result.error}
            </div>
          `;
        }
      }, 3000); // 3 秒防抖
    });

    // 添加 CSS 动画
    if (!document.getElementById('ai-spin-style')) {
      const style = document.createElement('style');
      style.id = 'ai-spin-style';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * 调用 AI 获取建议
   */
  async function getSuggestion(context, fieldType) {
    const userConfig = loadUserConfig();
    
    const systemPrompt = `你是一个专业的项目文档助手，帮助用户填写项目文档表单。
请提供专业、简洁、实用的建议。
回答要简短，不超过 200 字。`;

    const userPrompt = `请帮我填写项目文档的"${fieldType}"字段。

当前内容：${context}

请提供：
1. 填写建议（1-2 条）
2. 简短的示例内容

请用简洁的中文回答。`;

    try {
      const response = await fetch(userConfig.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userConfig.apiKey}`
        },
        body: JSON.stringify({
          model: userConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 300,
          temperature: 0.7
        }),
        timeout: 30000
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || '',
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 格式化建议内容
   */
  function formatSuggestion(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- /g, '<br>• ')
      .replace(/\n1\. /g, '<br>1. ')
      .replace(/\n2\. /g, '<br>2. ')
      .replace(/\n/g, '<br>');
  }

  /**
   * 从建议中提取示例内容
   */
  function extractExample(text) {
    const match = text.match(/示例 [：:].*?([。.\n]|$)/);
    if (match) {
      return match[0].replace(/示例 [：:]/, '').trim();
    }
    return text.split('\n').pop()?.trim() || '';
  }

  return {
    attachRealtimeSuggestion,
    loadUserConfig
  };
})();
