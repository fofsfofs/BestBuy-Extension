//buttons
let addBtn = document.getElementById("add");
let deleteBtn = document.getElementById("delete");
var info = {
  tx: "",
  ta: "",
};

//when add to cart is clicked
addBtn.addEventListener("click", async () => {
  //get ta and tx from signed in cookies
  chrome.cookies.getAll(
    {
      domain: ".bestbuy.ca",
    },
    function (cookies) {
      for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].name == "tx") {
          info.tx = cookies[i].value;
        } else if (cookies[i].name == "ta") {
          info.ta = cookies[i].value;
        }
      }
      var value = JSON.stringify(info);
      console.log(value);

      //add to values to chrome storage for access later
      chrome.storage.local.set({ key: value }, async function () {
        console.log("Value is set to " + value);
        //get sku from text field
        sku = document.getElementById("sku").value;
        skuCheck = await fetch(
          `https://www.bestbuy.ca/api/offers/v1/products/${sku}/offers`,
          {
            headers: {
              accept: "*/*",
              "accept-language": "en-US,en;q=0.9",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "sec-gpc": "1",
            },
            referrer:
              "https://www.bestbuy.ca/en-ca/product/amd-ryzen-5-3600-hexa-core-3-6ghz-am4-desktop-processors/15331711",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "omit",
          }
        );

        //make sure sku is valid
        if (skuCheck.ok) {
          console.log("OK");
          //add sku to storage
          chrome.storage.local.set({ sku: sku }, function () {
            console.log("sku: " + sku);
          });
          //look for bb tab
          chrome.tabs.query({}, (tabs) => {
            var found = false;
            var tabId;
            tabs.forEach((tab) => {
              if (tab.url.includes("bestbuy.ca")) {
                console.log(tab.url);
                found = true;
                tabId = tab.id;
              }
            });
            //bb tab isnt found send alert
            if (!found) {
              console.log("not found");
              chrome.tabs.query(
                { currentWindow: true, active: true },
                function (tabs) {
                  var activeTab = tabs[0];
                  chrome.tabs.sendMessage(activeTab.id, {
                    message: "Open tab",
                  });
                }
              );
            } else {
              //bb tab is found inject script
              chrome.scripting.executeScript(
                {
                  target: { tabId: tabId },
                  files: ["script.js"],
                },
                () => {}
              );
            }
          });
        } else {
          //sku isnt valid alert
          console.log("nope");
          chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabs) {
              var activeTab = tabs[0];
              chrome.tabs.sendMessage(activeTab.id, { message: "Bad sku" });
            }
          );
        }
      });
    }
  );
});

//when delete button is clicked
deleteBtn.addEventListener("click", async () => {
  //delete all bb related cookies
  chrome.cookies.getAll(
    {
      domain: ".bestbuy.ca",
    },
    function (cookies) {
      for (var i = 0; i < cookies.length; i++) {
        chrome.cookies.remove({
          url: "https://bestbuy.ca" + cookies[i].path,
          name: cookies[i].name,
        });
      }
      chrome.tabs.create({
        url:
          "https://www.bestbuy.ca/identity/global/signin?redirectUrl=https%3A%2F%2Fwww.bestbuy.ca%2Faccount%2Fen-ca&lang=en-CA",
      });
    }
  );
});
