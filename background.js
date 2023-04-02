function formatDate(userId) {
  const now = new Date();
  const utcOffset = 3; // UTC+3
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const date = new Date(utcTime + (3600000 * utcOffset));
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year} - ${userId} - `;
}

const paymentSystems = [
  { id: "interkassa", name: "InterKassa" },
  { id: "paykassma", name: "Paykassma" },
  { id: "deluxepay", name: "DeluxePay" },
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "blank",
    title: "Blank (Date only)",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "verificationReject",
    title: "Verification reject",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "sep",
    type: "separator",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "missingDeposit",
    title: "Missing deposit",
    contexts: ["editable"],
  });

  paymentSystems.forEach((paymentSystem) => {
    chrome.contextMenus.create({
      id: `missingDeposit-${paymentSystem.id}`,
      parentId: "missingDeposit",
      title: paymentSystem.name,
      contexts: ["editable"],
    });
  });

  chrome.contextMenus.create({
    id: "longWithdrawalProcessing",
    title: "Long withdrawal processing",
    contexts: ["editable"],
  });

  paymentSystems.forEach((paymentSystem) => {
    chrome.contextMenus.create({
      id: `longWithdrawalProcessing-${paymentSystem.id}`,
      parentId: "longWithdrawalProcessing",
      title: paymentSystem.name,
      contexts: ["editable"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'getUserId' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      console.error(JSON.stringify(chrome.runtime.lastError) || 'No response from content script');
      return;
    }

    const userId = response.userId;
    const dateText = formatDate(userId);

    if (info.menuItemId === "blank") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          document.execCommand("insertText", false, text);
        },
        args: [dateText],
      });
    } else if (info.menuItemId === "verificationReject") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          document.execCommand("insertText", false, text);
        },
        args: [`${dateText}verification rejected`],
      });
    } else if (info.menuItemId.startsWith("missingDeposit-")) {
      const paymentSystem = info.menuItemId.replace("missingDeposit-", "");
      const systemData = {
        interkassa: 'IK',
        paykassma: 'PK',
        deluxepay: 'DLX',
      };
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          document.execCommand("insertText", false, text);
        },
        args: [`${dateText} missing deposit of AMOUNT - ${systemData[paymentSystem]}`],
      });
    } else if (info.menuItemId.startsWith("longWithdrawalProcessing-")) {
      const paymentSystem = info.menuItemId.replace("longWithdrawalProcessing-", "");
      const systemData = {
        interkassa: 'IK',
        paykassma: 'PK',
        deluxepay: 'DLX',
      };
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          document.execCommand("insertText", false, text);
        },
        args: [`${dateText} long withdrawal processing of AMOUNT - ${systemData[paymentSystem]}`],
      });
    }
  });
});
