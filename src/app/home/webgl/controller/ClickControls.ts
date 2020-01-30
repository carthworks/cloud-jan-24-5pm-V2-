import { EventDispatcher } from "three-full/sources/core/EventDispatcher.js";
import { Raycaster } from "three-full/sources/core/Raycaster.js";
import { Vector2 } from "three-full/sources/math/Vector2.js";
import { Camera } from "three-full/sources/cameras/Camera.js";

var ClickControls = function(_targets, _camera, _domElement) {
  var scope = this;

  this._targets = _targets;

  var _raycaster = new Raycaster();

  _raycaster.params.Points.threshold = 0.5;

  var _mouse = new Vector2();

  var _selected = null,
    _hovered = null;

  var state;
  //
  this.updateTargets = function(targets) {
    scope._targets = targets;
  };
  function activate() {
    _domElement.addEventListener("mousemove", onDocumentMouseMove, false);
    _domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    _domElement.addEventListener("touchstart", onDocumentTouchStart, false);
  //  _domElement.addEventListener("touchend", onDocumentTouchEnd, false);
  }

  function deactivate() {
    _domElement.removeEventListener("mousemove", onDocumentMouseMove, false);
    _domElement.removeEventListener("mousedown", onDocumentMouseDown, false);
    _domElement.removeEventListener("touchstart", onDocumentTouchStart, false);
  //  _domElement.removeEventListener("touchend", onDocumentTouchEnd, false);
  }

  function dispose() {
    deactivate();
  }

  this.removeEvent = function removeEvent() {
    deactivate();
  };
  this.addEvent = function addEvent() {
    activate();
  };

  function onDocumentMouseMove(event) {
    event.preventDefault();
    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    var intersects = _raycaster.intersectObjects(scope._targets);

    if (intersects.length > 0) {
      var object = intersects[0].object;

      if (_hovered !== object) {
        scope.dispatchEvent({ type: "hover", object: object, event });
        _domElement.style.cursor = "pointer";
        _hovered = object;
      }
    } else {
      if (_hovered !== null) {
        scope.dispatchEvent({ type: "hoverend", object: _hovered, event });
        _domElement.style.cursor = "auto";
        _hovered = null;
      }
    }
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();

    _raycaster.setFromCamera(_mouse, _camera);

    let intersects = _raycaster.intersectObjects(scope._targets);
    if (intersects.length > 0) {
      _selected = intersects[0].object;

      _domElement.style.cursor = "pointer";

      scope.dispatchEvent({ type: "click", object: _selected, event });
    } else if (intersects.length == 0) {
      scope.dispatchEvent({ type: "clickend", object: _selected, event });
      _domElement.style.cursor = "auto";
    }
  }

  // Touch Evnet Handlers
  function onDocumentTouchStart(event) {
    event.preventDefault();
    event = event.changedTouches[0];

    // Appending touch type forcely for usage
    event.type = 'touch';

    let rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    const intersects = _raycaster.intersectObjects(scope._targets);

    // console.log(intersects.length);

    if (intersects.length > 0) {
      _selected = intersects[0].object;

      _domElement.style.cursor = "pointer";

      scope.dispatchEvent({ type: "click", object: _selected, event });
    }
    else{
        scope.dispatchEvent({ type: "clickend", object: _selected, event });
    }
  }

//   function onDocumentTouchEnd(event) {
//     event.preventDefault();

//     if (_selected) {
//       scope.dispatchEvent({ type: "clickend", object: _selected, event });

//       _selected = null;
//     }

//     _domElement.style.cursor = "auto";
//   }

  activate();

  // API

  this.enabled = true;

  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;
};

ClickControls.prototype = Object.create(EventDispatcher.prototype);
ClickControls.prototype.constructor = ClickControls;

export { ClickControls };
