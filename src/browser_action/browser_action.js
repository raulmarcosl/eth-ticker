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
      this.updateElementPrice('.price', localStorage['price']);
      this.updateElementPrice('.opening', localStorage['opening']);
      this.updateElementPrice('.high', localStorage['high']);
      this.updateElementPrice('.low', localStorage['low']);
      this.updatePercentage('.percentage', localStorage['price'], localStorage['opening']);
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
      var dotIndex = price.indexOf('.') > 0 ? price.indexOf('.') : 0;
      var trimmedPrice = price.substring(0, dotIndex + 3);
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

    parseData: function (data) {
      var price = data['c'][0];
      var opening = data['o'];
      var high = data['h'][1];
      var low = data['l'][1];

      this.updateElementPrice('.price', price);
      this.updateElementPrice('.opening', opening);
      this.updateElementPrice('.high', high);
      this.updateElementPrice('.low', low);
      this.updatePercentage('.percentage', price, opening);
      this.updateBadge(price, opening);

      this.cacheResponse(data);
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
      this.updateBadgeColor(price, opening);
      this.updateBadgeText(price);
    },

    updateBadgeColor: function (price, opening) {
      var color = parseFloat(price) > opening ? config.green_badge_color : config.red_badge_color;
      chrome.browserAction.setBadgeBackgroundColor({
        color: color
      });
    },

    updateBadgeText: function (price) {
      var price = price.toString().replace('.', '');
      chrome.browserAction.setBadgeText({
        text: price.substr(0, 3)
      });
    }
  };

  return BrowserAction;
})().init();
