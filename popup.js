document.addEventListener('DOMContentLoaded', function() {
  var openOptionsButton = document.getElementById('openOptions');
  openOptionsButton.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
});