//get stored ta and tx
chrome.storage.local.get(["key"], function (result) {
  var info = JSON.parse(result.key);
  //getting cartId
  fetch("https://www.bestbuy.ca/api/account/customer", {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      authorization: `bearer ${info.ta}`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
    },
    referrer: "https://www.bestbuy.ca/account/en-ca",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      var id = "";
      try {
        id = data.id.substring(1, data.id.length - 1);
      } catch (error) {
        alert("You are not signed in!");
      }
      var newInfo = {
        cartId: id,
        tx: info.tx,
        ta: info.ta,
      };
      var value = JSON.stringify(newInfo);

      //adding cartId to local storage
      if (id != "") {
        chrome.storage.local.set({ key: value }, async function () {
          console.log("Value is set to " + value);
        });

        chrome.storage.local.get(["key"], function (result) {
          var info = JSON.parse(result.key);
          console.log(`cartId: ${info.cartId}`);
          chrome.storage.local.get("sku", function (result) {
            var sku = result.sku;
            console.log(`SKU: ${sku}`);
            //performing add to cart request
            var add = fetch("https://www.bestbuy.ca/api/basket/v2/baskets", {
              headers: {
                accept: "*/*",
                "accept-language": "en-CA",
                "content-type": "application/json",
                "postal-code": "M1S",
                "region-code": "ON",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "user-agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36",
              },
              origin: "https://www.bestbuy.ca",
              referrer:
                "https://www.bestbuy.ca/en-ca/product/amd-ryzen-5-3600-hexa-core-3-6ghz-am4-desktop-processors/15331711",
              referrerPolicy: "strict-origin-when-cross-origin",
              body: `{"id":"${info.cartId}","lineItems":[{"quantity":1,"sku":"${sku}"}]}`,
              method: "POST",
              mode: "cors",
              credentials: "include",
            }).then((response) => {
              response.json();
              if (response.ok) {
                alert(`Successfully added ${sku}!`);
              } else {
                if (response.status == 422) {
                  alert("Item is already in your cart!");
                } else {
                  alert(
                    "Cookies probably expired...\nDelete cookies and sign in again"
                  );
                }
              }
            });
          });
        });
      }
    });
});
