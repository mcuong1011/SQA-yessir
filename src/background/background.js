chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-local",
    title: "Translate to english",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-local" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedText) => {
        fetch(chrome.runtime.getURL("lib/sqa.json"))
          .then((res) => res.json())
          .then((translations) => {
            const cleanText = selectedText.trim().replace(/\s+/g, " ");
            const translated = translations[cleanText] || "No answer found";

            const selection = window.getSelection();
            const range =
              selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            const rect = range
              ? range.getBoundingClientRect()
              : { top: 100, left: 100 };

            const oldPopup = document.getElementById("twp-popup");
            if (oldPopup) oldPopup.remove();

            const popup = document.createElement("div");
            popup.id = "twp-popup";
            popup.textContent = translated;
            popup.style.position = "absolute";
            popup.style.zIndex = "10000";
            popup.style.top = `${window.scrollY + rect.top}px`;
            popup.style.left = `${window.scrollX + rect.left + 30}px`;
            popup.style.padding = "8px";
            popup.style.backgroundColor = "black";
            popup.style.color = "white";
            popup.style.border = "1px solid #444";
            popup.style.boxShadow = "0px 0px 8px rgba(0,0,0,0.2)";
            popup.style.fontSize = "14px";
            popup.style.maxWidth = "280px";
            popup.style.borderRadius = "6px";

            document.body.appendChild(popup);
            setTimeout(() => popup.remove(), 1000);
          });
      },
      args: [info.selectionText],
    });
  }
});
