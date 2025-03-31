// 内容脚本 - 处理页面交互和UI展示

// 全局变量
let selectedText = "";
let translateButton = null;
let resultPopup = null;
let isProcessing = false;

// 初始化
function initialize() {
  // 创建翻译按钮元素
  createTranslateButton();
  
  // 创建结果弹窗元素
  createResultPopup();
  
  // 监听文本选择事件
  document.addEventListener('mouseup', handleTextSelection);
  
  // 监听点击事件（用于关闭弹窗）
  document.addEventListener('mousedown', handleDocumentClick);
  
  // 监听来自背景脚本的消息
  chrome.runtime.onMessage.addListener(handleBackgroundMessages);
  
  console.log("智能划词翻译助手已初始化");
}

// 创建翻译按钮
function createTranslateButton() {
  translateButton = document.createElement('div');
  translateButton.className = 'smart-translate-button';
  translateButton.innerHTML = `
    <div class="translate-icon">译</div>
    <span class="translate-tooltip">翻译</span>
  `;
  translateButton.style.display = 'none';
  translateButton.title = '点击翻译选中文本';
  
  // 添加点击事件
  translateButton.addEventListener('click', handleTranslateButtonClick);
  
  // 添加动画效果
  translateButton.addEventListener('mouseenter', () => {
    translateButton.style.transform = 'scale(1.15)';
  });
  
  translateButton.addEventListener('mouseleave', () => {
    translateButton.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(translateButton);
}

// 创建结果弹窗
function createResultPopup() {
  resultPopup = document.createElement('div');
  resultPopup.className = 'smart-translate-popup';
  resultPopup.style.display = 'none';
  resultPopup.innerHTML = `
    <div class="popup-header">
      <div class="popup-title">翻译结果</div>
      <div class="popup-close">×</div>
    </div>
    <div class="popup-content">
      <div class="popup-loading">加载中...</div>
      <div class="popup-result"></div>
      <div class="popup-error"></div>
    </div>
    <div class="popup-footer">
      <div class="popup-actions">
        <button class="action-translate">翻译</button>
        <button class="action-explain">解释</button>
      </div>
    </div>
  `;
  
  // 添加关闭按钮事件
  resultPopup.querySelector('.popup-close').addEventListener('click', () => {
    hideResultPopup();
  });
  
  // 添加操作按钮事件
  resultPopup.querySelector('.action-translate').addEventListener('click', () => {
    processSelectedText('translate');
  });
  
  resultPopup.querySelector('.action-explain').addEventListener('click', () => {
    processSelectedText('explain');
  });
  
  document.body.appendChild(resultPopup);
}

// 处理文本选择事件
function handleTextSelection(event) {
  // 获取选中的文本
  const text = window.getSelection().toString().trim();
  
  if (text && text.length > 0) {
    selectedText = text;
    
    // 显示翻译按钮在鼠标附近
    const posX = event.pageX + 10;
    const posY = event.pageY - 10;
    
    translateButton.style.left = `${posX}px`;
    translateButton.style.top = `${posY}px`;
    translateButton.style.display = 'block';
  } else {
    // 如果没有选中文本，隐藏按钮
    translateButton.style.display = 'none';
  }
}

// 处理文档点击事件
function handleDocumentClick(event) {
  // 检查点击是否在翻译按钮或结果弹窗外
  if (!translateButton.contains(event.target) && 
      !resultPopup.contains(event.target)) {
    translateButton.style.display = 'none';
    
    // 不要在这里隐藏结果弹窗，让用户可以查看结果
  }
}

// 处理翻译按钮点击
function handleTranslateButtonClick(event) {
  event.stopPropagation();
  
  // 隐藏翻译按钮
  translateButton.style.display = 'none';
  
  // 显示结果弹窗在鼠标附近
  const posX = event.pageX + 10;
  const posY = event.pageY - 10;
  
  showResultPopup(posX, posY);
  
  // 默认执行翻译操作
  processSelectedText('translate');
}

// 显示结果弹窗
function showResultPopup(x, y) {
  // 设置弹窗位置
  resultPopup.style.left = `${x}px`;
  resultPopup.style.top = `${y}px`;
  
  // 重置弹窗内容
  resultPopup.querySelector('.popup-loading').style.display = 'none';
  resultPopup.querySelector('.popup-result').style.display = 'none';
  resultPopup.querySelector('.popup-error').style.display = 'none';
  
  // 显示弹窗
  resultPopup.style.display = 'block';
}

// 隐藏结果弹窗
function hideResultPopup() {
  resultPopup.style.display = 'none';
}

// 处理来自背景脚本的消息
function handleBackgroundMessages(request, sender, sendResponse) {
  if (request.action === "translate" && request.text) {
    selectedText = request.text;
    showResultPopup(window.innerWidth / 2 - 150, window.innerHeight / 2 - 100);
    processSelectedText('translate');
  } else if (request.action === "explain" && request.text) {
    selectedText = request.text;
    showResultPopup(window.innerWidth / 2 - 150, window.innerHeight / 2 - 100);
    processSelectedText('explain');
  }
}

// 处理选中文本的翻译或解释
async function processSelectedText(type) {
  if (!selectedText || isProcessing) return;
  
  isProcessing = true;
  
  // 更新弹窗标题
  resultPopup.querySelector('.popup-title').textContent = 
    type === 'translate' ? '翻译结果' : '解释结果';
  
  // 显示加载状态
  resultPopup.querySelector('.popup-loading').style.display = 'block';
  resultPopup.querySelector('.popup-result').style.display = 'none';
  resultPopup.querySelector('.popup-error').style.display = 'none';
  
  try {
    // 获取API密钥
    const apiKeyResponse = await new Promise(resolve => {
      chrome.runtime.sendMessage({action: "getApiKey"}, resolve);
    });
    
    const apiKey = apiKeyResponse.apiKey;
    
    // 调用API
    const response = await new Promise(resolve => {
      chrome.runtime.sendMessage({
        action: "callApi",
        text: selectedText,
        type: type,
        apiKey: apiKey
      }, resolve);
    });
    
    // 处理响应
    if (response.success) {
      displayResult(response.data, type);
    } else {
      displayError(response.error || "处理请求时出错");
    }
  } catch (error) {
    displayError(error.message || "发生未知错误");
  } finally {
    isProcessing = false;
  }
}

// 显示结果
function displayResult(data, type) {
  const resultElement = resultPopup.querySelector('.popup-result');
  
  // 隐藏加载状态
  resultPopup.querySelector('.popup-loading').style.display = 'none';
  
  // 根据类型显示不同的结果
  if (type === 'translate') {
    resultElement.innerHTML = `
      <div class="result-item">
        <div class="result-original">${selectedText}</div>
        <div class="result-arrow">↓</div>
        <div class="result-translated">${data.translatedText}</div>
      </div>
    `;
  } else if (type === 'explain') {
    resultElement.innerHTML = `
      <div class="result-item">
        <div class="result-original">${selectedText}</div>
        <div class="result-explanation">${data.explanation}</div>
      </div>
    `;
  }
  
  // 显示结果
  resultElement.style.display = 'block';
}

// 显示错误
function displayError(message) {
  // 隐藏加载状态
  resultPopup.querySelector('.popup-loading').style.display = 'none';
  
  // 显示错误信息
  const errorElement = resultPopup.querySelector('.popup-error');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

// 初始化插件
initialize();