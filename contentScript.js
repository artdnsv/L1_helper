function getUserIdFromIntercom() {
    const userElement = document.querySelector('#ember842 > div > div > div > div > div:nth-child(11) > p.flex.px-1.overflow-hidden.border.border-transparent.w-3\\/5 > span > span');
    if (userElement) {
      const userId = userElement.textContent.trim();
      return userId;
    }
    return '';
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getUserId') {
      const userId = getUserIdFromIntercom();
      sendResponse({ userId });
    }
  });
  