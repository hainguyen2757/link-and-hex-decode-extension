//in mafinest v3 you need to use chrome.runtime.onMessage.addListener to be able to call a function from other scripts (defining action)
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "callUpdateSavedLinksList") {
    updateSavedLinksList();
  }
});
// Call the updateSavedLinksList function when the page loads
window.onload = function () {
  // Call the updateSavedLinksList function when the page loads
  updateSavedLinksList();
  loadHistoryFromStorage();
};

function saveCustomUrl(customUrl) {
  localStorage.setItem("customUrl", customUrl);
}
document.getElementById("processURLButton").addEventListener("click", function () {
  var customUrl = document.getElementById("customUrl").value;
  saveCustomUrl(customUrl);
  alert("Custom URL saved successfully!");
    chrome.storage.local.set({ mycustomUrl: customUrl }, function() {//key mycustomURL, value customURL
    console.log('URL changed to '+customUrl);
  });
});


var deletedLinksHistory = [];

// Function to save a link to the history
function saveToHistory(link) {
  
  //console.log("saving link is " + link.link);
  deletedLinksHistory.push(link.link);
  updateDeletedLinksHistory();
  // Save the updated history to chrome.storage.local
  chrome.storage.local.set({ 'deletedLinksHistory': deletedLinksHistory }, function () {
    //console.log('History saved to chrome.storage.local:', deletedLinksHistory);
  });
}
function updateDeletedLinksHistory() {
  //console.log("Accessing updateDeletedLinksHistory");
  var historyTextArea = document.getElementById("historyTextArea");
  //console.log("History text area:", historyTextArea);
  //console.log("Deleted links history:", deletedLinksHistory);
  historyTextArea.textContent = deletedLinksHistory.join("\n");
  //console.log("Updated history text content:", historyTextArea.textContent);
}
// Function to clear the deleted links history
function clearHistory() {
  deletedLinksHistory = [];
  updateDeletedLinksHistory();
  // Clear the history from chrome.storage.local
  chrome.storage.local.set({ 'deletedLinksHistory': [] }, function () {
    console.log('History cleared from chrome.storage.local');
  });
}
// Function to load the history from chrome.storage.local
function loadHistoryFromStorage() {
  chrome.storage.local.get('deletedLinksHistory', function (result) {
    deletedLinksHistory = result.deletedLinksHistory || [];
    updateDeletedLinksHistory(); // Call this to immediately update the displayed history
    //console.log('History loaded from chrome.storage.local:', deletedLinksHistory);
  });
}
document.getElementById("clearHistoryButton").addEventListener("click", clearHistory);

// Function to open a saved link in a new tab
function openInNewTab(link) {
  chrome.tabs.create({
    url: link,
  });
}

// Function to copy text to clipboard
function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

// saving links to setting
function saveLink(link) {
  // Retrieve existing links from storage or initialize an empty array
  // Get the current date and time
  var currentDate = new Date();
  var dateString = currentDate.toLocaleString();
  chrome.storage.local.get({ savedLink: [] }, function (result) {
    var savedLinks = result.savedLink;
    // Ensure savedLinks is an array
    if (!Array.isArray(savedLinks)) {
      savedLinks = [];
    }

    // Add the link to the array
    savedLinks.push({ link: link, date: dateString });

    // Save the updated array back to storage
    chrome.storage.local.set({ savedLink: savedLinks });
    // Update the saved links list
    updateSavedLinksList();
  });
}
function backupDataToLocalStorage(data) {
  localStorage.setItem("backupData", JSON.stringify(data));
  console.log("Data backed up successfully.");
}
function saveDataToLocalStorage(data) {
  localStorage.setItem("myData", JSON.stringify(data));
}
// Function to update the saved links list
function updateSavedLinksList() {
  // Retrieve saved links from storage

  chrome.storage.local.get("savedLink", function (result) {
    var savedLinks = result.savedLink || [];
    var savedLinksList = document.getElementById("savedLinksList");
    //saving to localstorage
    //console.log(savedLinks);
    var myData = { key: savedLinks };
    saveDataToLocalStorage(myData);
    // Clear the existing list
    savedLinksList.innerHTML = "";
    // Populate the list with saved links
    savedLinks.forEach(function (link, index) {
      // Create a list item
      var listItem = document.createElement("li");

      // Create a div to contain the link and buttons
      var linkBox = document.createElement("div");
      linkBox.className = "link-box";

      // Create a button for deleting the link with a data-index attribute
      var deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-link";
      deleteButton.setAttribute("data-index", index);

      // Create a button for opening the link in incognito with a data-index attribute
      var incognitoButton = document.createElement("button");
      incognitoButton.textContent = "Open in Incognito";
      incognitoButton.className = "open-incognito";
      incognitoButton.setAttribute("data-index", index);

      // Create a button for opening the link in a new tab with a data-index attribute
      var newTabButton = document.createElement("button");
      newTabButton.textContent = "Open in New Tab";
      newTabButton.className = "open-new-tab";
      newTabButton.setAttribute("data-index", index);

      // Create a span to display the link
      var linkSpan = document.createElement("span");
      if (typeof link === "string") {
        linkSpan.textContent = link;
      } else {
        linkSpan.textContent = link.link;
      }
      linkSpan.className = "copy-text";

      var dateSpan = document.createElement("span");
      dateSpan.textContent = "Date Added: " + link.date;
      dateSpan.className = "date-added";

      // Append the buttons and link to the linkBox
      linkBox.appendChild(linkSpan);
      linkBox.appendChild(dateSpan);
      linkBox.appendChild(incognitoButton);
      linkBox.appendChild(newTabButton);
      linkBox.appendChild(deleteButton);

      // Append the linkBox to the list item
      listItem.appendChild(linkBox);

      // Append the list item to the saved links list
      savedLinksList.appendChild(listItem);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var saveLinkButton = document.getElementById("saveLinkButton");
  var processLinksButton = document.getElementById("processLinksButton");

  saveLinkButton.addEventListener("click", function () {
    // Call your saveLink function or any other functions
    var addedLink = document.getElementById("addLink").value;
    saveLink(addedLink);
    document.getElementById("addLink").value = "";
  });
  // Add a click event listener to process the links
  processLinksButton.addEventListener("click", processLinks);

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("copy-text")) {
      copyTextToClipboard(event.target.textContent);
      showNotification("Link copied!", event);
    }
  });
  // Call the updateSavedLinksList function when the page loads
  updateSavedLinksList();

var backupDataButton = document.getElementById("backupDataButton");
backupDataButton.addEventListener("click", function (event) {
  // Display a confirmation prompt
  var confirmBackup = confirm("Are you sure you want to back up your data?");
  
  if (confirmBackup) {
    chrome.storage.local.get("savedLink", function (result) {
    var savedLinks = result.savedLink || [];
      var backupData = { key: savedLinks };
      backupDataToLocalStorage(backupData);
    });
  } else {
    // User clicked "Cancel" or closed the prompt
    console.log("Backup operation canceled by the user.");
  }
});
//add a data restore from backup button here

});

// Function to delete a saved link by index
function deleteSavedLink(index) {
  chrome.storage.local.get("savedLink", function (result) {
    var savedLinks = result.savedLink || [];

    // Ensure index is within bounds
    if (index >= 0 && index < savedLinks.length) {
      // Remove the link at the specified index
      saveToHistory(savedLinks[index]);
      savedLinks.splice(index, 1);

      // Save the updated array back to storage
      chrome.storage.local.set({ savedLink: savedLinks });

      // Update the saved links list
      updateSavedLinksList();
    }
  });
}

// Add an event listener to the saved links list for delegated event handling
document
  .getElementById("savedLinksList")
  .addEventListener("click", function (event) {
    // Check if the clicked element is a button with the class "delete-link", "open-incognito", or "open-new-tab"
    if (event.target.classList.contains("delete-link")) {
      // Get the index from the data-index attribute
      var index = parseInt(event.target.getAttribute("data-index"), 10);

      // Call the deleteSavedLink function with the index
      deleteSavedLink(index);
    } else if (event.target.classList.contains("open-incognito")) {
      // Get the index from the data-index attribute
      var index = parseInt(event.target.getAttribute("data-index"), 10);

      // Retrieve saved links from storage
      chrome.storage.local.get("savedLink", function (result) {
        var savedLinks = result.savedLink || [];

        // Ensure index is within bounds
        if (index >= 0 && index < savedLinks.length) {
          // Open the link in incognito mode
          //console.log(savedLinks[index].link);
          if (typeof savedLinks[index] === "string") {
            openInIncognito(savedLinks[index]);
          } else {
            openInIncognito(savedLinks[index].link);
          }
        }
      });
    } else if (event.target.classList.contains("open-new-tab")) {
      // Get the index from the data-index attribute
      var index = parseInt(event.target.getAttribute("data-index"), 10);

      // Retrieve saved links from storage
      chrome.storage.local.get("savedLink", function (result) {
        var savedLinks = result.savedLink || [];

        // Ensure index is within bounds
        if (index >= 0 && index < savedLinks.length) {
          // Open the link in a new tab
          if (typeof savedLinks[index] === "string") {
            openInNewTab(savedLinks[index]);
          } else {
            openInNewTab(savedLinks[index].link);
          }
        }
      });
    }
  });

// Function to open a saved link in incognito mode
function openInIncognito(link) {
  chrome.windows.create({
    url: link,
    incognito: true,
  });
}

// Function to show a notification popup near the clicked element
function showNotification(message, clickEvent) {
  var notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  // Position the notification near the clicked element
  notification.style.position = "absolute";
  notification.style.top = clickEvent.clientY - 20 + "px";
  notification.style.left = clickEvent.clientX + "px";

  document.body.appendChild(notification);

  // Remove the notification after a short delay
  setTimeout(function () {
    notification.classList.add("fade-out");
    setTimeout(function () {
      document.body.removeChild(notification);
    }, 1300); // Delay removal after the fade-out transition
  }, 700); // Adjust the initial delay as needed
}

async function processLinks() {
  // Get the links from the text area
  var linksTextarea = document.getElementById("linksTextarea");
  var linksText = linksTextarea.value;

  // Split the text into an array of links based on the 'https://' pattern
  var linksArray = linksText.split("https://");
  // Remove the empty string at the beginning of the array
  linksArray = linksArray.filter(function (link) {
    return link.trim() !== "";
  });

  // Process each link asynchronously
  for (const link of linksArray) {
    // Ensure 'https://' is added back to the link
    const processedLink = "https://" + link.trim();
    console.log("Processing link:", processedLink);

    // Save each link using the saveLink function asynchronously
    await saveLinkAsync(processedLink);
  }

  // Clear the text area
  linksTextarea.value = "";

  // Update the saved links list
  updateSavedLinksList();
}

// Modified saveLink function to support async/await
async function saveLinkAsync(link) {
  return new Promise((resolve) => {
    // Simulate an asynchronous operation (you may need to modify this)
    setTimeout(() => {
      saveLink(link);
      resolve();
    }, 0);
  });
}