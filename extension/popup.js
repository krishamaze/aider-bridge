document.addEventListener("DOMContentLoaded", () => {
    const runBtn = document.getElementById("runBtn");
    const platformDiv = document.getElementById("platform");
    const statusDiv = document.getElementById("status");
    
    // Get current tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const tab = tabs[0];
        
        // Detect platform
        let platform = "Unknown";
        if (tab.url.includes("claude")) platform = "Claude.ai";
        else if (tab.url.includes("perplexity")) platform = "Perplexity.ai";
        
        platformDiv.textContent = platform;
        
        // Check API
        fetch("http://localhost:5000/context", {method: "GET"})
            .then(res => res.ok ? "connected" : "disconnected")
            .then(status => {
                if (status === "connected") {
                    statusDiv.className = "status connected";
                    statusDiv.textContent = "✅ API Connected";
                } else {
                    statusDiv.textContent = "❌ API Disconnected";
                }
            })
            .catch(() => {
                statusDiv.textContent = "❌ API Disconnected";
            });
    });
    
    // Run button handler
    runBtn.addEventListener("click", () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "run"}, (response) => {
                if (response && response.success) {
                    runBtn.textContent = "✅ Success!";
                    setTimeout(() => {
                        runBtn.textContent = "▶️ Run Aider Bridge";
                    }, 2000);
                } else {
                    runBtn.textContent = "❌ Failed";
                    setTimeout(() => {
                        runBtn.textContent = "▶️ Run Aider Bridge";
                    }, 2000);
                }
            });
        });
    });
});
