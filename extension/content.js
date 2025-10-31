const AIDER_API = "http://localhost:5000";

function detectPlatform() {
    const url = window.location.hostname;
    if (url.includes("claude")) return "claude";
    if (url.includes("perplexity")) return "perplexity";
    return "unknown";
}

function extractYAML() {
    const codeBlocks = document.querySelectorAll("pre, [class*=\"code\"], code");
    let yamlBlock = null;
    
    for (let i = codeBlocks.length - 1; i >= 0; i--) {
        const text = codeBlocks[i].textContent;
        if (text.includes("response_type:") && 
            (text.includes("files_needed:") || text.includes("code_changes:"))) {
            yamlBlock = text;
            break;
        }
    }
    
    if (!yamlBlock) return null;
    return yamlBlock.trim().replace(/^-{3,}\s*\n/, "").replace(/\n-{3,}\s*$/, "").trim();
}

async function sendToExecute(yamlBlock) {
    try {
        const response = await fetch(`${AIDER_API}/execute`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({yaml_content: yamlBlock})
        });
        
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Aider Bridge Error:", error);
        return null;
    }
}

function fillInput(content) {
    const platform = detectPlatform();
    let inputBox = null;
    
    if (platform === "perplexity") {
        inputBox = document.querySelector("#ask-input");
    } else {
        inputBox = document.querySelector("textarea, div[contenteditable=\"true\"], [role=\"textbox\"]");
    }
    
    if (!inputBox) return false;
    
    if (platform === "perplexity") {
        inputBox.innerHTML = `<p>${content.replace(/\n/g, "<br>")}</p>`;
        inputBox.dispatchEvent(new Event("input", {bubbles: true}));
        inputBox.dispatchEvent(new Event("change", {bubbles: true}));
    } else {
        if (inputBox.tagName === "TEXTAREA") {
            inputBox.value = content;
        } else {
            inputBox.textContent = content;
        }
        inputBox.dispatchEvent(new Event("input", {bubbles: true}));
    }
    
    return true;
}

async function runAiderBridge() {
    console.log("🚀 Aider Bridge: Running...");
    
    const yaml = extractYAML();
    if (!yaml) {
        console.log("⚠️ No YAML found");
        return false;
    }
    
    console.log("✅ YAML extracted");
    
    const response = await sendToExecute(yaml);
    if (!response) {
        console.log("❌ API request failed");
        return false;
    }
    
    console.log("✅ Got response from API");
    
    const filled = fillInput(response.claude_feedback);
    if (filled) {
        console.log("✅ Input filled!");
        return true;
    } else {
        console.log("⚠️ Could not fill input");
        return false;
    }
}

// Message handler from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "run") {
        runAiderBridge().then(success => {
            sendResponse({success: success});
        });
        return true;
    }
});

window.aiderBridge = {run: runAiderBridge};
console.log("✅ Aider Bridge loaded! Run: aiderBridge.run()");
