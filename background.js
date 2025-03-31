// 背景脚本 - 处理插件的全局事件和API调用

// 初始化上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateSelection",
    title: "翻译选中文本",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "explainSelection",
    title: "解释选中文本",
    contexts: ["selection"]
  });

  // 设置默认配置
  chrome.storage.sync.get(['apiKey', 'targetLang', 'apiUrl', 'modelName'], function(result) {
    if (!result.apiKey) {
      chrome.storage.sync.set({apiKey: ''});
    }
    if (!result.targetLang) {
      chrome.storage.sync.set({targetLang: 'zh-CN'});
    }
    if (!result.apiUrl) {
      chrome.storage.sync.set({apiUrl: 'https://api.openai.com/v1/chat/completions'});
    }
    if (!result.modelName) {
      chrome.storage.sync.set({modelName: 'gpt-3.5-turbo'});
    }
  });
});

// 处理上下文菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateSelection" && info.selectionText) {
    // 发送消息到内容脚本进行翻译
    chrome.tabs.sendMessage(tab.id, {
      action: "translate",
      text: info.selectionText
    });
  } else if (info.menuItemId === "explainSelection" && info.selectionText) {
    // 发送消息到内容脚本进行解释
    chrome.tabs.sendMessage(tab.id, {
      action: "explain",
      text: info.selectionText
    });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getApiKey") {
    // 获取API密钥
    chrome.storage.sync.get(['apiKey'], function(result) {
      sendResponse({apiKey: result.apiKey});
    });
    return true; // 异步响应
  } else if (request.action === "getTargetLang") {
    // 获取目标语言
    chrome.storage.sync.get(['targetLang'], function(result) {
      sendResponse({targetLang: result.targetLang});
    });
    return true; // 异步响应
  } else if (request.action === "getApiUrl") {
    // 获取API URL
    chrome.storage.sync.get(['apiUrl'], function(result) {
      sendResponse({apiUrl: result.apiUrl});
    });
    return true; // 异步响应
  } else if (request.action === "getModelName") {
    // 获取模型名称
    chrome.storage.sync.get(['modelName'], function(result) {
      sendResponse({modelName: result.modelName});
    });
    return true; // 异步响应
  } else if (request.action === "callApi") {
    // 调用API（可以在这里实现API调用，避免内容脚本中的跨域问题）
    chrome.storage.sync.get(['apiUrl', 'modelName'], function(result) {
      callTranslationApi(request.text, request.type, request.apiKey, result.apiUrl, result.modelName)
        .then(response => {
          sendResponse({success: true, data: response});
        })
        .catch(error => {
          sendResponse({success: false, error: error.message});
        });
    });
    return true; // 异步响应
  }
});

// 调用翻译/解释API
async function callTranslationApi(text, type, apiKey, apiUrl, modelName) {
  // 使用真实的大模型API调用
  
  if (!apiKey) {
    throw new Error("请在设置中配置API密钥");
  }
  
  if (!apiUrl) {
    throw new Error("API URL未配置");
  }
  
  if (!modelName) {
    throw new Error("模型名称未配置");
  }
  
  try {
    // 准备请求内容
    let prompt = "";
    if (type === "translate") {
      prompt = `请将以下文本翻译成中文，只返回翻译结果，不要有任何解释或额外内容：\n${text}`;
    } else if (type === "explain") {
      prompt = `请简要解释以下内容，并以纯文本的形式回答，禁止使用markdown格式：\n${text}`;
    } else {
      throw new Error("不支持的操作类型");
    }
    
    // 构建API请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {role: "system", content: type === "translate" ? "你是一个专业的翻译助手" : "你是一个专业的解释助手"},
          {role: "user", content: prompt}
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const resultText = data.choices[0]?.message?.content?.trim() || "";
    
    // 根据类型返回不同的结果
    if (type === "translate") {
      return {
        translatedText: resultText
      };
    } else if (type === "explain") {
      return {
        explanation: resultText
      };
    }
  } catch (error) {
    console.error("API调用错误:", error);
    throw new Error(`API调用失败: ${error.message}`);
  }
  
  throw new Error("处理请求时出错");
}