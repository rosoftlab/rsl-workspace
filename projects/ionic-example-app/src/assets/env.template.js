(function (window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["baseUrl"] = "${apiUrl}";
  window["env"]["authUrl"] = "${authUrl}";
  window["env"]["rdictApi"] = "${rdictApi}";
})(this);
