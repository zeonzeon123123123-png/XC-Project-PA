/**
 * AI 智能助手模块
 * 为表单填写提供智能建议
 * 
 * 配置信息：
 * - API 端点：https://223.167.85.184:3000/v1
 * - 模型：glm-5-fp8
 */

const AIAssistant = (function() {
  // 配置（从 LocalStorage 读取，如果没有则使用默认配置）
  let config = {
    baseUrl: 'https://223.167.85.184:3000/v1',
    apiKey: 'sk-HlAhQoWHPvKeeHwGmKE2s1LPq7QautJBHURXgX47N7YQPWQg',
    model: 'glm-5-fp8'
  };

  /**
   * 从 LocalStorage 加载用户配置
   */
  function loadUserConfig() {
    try {
      const settings = localStorage.getItem('xc_project_pa_settings');
      if (settings) {
        const data = JSON.parse(settings);
        const defaultKey = data.apiKeys?.find(k => k.isDefault);
        if (defaultKey) {
          const configManager = window.configManager;
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
   * 调用 AI 获取建议
   */
  async function getSuggestion(context, fieldType) {
    const userConfig = loadUserConfig();
    
    const systemPrompt = `你是一个专业的项目文档助手，帮助用户填写项目文档表单。
请提供专业、简洁、实用的建议。
不要直接填写内容，而是提供建议供用户参考。`;

    const userPrompt = `请帮我填写项目文档的"${fieldType}"字段。

当前表单上下文：
${context}

请提供：
1. 填写建议（2-3 条）
2. 注意事项
3. 示例内容（可选）

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
          max_tokens: 500,
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
   * 显示建议面板
   */
  function showSuggestion(fieldId, suggestion, onApply) {
    // 移除旧的面板
    const oldPanel = document.querySelector('.ai-suggestion-panel');
    if (oldPanel) oldPanel.remove();

    // 创建建议面板
    const panel = document.createElement('div');
    panel.className = 'ai-suggestion-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 10000;
    `;

    // 解析建议内容（支持 Markdown 格式）
    const formattedContent = formatSuggestion(suggestion);

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #333;">💡 智能建议</h3>
        <button onclick="this.closest('.ai-suggestion-panel').remove()" 
                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
      </div>
      <div style="line-height: 1.8; color: #555;">${formattedContent}</div>
      <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
        <button onclick="this.closest('.ai-suggestion-panel').remove()" 
                style="padding: 10px 20px; background: #f5f6f7; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">关闭</button>
        <button class="apply-suggestion-btn"
                style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">应用建议</button>
      </div>
    `;

    document.body.appendChild(panel);

    // 绑定应用按钮事件
    panel.querySelector('.apply-suggestion-btn').addEventListener('click', () => {
      if (onApply) onApply(suggestion);
      panel.remove();
    });

    // 点击背景关闭
    panel.addEventListener('click', (e) => {
      if (e.target === panel) panel.remove();
    });
  }

  /**
   * 格式化建议内容（简单的 Markdown 解析）
   */
  function formatSuggestion(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- /g, '<br>• ')
      .replace(/\n1\. /g, '<br>1. ')
      .replace(/\n2\. /g, '<br>2. ')
      .replace(/\n3\. /g, '<br>3. ')
      .replace(/\n/g, '<br>');
  }

  /**
   * 为表单字段添加智能建议按钮
   */
  function attachSuggestionButton(fieldId, fieldType, getContext) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // 创建建议按钮
    const btn = document.createElement('button');
    btn.innerHTML = '💡 获取建议';
    btn.style.cssText = `
      margin-top: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    `;
    btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
    btn.onmouseout = () => btn.style.transform = 'translateY(0)';

    btn.addEventListener('click', async () => {
      const context = getContext ? getContext() : field.value;
      
      // 显示加载状态
      btn.disabled = true;
      btn.innerHTML = '⏳ 思考中...';

      const result = await getSuggestion(context, fieldType);

      btn.disabled = false;
      btn.innerHTML = '💡 获取建议';

      if (result.success) {
        showSuggestion(fieldId, result.content, (suggestion) => {
          // 提取建议中的示例内容填入
          const exampleMatch = suggestion.match(/示例 [：:].*?([。.\n])/);
          if (exampleMatch && field.tagName === 'TEXTAREA') {
            field.value = exampleMatch[0].replace(/示例 [：:]/, '').trim();
          }
        });
      } else {
        alert('获取建议失败：' + result.error);
      }
    });

    // 插入按钮到字段后面
    field.parentNode.insertBefore(btn, field.nextSibling);
  }

  /**
   * 测试连接
   */
  async function testConnection() {
    const userConfig = loadUserConfig();
    
    try {
      const response = await fetch(userConfig.baseUrl + '/models', {
        headers: {
          'Authorization': `Bearer ${userConfig.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `连接成功！可用模型：${data.data?.map(m => m.id).join(', ')}`
        };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 公开接口
  return {
    getSuggestion,
    showSuggestion,
    attachSuggestionButton,
    testConnection,
    loadUserConfig,
    config
  };
})();
