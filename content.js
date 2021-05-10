//listener for alerts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "Bad sku") {
    alert("Invalid SKU!");
  } else if (request.message == "Open tab") {
    alert("Extension requires a tab with bestbuy.ca open");
  }
});
// console.log("content!!!");
