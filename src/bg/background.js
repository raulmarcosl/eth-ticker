(function() {
  var defaultVals = {
    'refresh_time': 10000,
    'decimal_separator': false,
    'badge_color': '#6787A5'
  };

  var config = {};

  var SBT = {

    init: function() {
      this.resetCurrentVals();
      this.startRequesting();
    },

    resetCurrentVals: function() {
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


    handleSingleRequest: function() {
      var xhr = new XMLHttpRequest();
      var url = 'https://api.kraken.com/0/public/Ticker?pair=XETHZUSD';
      var self = this;
      xhr.onreadystatechange = this.ReadyStateChange(xhr, this, 'handleSingleRequestResult');
      xhr.open('GET', url, true);
      xhr.send();
    },

    handleSingleRequestResult: function (raw) {
      var res = JSON.parse(raw);
      this.updatePriceBadge(res);
    },

    updatePriceBadge: function (res) {
      var price = res['result']['XETHZUSD']['c'][0];
      if (!config['decimal_separator']) {
        price = price.replace('.', '');
      }
      this.updateBadge(price.substr(0, 3));
    },

    updateBadge: function (text) {
      chrome.browserAction.setBadgeBackgroundColor({
        color: config.badge_color,
      });
      chrome.browserAction.setBadgeText({
        text: text
      });
    }
  };

  return SBT;

})().init();
