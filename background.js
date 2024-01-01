var link = "";
var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
var plainText; // Declare a global variable to store the encoded value
var enableDebuglogs = false;

function isValidURL(url) {
  var urlPattern = new RegExp("^(https?:\\/\\/)?"); // protocol)

  return urlPattern.test(url);
}

function log(message) {
  if (enableDebuglogs) {
    console.log(message);
  }
}

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
  log("cipher text: " + cipherText);
  try {
    // 1st check if the link is from nhentai
    if (cipherText.includes(" ") && cipherText.includes("https")) {
      log("Cipher contains blank spaces");
      link = cipherText.replace(/\s/g, "");
    } else if (cipherText.length === 6) {
      log("This is nhentai code");
      link = "https://nhentai.net/g/" + cipherText;
    } else if (cipherText.startsWith("@")) {
      //check if the link is a twitter name
      log("this is twitter link");
      link = "https://twitter.com/" + cipherText.substring(1);
    } else {
      //this is a hex code
      log("this is hex code");
      // Step 1: Convert hexadecimal to ASCII
      cipherText = cipherText.replace(/\s/g, "");
      var asciiString = "";
      for (var i = 0; i < cipherText.length; i += 2) {
        asciiString += String.fromCharCode(
          parseInt(cipherText.substr(i, 2), 16)
        );
      }

      // Step 2: URL decode the ASCII string
      link = decodeURIComponent(asciiString);
    }
  } catch (error) {
    // If an error occurs during deciphering, direct to a Google search
    log("error is: " + error);
    link = "https://www.google.com/search?q=" + cipherText;
  }

  log("Final link:" + link);
  if (link.includes("https:")) {
    log("Text contain 'https:'");
    return link;
  } else {
    log("Text does not contain 'https:'");
    link = "https://www.google.com/search?q=" + cipherText;
    return link;
  }
  //      return link;
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  var decodedText = convertToStr(info.selectionText);
  var encodedBase64 = btoa(decodedText);
  plainText = encodedBase64; // Store the value in the background context variable
  log(link);
  var isLink = isValidURL(link);
  log(isLink);

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
      chrome.windows.create({
        url: link,
        incognito: true,
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
