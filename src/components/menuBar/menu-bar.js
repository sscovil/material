/**
 * @ngdoc module
 * @name material.components.menu-bar
 */

angular.module('material.components.menuBar', [
  'material.core',
  'material.components.menu'
])
.directive('mdMenuBar', MenuBarDirective);

function MenuBarDirective($mdUtil) {
  return {
    restrict: 'E',
    require: 'mdMenuBar',
    controller: MenuBarCtrl,
    compile: compile
  };

  function compile(templateEl, templateAttrs) {
    angular.forEach(templateEl[0].children, function(menuEl) {
      if (menuEl.nodeName == 'MD-MENU') {
        if (!menuEl.hasAttribute('md-position-mode')) {
          menuEl.setAttribute('md-position-mode', 'left bottom');
        }
        var contentEls = $mdUtil.nodesToArray(menuEl.querySelectorAll('md-menu-content'));
        angular.forEach(contentEls, function(contentEl) {
          contentEl.classList.add('md-menu-bar-menu');
          contentEl.classList.add('md-dense');
          if (!contentEl.hasAttribute('width')) {
            contentEl.setAttribute('width', 5);
          }
        });
      }
    });
    return link;
  }

  function link(scope, el, attrs, ctrl) {
    ctrl.init();
  }
}

function MenuBarCtrl($scope, $element, $attrs, $mdConstant, $document, $mdUtil) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$mdConstant = $mdConstant;
  this.$mdUtil = $mdUtil;
  this.$document = $document;
  this.$scope = $scope;
}

MenuBarCtrl.prototype.init = function() {
  var $element = this.$element;
  var self = this;
  $element.on('keydown', angular.bind(this, this.handleKeyDown));
  this.$scope.$on('$mdMenuOpen', function(event, el) {
    if ($element[0].contains(el[0])) {
      el[0].classList.add('md-open');
      self.currentlyOpenMenu = el.controller('mdMenu');
      self.currentlyOpenMenu.registerContainerProxy(self.handleKeyDown.bind(self));
    }
  });
  this.$scope.$on('$mdMenuClose', function(event, el) {
    if ($element[0].contains(el[0])) {
      el[0].classList.remove('md-open');
      self.currentlyOpenMenu = undefined;
    }
  });
};

MenuBarCtrl.prototype.handleKeyDown = function(e) {
  var keyCodes = this.$mdConstant.KEY_CODE;
  var menuCtrl = this.currentlyOpenMenu;
  switch (e.keyCode) {
    case keyCodes.DOWN_ARROW:
      if (menuCtrl) {
        menuCtrl.focusMenuContainer();
      } else {
        this.openFocusedMenu();
      }
      break;
    case keyCodes.UP_ARROW:
      menuCtrl && menuCtrl.close();
      break;
    case keyCodes.LEFT_ARROW:
      menuCtrl && menuCtrl.close();
      this.focusMenu(-1);
      break;
    case keyCodes.RIGHT_ARROW:
      menuCtrl && menuCtrl.close();
      this.focusMenu(+1);
      break;
  }
};

MenuBarCtrl.prototype.focusMenu = function(direction) {
  var menus = this.getMenus();
  var focusedIndex = this.getFocusedMenuIndex();

  var changed = false;

  if (focusedIndex == -1) { focusedIndex = 0; }
  else if (
    direction < 0 && focusedIndex > 0 ||
    direction > 0 && focusedIndex < menus.length - direction
  ) {
    focusedIndex += direction;
    changed = true;
  }
  if (changed) {
    menus[focusedIndex].querySelector('button').focus();
  }
};

MenuBarCtrl.prototype.openFocusedMenu = function() {
  var menu = this.getFocusedMenu();
  menu && menu.querySelector('button').click();
};

MenuBarCtrl.prototype.getMenus = function() {
  var $element = this.$element;
  return this.$mdUtil.nodesToArray($element[0].querySelectorAll('md-menu'));
};

MenuBarCtrl.prototype.getFocusedMenu = function() {
  return this.getMenus()[this.getFocusedMenuIndex()];
};

MenuBarCtrl.prototype.getFocusedMenuIndex = function() {
  var $mdUtil = this.$mdUtil;
  var $element = this.$element;
  var focusedEl = $mdUtil.getClosest(
    this.$document[0].activeElement,
    'MD-MENU'
  );
  if (!focusedEl) return -1;

  var focusedIndex = this.getMenus().indexOf(focusedEl);
  return focusedIndex;

};
