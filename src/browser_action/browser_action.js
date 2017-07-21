(function() {
  var defaultVals = {
    'currency': 'USD',
    'symbol': '$',
    'symbol_prefix': true,
    'green_badge_color': '#7ED321',
    'red_badge_color': '#D0021B',
  };

  var config = {};

  var BrowserAction = {
    init: function () {
      this.resetConfigVars();
      this.initializeContent();
      this.registerListeners();
      this.requestData();
    },

    initializeContent: function () {
      $('input[value=' + config.currency + ']').prop('checked', true);
    },

    registerListeners: function () {
      var self = this;
      $('.options-form .input-container').on('click', function() {
        $(this).find('input').prop("checked", true);
        localStorage['currency'] = $('input[name=currency]:checked').val();
        self.resetConfigVars();
        self.resetInfoShown();
        self.requestData();
      });
    },

    resetConfigVars: function () {
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
        config.symbol = '$';
        config.symbol_prefix = true;
      }
    },

    resetInfoShown: function () {
      this.hideElement('.icon-up');
      this.hideElement('.icon-down');
      $('span').each(function () {
        $(this).text('-');
      });
    },

    updateElementPrice: function (element, price) {
      var trimmedPrice = price.substring(0, Math.max(price.indexOf('.'), 0) + 3);
      var text = config.symbol_prefix ? config.symbol + trimmedPrice : trimmedPrice + config.symbol;
      $(element).text(text);
    },

    requestData: function () {
      var xhr = new XMLHttpRequest();
      var url = 'https://api.kraken.com/0/public/Ticker?pair=XETHZ' + config.currency;
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
          funcScope.updateBadge(price, opening);
        }
      };
    },

    updatePercentage: function (element, price, opening) {
      var percentage = (parseFloat(price) * 100 / parseFloat(opening) - 100).toString();
      if (percentage >= 0) {
        this.hideElement('.icon-down');
        this.showElement('.icon-up');
      } else {
        this.hideElement('.icon-up');
        this.showElement('.icon-down');
      }

      var percentageText = percentage >= 0 ? '+' : '';
      var dotIndex = percentage.indexOf('.');
      var text = percentageText + percentage.substring(0, dotIndex + 3) + '%';
      $(element).text(text);
    },

    hideElement: function (element) {
      $(element).css('visibility', 'hidden');
    },

    showElement: function (element) {
      $(element).css('visibility', 'visible');
    },

    updateBadge: function (price, opening) {
      var color = parseFloat(price) > parseFloat(opening) ? config.green_badge_color : config.red_badge_color;
      chrome.browserAction.setBadgeBackgroundColor({color: color});

      chrome.browserAction.setBadgeText({
        text: price.replace('.', '').substr(0, 3)
      });
    }
  };

  return BrowserAction;
})().init();
