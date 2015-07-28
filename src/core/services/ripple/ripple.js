angular.module('material.core')
    .factory('$mdInkRipple', InkRippleService)
    .directive('mdInkRipple', InkRippleDirective)
    .directive('mdNoInk', attrNoDirective)
    .directive('mdNoBar', attrNoDirective)
    .directive('mdNoStretch', attrNoDirective);

// TODO: Add support for both centered and non-centered ripples
// TODO: Add support for mdNoBar, mdNoStretch, and mdNoInk
// TODO: Look into `$animateCss` then vs done vs finally
// TODO: Fetch theme color details
// TODO: Investigate using enter/leave ngAnimate logic in place of $animateCss
// TODO: Wire up any relevant options from previous versions

function InkRippleDirective () {
  // TODO: Build ink ripple directive as a simple way to add ripples to any element - should rely on ink ripple service
  return { controller: angular.noop };
}

function InkRippleService ($injector) {
  return { attach: attach };
  function attach (scope, element, options) {
    return $injector.instantiate(InkRippleServiceController, {
      $scope:        scope,
      $element:      element,
      rippleOptions: options
    });
  }
}

/**
 * Service for applying an ink-ripple to any element
 *
 * @param $scope
 * @param $element
 * @param rippleOptions
 * @param $animateCss
 * @constructor
 *
 * @ngInject
 */
function InkRippleServiceController ($scope, $element, rippleOptions, $animateCss) {
  this.scope        = $scope;
  this.element      = $element;
  this.options      = rippleOptions;
  this.container    = this.createContainer();
  this.mousedown    = false;
  this.$animateCss  = $animateCss;
  this.removalQueue = [];
  this.ripples      = [];

  this.bindEvents();
}

/**
 * Binds events to the root element for
 */
InkRippleServiceController.prototype.bindEvents      = function () {
  this.element.on('mousedown', angular.bind(this, this.handleMousedown));
  this.element.on('mouseup', angular.bind(this, this.handleMouseup));
  this.element.on('mouseleave', angular.bind(this, this.handleMouseup));
};

/**
 * Create a new ripple on every mousedown event from the root element
 *
 * @param event
 */
InkRippleServiceController.prototype.handleMousedown = function (event) {
  this.mousedown = true;
  this.createRipple(event.layerX, event.layerY);
};

/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (either by
 * mouseup or mouseleave event)
 *
 * @param event
 */
InkRippleServiceController.prototype.handleMouseup   = function (event) {
  var self          = this;
  this.mousedown    = false;
  this.removalQueue.forEach(function (element) { self.fadeInComplete(element); });
  this.removalQueue = [];
};

/**
 * Creates the ripple container element
 *
 * @returns {*}
 */
InkRippleServiceController.prototype.createContainer = function () {
  var container = angular.element('<div class="md-ripple-container"></div>');
  this.element.append(container);
  return container;
};

/**
 * Creates a new ripple and adds it to the container.  Also tracks ripple in `this.ripples`.
 *
 * @param left
 * @param top
 */
InkRippleServiceController.prototype.createRipple    = function (left, top) {
  var ripple = angular.element('<div class="md-ripple"></div>');
  var width  = this.element.prop('offsetWidth');
  var height = this.element.prop('offsetHeight');
  var x      = Math.max(Math.abs(width - left), left) * 2;
  var y      = Math.max(Math.abs(height - top), top) * 2;
  var size   = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  // TODO: Utilize `toCss` method from `animate.js` once it's in master
  ripple.css({
    left:       left + 'px',
    top:        top + 'px',
    background: 'black',
    width:      size + 'px',
    height:     size + 'px'
  });
  this.container.append(ripple);
  this.ripples.push(ripple);
  this.$animateCss(ripple, {
    from:     { opacity: 0, transform: 'translate(-50%, -50%) scale(0)' },
    to:       { opacity: 0.24, transform: 'translate(-50%, -50%) scale(1)' },
    duration: 0.65
  }).start().then(angular.bind(this, this.fadeInComplete, ripple));
};

/**
 * Either kicks off the fade-out animation or queues the element for removal on mouseup
 *
 * @param ripple
 */
InkRippleServiceController.prototype.fadeInComplete  = function (ripple) {
  if (this.mousedown && this.ripples.length === 1) {
    this.removalQueue.push(ripple);
  } else {
    this.ripples.splice(this.ripples.indexOf(ripple), 1);
    this.$animateCss(ripple, {
      to:       { opacity: 0 },
      duration: 0.65
    }).start().then(angular.bind(this, this.fadeOutComplete, ripple));
  }
};

/**
 * Removes the provided ripple from the DOM
 *
 * @param ripple
 */
InkRippleServiceController.prototype.fadeOutComplete = function (ripple) { ripple.remove(); };

/**
 * Used to create an empty directive.  This is used to track flag-directives whose children may have
 * functionality based on them.
 *
 * Example: `md-no-ink` will potentially be used by all child directives.
 */
function attrNoDirective () {
  return { controller: angular.noop };
}
