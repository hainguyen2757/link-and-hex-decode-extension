chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "backgroundToSettings") {
      console.log("Message from background.js:", message.data);
      // Call functions or perform actions in settings.js based on the message
    }
  });

// Function to open a saved link in a new tab
function openInNewTab(link) {
    chrome.tabs.create({
      url: link
    });
  }

// Function to copy text to clipboard
function copyTextToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
  

// saving links to setting
function saveLink(link) {
    // Retrieve existing links from storage or initialize an empty array
    chrome.storage.local.get({ 'savedLink': [] }, function (result) {
      var savedLinks = result.savedLink;
      

      // Ensure savedLinks is an array
      if (!Array.isArray(savedLinks)) {
        savedLinks = [];
      }
  
      // Add the link to the array
      savedLinks.push(link);
  
      // Save the updated array back to storage
      chrome.storage.local.set({ 'savedLink': savedLinks });
      // Update the saved links list
      updateSavedLinksList();
      
    });
  }
  
  
  // Function to update the saved links list
  function updateSavedLinksList() {
    // Retrieve saved links from storage
    chrome.storage.local.get('savedLink', function (result) {
      var savedLinks = result.savedLink || [];
      var savedLinksList = document.getElementById('savedLinksList');
  
      // Clear the existing list
      savedLinksList.innerHTML = '';
  
      // Populate the list with saved links
      savedLinks.forEach(function (link, index) {
        // Create a list item
        var listItem = document.createElement('li');
  
        // Create a div to contain the link and buttons
        var linkBox = document.createElement('div');
        linkBox.className = 'link-box';
  
        // Create a button for deleting the link with a data-index attribute
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-link';
        deleteButton.setAttribute('data-index', index);
  
        // Create a button for opening the link in incognito with a data-index attribute
        var incognitoButton = document.createElement('button');
        incognitoButton.textContent = 'Open in Incognito';
        incognitoButton.className = 'open-incognito';
        incognitoButton.setAttribute('data-index', index);
  
        // Create a button for opening the link in a new tab with a data-index attribute
        var newTabButton = document.createElement('button');
        newTabButton.textContent = 'Open in New Tab';
        newTabButton.className = 'open-new-tab';
        newTabButton.setAttribute('data-index', index);
  
        // Create a span to display the link
        var linkSpan = document.createElement('span');
        linkSpan.textContent = link;
        linkSpan.className="copy-text";
  
        // Append the buttons and link to the linkBox
        linkBox.appendChild(linkSpan);
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
  
  
  
// Call the updateSavedLinksList function when the page loads
window.onload = updateSavedLinksList;

document.addEventListener('DOMContentLoaded', function () {
    var saveLinkButton = document.getElementById('saveLinkButton');
    var processLinksButton = document.getElementById('processLinksButton');
    
    saveLinkButton.addEventListener('click', function () {
      // Call your saveLink function or any other functions
    var addedLink = document.getElementById('addLink').value;
      saveLink(addedLink);
     document.getElementById('addLink').value = '';

    });
 // Add a click event listener to process the links
 processLinksButton.addEventListener('click', processLinks);

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('copy-text')) {
          copyTextToClipboard(event.target.textContent);
          showNotification('Link copied!', event);
        }
      });
    // Call the updateSavedLinksList function when the page loads
    updateSavedLinksList();
  });

// Function to delete a saved link by index
  function deleteSavedLink(index) {
    chrome.storage.local.get('savedLink', function (result) {
      var savedLinks = result.savedLink || [];
  
      // Ensure index is within bounds
      if (index >= 0 && index < savedLinks.length) {
        // Remove the link at the specified index
        savedLinks.splice(index, 1);
  
        // Save the updated array back to storage
        chrome.storage.local.set({ 'savedLink': savedLinks });
  
        // Update the saved links list
        updateSavedLinksList();
      }
    });
  }

  // Add an event listener to the saved links list for delegated event handling
document.getElementById('savedLinksList').addEventListener('click', function (event) {
  // Check if the clicked element is a button with the class "delete-link", "open-incognito", or "open-new-tab"
  if (event.target.classList.contains('delete-link')) {
    // Get the index from the data-index attribute
    var index = parseInt(event.target.getAttribute('data-index'), 10);

    // Call the deleteSavedLink function with the index
    deleteSavedLink(index);
  } else if (event.target.classList.contains('open-incognito')) {
    // Get the index from the data-index attribute
    var index = parseInt(event.target.getAttribute('data-index'), 10);

    // Retrieve saved links from storage
    chrome.storage.local.get('savedLink', function (result) {
      var savedLinks = result.savedLink || [];

      // Ensure index is within bounds
      if (index >= 0 && index < savedLinks.length) {
        // Open the link in incognito mode
        openInIncognito(savedLinks[index]);
      }
    });
  } else if (event.target.classList.contains('open-new-tab')) {
    // Get the index from the data-index attribute
    var index = parseInt(event.target.getAttribute('data-index'), 10);

    // Retrieve saved links from storage
    chrome.storage.local.get('savedLink', function (result) {
      var savedLinks = result.savedLink || [];

      // Ensure index is within bounds
      if (index >= 0 && index < savedLinks.length) {
        // Open the link in a new tab
        openInNewTab(savedLinks[index]);
      }
    });
  }
});

  // Function to open a saved link in incognito mode
function openInIncognito(link) {
    chrome.windows.create({
      url: link,
      incognito: true
    });
  }

// Function to show a notification popup near the clicked element
function showNotification(message, clickEvent) {
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Position the notification near the clicked element
    notification.style.position = 'absolute';
    notification.style.top = (clickEvent.clientY-20) + 'px';
    notification.style.left = clickEvent.clientX + 'px';
  
    document.body.appendChild(notification);
  
    // Remove the notification after a short delay
    setTimeout(function () {
        notification.classList.add('fade-out');
        setTimeout(function () {
          document.body.removeChild(notification);
        }, 1300); // Delay removal after the fade-out transition
      }, 700); // Adjust the initial delay as needed
    }

    async function processLinks() {
      // Get the links from the text area
      var linksTextarea = document.getElementById('linksTextarea');
      var linksText = linksTextarea.value;
    
      // Split the text into an array of links based on the 'https://' pattern
      var linksArray = linksText.split('https://');
      // Remove the empty string at the beginning of the array
      linksArray = linksArray.filter(function (link) {
        return link.trim() !== '';
      });
    
      // Process each link asynchronously
      for (const link of linksArray) {
        // Ensure 'https://' is added back to the link
        const processedLink = 'https://' + link.trim();
        console.log('Processing link:', processedLink);
    
        // Save each link using the saveLink function asynchronously
        await saveLinkAsync(processedLink);
      }
    
      // Clear the text area
      linksTextarea.value = '';
    
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
    