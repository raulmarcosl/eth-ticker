(function() {
  var defaultVals = {
    'refresh_time': 10000,
    'decimal_separator': false,
    'badge_color': '#6787A5',
    'currency': 'USD'
  };

  var config = {};

  var BackgroundPage = {
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
          self.handleSingleRequest();
          self.resetCurrentVals();
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
      var url = 'https://api.kraken.com/0/public/Ticker?pair=XETHZ' + config.currency;
      xhr.onreadystatechange = this.ReadyStateChange(xhr, this, 'handleSingleRequestResult');
      xhr.open('GET', url, true);
      xhr.send();
    },

    handleSingleRequestResult: function (raw) {
      var res = JSON.parse(raw)['result']['XETHZ' + config.currency];
      this.cacheResponse(res);
      this.updatePriceBadge(res);
    },

    cacheResponse: function (res) {
      localStorage['price'] = res['c'][0];
      localStorage['opening'] = res['o'];
      localStorage['high'] = res['h'][1];
      localStorage['low'] = res['l'][1];
    },

    updatePriceBadge: function (res) {
      var price = res['c'][0];
      this.updateBadge(price);
    },

    updateBadge: function (price) {
      if (!config['decimal_separator']) {
        price = price.replace('.', '');
      }
      chrome.browserAction.setBadgeBackgroundColor({
        color: config.badge_color
      });
      chrome.browserAction.setBadgeText({
        text: price.substr(0, 3)
      });
    }
  };

  return BackgroundPage;

})().init();
