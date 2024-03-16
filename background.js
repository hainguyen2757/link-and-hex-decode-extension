var link = "";
var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
var plainText; // Declare a global variable to store the encoded value

function isValidURL(url) {
  var urlPattern = new RegExp("^(https?:\\/\\/)?"); // protocol)
  return urlPattern.test(url);
}
var mycustomUrl="";
// Retrieving data from local storage
chrome.storage.local.get(['mycustomUrl'], function(result) {
  console.log('Value retrieved:', result.mycustomUrl);
  mycustomUrl = result.mycustomUrl;
});

function saveLink(link) {
  // Retrieve existing links from storage or initialize an empty array
  // Get the current date and time
  var currentDate = new Date();
  var dateString = currentDate.toLocaleString();
  chrome.storage.local.get({ savedLink: [] }, function (result) {
    var savedLinks = result.savedLink;

    //chrome.runtime.sendMessage({ action: 'saveLink', link: link });

    // Ensure savedLinks is an array
    if (!Array.isArray(savedLinks)) {
      savedLinks = [];
    }

    // Add the link to the array
    savedLinks.push({ link: link, date: dateString });

    // Save the updated array back to storage
    chrome.storage.local.set({ savedLink: savedLinks });
    // Update the saved links list
    //in mafinest v3 you need to use chrome.runtime.sendMessage to call a function from other scripts (using action)
    chrome.runtime.sendMessage({ action: "callUpdateSavedLinksList" });
  });
}

function convertToStr(cipherText) {
  console.log("cipher text: " + cipherText);
  try {
    // 1st check if the link is from nhentai
    if (cipherText.includes("https")) {
      console.log("Cipher is a link with https");
      if (cipherText.includes(" ") && cipherText.includes("https")) {
        console.log("cipher has blank space");
        link = cipherText.replace(/\s/g, "");
      }else{
        console.log("cipher has ()");
        link = cipherText.replace(/[()]/g, '');
      }
    } else if (cipherText.length === 6 && !isNaN(cipherText)) {
      console.log("This is nhentai code");
      link = "https://nhentai.net/g/" + cipherText;
    } else if (cipherText.startsWith("@")) {
      //check if the link is a twitter name
      console.log("this is twitter link");
      link = "https://twitter.com/" + cipherText.substring(1);
    }else if (cipherText.length < 6 && !isNaN(cipherText)) {
      console.log("This is hentaivn code");
      link = "https://"+mycustomUrl+"/"+cipherText+"-doc-truyen-id.html";
    } 
    else {
      //this is a hex code
      console.log("this is hex code: "+cipherText);

      // Step 1: Convert hexadecimal to ASCII
      decodeText = cipherText.replace(/\s/g, "");
      var asciiString = "";
      for (var i = 0; i < decodeText.length; i += 2) {
        asciiString += String.fromCharCode(
          parseInt(decodeText.substr(i, 2), 16)
        );
      }

      // Step 2: URL decode the ASCII string
      link = decodeURIComponent(asciiString);
      if (link.includes("https")) {
        console.log("this is a https link: "+link);

      } else {
        console.log("this is just words: "+cipherText);
        link=cipherText;
      }
    }
  } catch (error) {
    // If an error occurs during deciphering, direct to a Google search
    console.log("error is: " + error);
    link = "https://www.google.com/search?q=" + cipherText;
  }

  console.log("Final link:" + link);
  if (link.includes("https:")) {
    console.log("Final link is an URL: "+link);
    return link;
  } else {
    console.log("Text does not contain 'https:'");
    link = "https://www.google.com/search?q=" + link;
    return link;
  }
  //      return link;
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  var decodedText = convertToStr(info.selectionText);
  chrome.storage.local.get(['mycustomUrl'], function(result) {
    console.log('Value retrieved:', result.mycustomUrl);
    mycustomUrl = result.mycustomUrl;
  });
  // var encodedBase64 = btoa(decodedText);
  var utf8Encoded = unescape(encodeURIComponent(decodedText));
  
  // Encode the UTF-8 data using Base64
  var encodedBase64 = btoa(utf8Encoded);

  plainText = encodedBase64; // Store the value in the background context variable

  console.log(link);
  var isLink = isValidURL(link);
  console.log(isLink);

  if (isLink) {
    if (
      link.includes("twitter") ||
      link.includes("https://x.com/") ||
      link.includes("@") ||
      link.includes("instagram")
    ) {
      chrome.tabs.create({
        url: link,
      });
    } else {
      chrome.windows.getAll({ populate: true }, function (windows) {
        let incognitoWindow = null;
        for (let i = 0; i < windows.length; i++) {
            if (windows[i].incognito) {
                incognitoWindow = windows[i];
                break;
            }
        }

        if (incognitoWindow) {
            chrome.tabs.create({
                url: link,
                windowId: incognitoWindow.id
            });
        } else {
            // If no incognito window is open, create a new incognito window
            chrome.windows.create({
                url: link,
                incognito: true,
            });
        }
    });
    }
  } else {
    var str = info.selectionText;
    var googleLink = "https://www.google.com/search?q=" + str;
    chrome.windows.create({
      url: googleLink,
      incognito: true,
    });
  }
  // Save the link to the settings page
  saveLink(link);
});
chrome.contextMenus.removeAll(function () {
  chrome.contextMenus.create({
    id: "nhentaicaox",
    title: "Code to link",
    contexts: ["selection"],
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  // Open the settings page in a new tab
  const settingsPageUrl = chrome.runtime.getURL("settings.html");
  await chrome.tabs.create({ url: settingsPageUrl });
});
