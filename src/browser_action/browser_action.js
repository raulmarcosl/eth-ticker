(function() {
  var defaultVals = {
    'decimal_separator': false,
    'badge_color': '#6787A5',
    'currency': 'USD',
    'symbol': '$',
    'symbol_prefix': true
  };

  var config = {};

  var BrowserAction = {
    init: function () {
      this.resetCurrentVals();
      this.initializeContent();
      this.registerListeners();
      this.handleSingleRequest();
    },

    initializeContent: function () {
      $('input[value=' + config.currency + ']').prop('checked', true);
      this.updateElementPrice('.price', localStorage['price']);
      this.updateElementPrice('.opening', localStorage['opening']);
      this.updateElementPrice('.high', localStorage['high']);
      this.updateElementPrice('.low', localStorage['low']);
      this.updatePercentage('.percentage', localStorage['price'], localStorage['opening']);
    },

    registerListeners: function () {
      var self = this;
      $('.options-form input').on('change', function() {
        localStorage['currency'] = $('input[name=currency]:checked').val();
        self.resetCurrentVals();
        self.handleSingleRequest();
      });
    },

    resetCurrentVals: function () {
      for (var key in defaultVals) {
        config[key] = localStorage[key] || defaultVals[key];
      }

      if (config.currency === 'USD') {
        config.symbol = '$';
        config.symbol_prefix = true;
      } else if (config.currency === 'EUR') {
        config.symbol = '\u20AC';
        config.symbol_prefix = false;
      } else if (config.currency === 'GBP') {
        config.symbol = '\u00A3';
        config.symbol_prefix = true;
      } else if (config.currency === 'CAD') {
        config.symbol = 'C$';
        config.symbol_prefix = true;
      }
    },

    updateElementPrice: function (element, price) {
      var trimmedPrice = price.substring(0, price.indexOf('.') + 3);
      if (config.symbol_prefix) {
        $(element).text(config.symbol + ' ' + trimmedPrice);
      } else {
        $(element).text(trimmedPrice + ' ' + config.symbol);
      }
    },

    handleSingleRequest: function () {
      var xhr = new XMLHttpRequest(),
          url = 'https://api.kraken.com/0/public/Ticker?pair=XETHZ' + config.currency;
      xhr.onreadystatechange = this.onReadyStateChange(xhr, this);
      xhr.open('GET', url, true);
      xhr.send();
    },

    onReadyStateChange: function (xhr, funcScope) {
      return function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          var res = JSON.parse(xhr.responseText)['result']['XETHZ' + config.currency];
          var price = res['c'][0];
          var opening = res['o'];
          var high = res['h'][1];
          var low = res['l'][1];

          funcScope.updateElementPrice('.price', price);
          funcScope.updateElementPrice('.opening', opening);
          funcScope.updateElementPrice('.high', high);
          funcScope.updateElementPrice('.low', low);
          funcScope.updatePercentage('.percentage', price, opening);
          funcScope.updateBadge(price);

          funcScope.cacheResponse(res);
        }
      };
    },

    cacheResponse: function (res) {
      localStorage['price'] = res['c'][0];
      localStorage['opening'] = res['o'];
      localStorage['high'] = res['h'][1];
      localStorage['low'] = res['l'][1];
    },

    updatePercentage: function (element, price, opening) {
      var percentage = (parseFloat(price) * 100 / parseFloat(opening) - 100).toString();
      $(element).text(percentage.substring(0, percentage.indexOf('.') + 3) + '%');
    },

    updateBadge: function (price) {
      if (!config.decimal_separator) {
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

  return BrowserAction;
})().init();
