"use strict";

let $ = document.querySelector.bind(document);

$("#btnClose").addEventListener("click", () => {
  window.history.back();
});

$("#btnApply").addEventListener("click", () => {
  twpConfig.setTargetLanguage($("#selectTargetLanguage").value, true);
  // twpConfig.set("dontSortResults", $("#dontSortResults").value);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: "improveTranslation",
        sourceLanguage: $("#selectOriginalLanguage").value,
        pageTranslatorService: $("#pageTranslatorService").value,
        dontSortResults: $("#dontSortResults").value,
        targetLanguage: $("#selectTargetLanguage").value,
      },
      (response) => {
        checkedLastError();
        window.history.back();
      }
    );
  });
});

twpConfig
  .onReady()
  .then(() => twpI18n.updateUiMessages())
  .then(() => {
    twpI18n.translateDocument();

    $("#pageTranslatorService").value = twpConfig.get("pageTranslatorService");
    $("#dontSortResults").value = twpConfig.get("dontSortResults");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getCurrentSourceLanguage" },
        (sourceLanguage) => {
          checkedLastError();
          $("#selectOriginalLanguage").value = sourceLanguage
            ? sourceLanguage
            : "auto";
        }
      );

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getCurrentPageTranslatorService" },
        (pageService) => {
          checkedLastError();
          if (pageService) {
            $("#pageTranslatorService").value = pageService;
          }
        }
      );
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getDontSortResults" },
        (dontSortResults) => {
          checkedLastError();
          $("#dontSortResults").value = dontSortResults ? "yes" : "no";
        }
      );
    });

    let langs = twpLang.getLanguageList();

    const langsSorted = [];

    for (const i in langs) {
      langsSorted.push([i, langs[i]]);
    }

    langsSorted.sort(function (a, b) {
      return a[1].localeCompare(b[1]);
    });

    const eAllLangs = selectTargetLanguage.querySelector('[name="all"]');
    langsSorted.forEach((value) => {
      const option = document.createElement("option");
      option.value = value[0];
      option.textContent = value[1];
      eAllLangs.appendChild(option);
    });

    const selectOriginalLanguage_group_1 = $("#selectOriginalLanguage > [name='group_1']");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "getOriginalTabLanguage",
        },
        {
          frameId: 0,
        },
        (tabLanguage) => {
          checkedLastError();
          if (
            tabLanguage && (tabLanguage = twpLang.fixTLanguageCode(tabLanguage))
          ) {
            langsSorted.forEach((value) => {
              if (value[0] === tabLanguage) {
                const option = document.createElement("option");
                option.value = value[0];
                option.textContent = value[1];
                selectOriginalLanguage_group_1.appendChild(option);
              }
            });
          }
        }
      );
    });
  
    const selectOriginalLanguage_group_2 = $("#selectOriginalLanguage > [name='group_2']");
    langsSorted.forEach((value) => {
      const option = document.createElement("option");
      option.value = value[0];
      option.textContent = value[1];
      selectOriginalLanguage_group_2.appendChild(option);
    });

    const eRecentsLangs =
      selectTargetLanguage.querySelector('[name="targets"]');
    for (const value of twpConfig.get("targetLanguages")) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = langs[value];
      eRecentsLangs.appendChild(option);
    }
    selectTargetLanguage.value = twpConfig.get("targetLanguages")[0];

    function disableDarkMode() {
      if (!$("#lightModeElement")) {
        const el = document.createElement("style");
        el.setAttribute("id", "lightModeElement");
        el.setAttribute("rel", "stylesheet");
        el.textContent = `
            body {
                color: rgb(0, 0, 0);
                background-color: rgb(224, 224, 224);
            }
  
            .select, #btnApply {
                color: black;
                background-color: rgba(0, 0, 0, 0.2);
            }
            
            .select:hover, .select:focus, #btnApply:hover {
                background-color: rgba(0, 0, 0, 0.4);
            }
  
            .mdiv, .md {
                background-color: rgb(0, 0, 0);
            }
            `;
        document.head.appendChild(el);
      }
    }

    function enableDarkMode() {
      if ($("#lightModeElement")) {
        $("#lightModeElement").remove();
      }
    }

    switch (twpConfig.get("darkMode")) {
      case "auto":
        if (matchMedia("(prefers-color-scheme: dark)").matches) {
          enableDarkMode();
        } else {
          disableDarkMode();
        }
        break;
      case "yes":
        enableDarkMode();
        break;
      case "no":
        disableDarkMode();
        break;
      default:
        break;
    }
  });
