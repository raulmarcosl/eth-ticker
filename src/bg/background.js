(function() {
  var defaultVals = {
    'refresh_time': 10000,
    'decimal_separator': false,
    'green_badge_color': '#7ED321',
    'red_badge_color': '#D0021B',
    'currency': 'USD'
  };

  var config = {};

  var Background = {
    init: function () {
      this.resetCurrentVals();
      this.startRequesting();
    },

    resetCurrentVals: function () {
      for (var key in defaultVals) {
        config[key] = localStorage[key] || defaultVals[key];
      }
    },

    startRequesting: function () {
      this.handleSingleRequest();
      var self = this;
      this.globalIntervalId = window.setInterval(function () {
          self.resetCurrentVals();
          self.handleSingleRequest();
      }, config.refresh_time);
    },

    ReadyStateChange: function (xhr, funcScope, funcName) {
      return function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          funcScope[funcName](xhr.responseText);
        }
      };
    },

    handleSingleRequest: function () {
      var xhr = new XMLHttpRequest();
      var url = 'https://api.kraken.com/0/public/Ticker?pair=ETH' + config.currency;
      xhr.onreadystatechange = this.ReadyStateChange(xhr, this, 'handleSingleRequestResult');
      xhr.open('GET', url, true);
      xhr.send();
    },

    handleSingleRequestResult: function (raw) {
      var res = JSON.parse(raw)['result']['XETHZ' + config.currency];
      this.updateBadge(res['c'][0], res['o']);
    },

    updateBadge: function (price, opening) {
      var color = parseFloat(price) > parseFloat(opening) ? config.green_badge_color : config.red_badge_color;
      chrome.browserAction.setBadgeBackgroundColor({color: color});

      chrome.browserAction.setBadgeText({
        text: price.replace('.', '').substr(0, 3)
      });
    }
  };

  return Background;

})().init();
