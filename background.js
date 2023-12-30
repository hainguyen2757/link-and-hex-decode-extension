var link = '';
var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
var plainText; // Declare a global variable to store the encoded value

function isValidURL(url) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?');// protocol)
  
    return urlPattern.test(url);
  }

function convertToStr(cipherText) {
    console.log("cipher text: "+cipherText);
    try {
        // 1st check if the link is from nhentai
        if (cipherText.includes(" ") && cipherText.includes("https")) {
          console.log("Cipher contains blank spaces");
          link = cipherText.replace(/\s/g, "");
        }
        else if (cipherText.length === 6) {
            console.log("This is nhentai code");
          link = "https://nhentai.net/g/" + cipherText;
        } else if (cipherText.startsWith("@")) { //check if the link is a twitter name
            console.log("this is twitter link");
          link = "https://twitter.com/" + cipherText.substring(1);
        } else { //this is a hex code
            console.log("this is hex code");
          // Step 1: Convert hexadecimal to ASCII
          cipherText=cipherText.replace(/\s/g, "");
          var asciiString = "";
          for (var i = 0; i < cipherText.length; i += 2) {
            asciiString += String.fromCharCode(parseInt(cipherText.substr(i, 2), 16));
          }
    
          // Step 2: URL decode the ASCII string
          link = decodeURIComponent(asciiString);
        }
      } catch (error) {
        // If an error occurs during deciphering, direct to a Google search
        console.log("error is: "+ error);
        link = "https://www.google.com/search?q=" + cipherText;
      }
    
      console.log("Final link:" + link);
      if (link.includes("https:")) {
        console.log("Text contain 'https:'");
        return link;
      } else {
        console.log("Text does not contain 'https:'");
        link = "https://www.google.com/search?q=" + cipherText;
        return link;

      }
//      return link;
    }

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  var decodedText = convertToStr(info.selectionText);
  var encodedBase64 = btoa(decodedText);
  plainText = encodedBase64; // Store the value in the background context variable
  console.log(link);
  var isLink = isValidURL(link);
  console.log(isLink);

  if (isLink) {
    if (link.includes("twitter") || link.includes("https://x.com/") || link.includes("@") || link.includes("instagram")) {
        chrome.tabs.create({
          url: link
        });
      } else {
        chrome.windows.create({
          url: link,
          incognito: true
        });
      }
  } else {
    var str = info.selectionText;
    var googleLink = "https://www.google.com/search?q=" + str;
    chrome.windows.create({
      url: googleLink,
      incognito: true
    });
  }
  // Save the link to the settings page
  saveLink(link);
 
});
chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
        id: 'nhentaicaox',
        title: "Code to link",
        contexts: ['selection']
      });    
});

chrome.action.onClicked.addListener(async (tab) => {
  // Open the settings page in a new tab
  const settingsPageUrl = chrome.runtime.getURL("settings.html");
  await chrome.tabs.create({ url: settingsPageUrl });
});