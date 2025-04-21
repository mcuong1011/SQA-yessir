document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;

  // Remove existing icon
  const existing = document.getElementById("twp-translate-icon");
  if (existing) existing.remove();

  const icon = document.createElement("div");
  icon.id = "twp-translate-icon";
  icon.style.position = "absolute";
  icon.style.width = "24px";
  icon.style.height = "24px";
  icon.style.backgroundImage = `url(${chrome.runtime.getURL(
    "icons/google-translate-32.png"
  )})`;
  icon.style.backgroundSize = "contain";
  icon.style.backgroundRepeat = "no-repeat";
  icon.style.backgroundPosition = "center";
  icon.style.cursor = "pointer";
  icon.style.zIndex = "9999";

  const range = window.getSelection().getRangeAt(0);
  const rect = range.getBoundingClientRect();
  icon.style.top = `${window.scrollY + rect.top - 30}px`;
  icon.style.left = `${window.scrollX + rect.left}px`;

  document.body.appendChild(icon);

  icon.onclick = () => {
    fetch(chrome.runtime.getURL("lib/sqa.json"))
      .then((res) => res.json())
      .then((translations) => {
        const cleanText = selectedText.trim().replace(/\s+/g, " ");
        const translated = translations[cleanText] || "No answer found";

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

    icon.remove(); // remove the icon after clicking
  };
});
