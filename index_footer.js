    <script src="js/ai-assistant.js"></script>
    <script>
        // 检查 AI 状态
        document.addEventListener('DOMContentLoaded', async () => {
            const statusEl = document.getElementById('aiStatus');
            if (statusEl) {
                const result = await AIAssistant.testConnection();
                
                if (result.success) {
                    statusEl.innerHTML = `
                        <span style="display: inline-block; width: 8px; height: 8px; background: #4caf50; border-radius: 50%; margin-right: 6px;"></span>
                        AI 助手已就绪（模型：glm-5-fp8）
                    `;
                } else {
                    statusEl.innerHTML = `
                        <span style="display: inline-block; width: 8px; height: 8px; background: #f44336; border-radius: 50%; margin-right: 6px;"></span>
                        AI 助手未连接，请<a href="settings.html" style="color: white; text-decoration: underline;">配置 API Key</a>
                    `;
                    statusEl.style.background = 'rgba(244, 67, 54, 0.2)';
                    statusEl.style.padding = '8px 12px';
                    statusEl.style.borderRadius = '6px';
                }
            }
        });

        // 打开文档
        function openDoc(docType) {
            const docMap = {
                '立项书': 'prototype-form.html',
                '可行性报告': 'feasibility-form.html',
                '项目章程': 'charter-form.html',
                '正式立项说明': 'approval-form.html',
                '项目状态表': 'status-form.html',
                '评审流程': 'review-form.html',
                '结项报告': 'closure-form.html',
                '成果报告': 'achievement-form.html'
            };
            
            const url = docMap[docType] || 'prototype-form.html';
            window.location.href = url;
        }

        // 搜索文档
        function searchDocs() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toLowerCase();
            const cards = document.querySelectorAll('.doc-card');
            
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(filter) || desc.includes(filter)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    </script>