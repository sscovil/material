angular
  .module('menuBarDemoBasic', ['ngMaterial'])
  .config(function($mdIconProvider) {
    $mdIconProvider
      .defaultIconSet('/dist/docs/img/icons/sets/core-icons.svg', 24)
      .iconSet('call', '/dist/docs/img/icons/sets/communication-icons.svg', 24);
  })
  .filter('keyboardShortcut', function($window) {
    return function(str) {
      if (!str) return;
      var keys = str.split('-');
      var isOSX = /Mac OS X/.test($window.navigator.userAgent);

      var seperator = (!isOSX || keys.length > 2) ? '+' : '';

      var abbreviations = {
        M: isOSX ? '⌘' : 'Ctrl',
        A: isOSX ? 'Option' : 'Alt',
        S: 'Shift'
      };

      return keys.map(function(key, index) {
        var last = index == keys.length - 1;
        return last ? key : abbreviations[key];
      }).join(seperator);
    };
  })
  .controller('DemoBasicCtrl', function DemoCtrl() {
    this.settings = {
      printLayout: true,
      showRuler: true,
      showSpellingSuggestions: true
    };

    this.toggleSetting = function(name) {
      this.settings[name] = !this.settings[name];
    };
  });

