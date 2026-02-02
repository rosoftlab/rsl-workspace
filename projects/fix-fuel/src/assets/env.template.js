(function (window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["baseUrl"] = "${apiUrl}";
  window["env"]["authUrl"] = "${authUrl}";
})(this);
