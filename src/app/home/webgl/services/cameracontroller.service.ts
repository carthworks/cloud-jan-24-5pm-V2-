import { Injectable } from "@angular/core";
import * as THREE from "three";
import * as TWEEN from "tween.js/src/Tween.js";
import { Subject, Observable } from "rxjs";
import { OrbitControls } from "../controller/OrbitControls";
import { ClickControls } from "../controller/ClickControls";

export enum MouseState {
  hower = 0,
  click = 1
}
@Injectable()
export class CameracontrollerService {
  private camera: THREE.PerspectiveCamera;
  private orbitController: any;
  private clickController: any;

  private MouseEvent = new Subject<any>();

  constructor() {}

  public initCamera(param) {
    var camera_Pos = param.hasOwnProperty("camera_Pos")
      ? param["camera_Pos"]
      : new THREE.Vector3(0, 0, 10);
    var camera_Target = param.hasOwnProperty("camera_Target")
      ? param["camera_Target"]
      : new THREE.Vector3(0, 0, 0);
    var camera_Aspect = param.hasOwnProperty("camera_Aspect")
      ? param["camera_Aspect"]
      : 0;
    var camera_Fov = param.hasOwnProperty("camera_Fov")
      ? param["camera_Fov"]
      : 45;
    var camera_Near = param.hasOwnProperty("camera_Near")
      ? param["camera_Near"]
      : 0.1;
    var camera_Far = param.hasOwnProperty("camera_Far")
      ? param["camera_Far"]
      : 10000;
    var orbitConttroller_minDistance = param.hasOwnProperty(
      "orbitConttroller_minDistance"
    )
      ? param["orbitConttroller_minDistance"]
      : 0;
    var orbitController_maxDistance = param.hasOwnProperty(
      "orbitController_maxDistance"
    )
      ? param["orbitController_maxDistance"]
      : 7;
    var orbitController_panEnable = param.hasOwnProperty(
      "orbitController_panEnable"
    )
      ? param["orbitController_panEnable"]
      : true;
    var orbitController_Rotate = param.hasOwnProperty("orbitController_Rotate")
      ? param["orbitController_Rotate"]
      : true;
    var domElement = param["domElement"];

    this.camera = new THREE.PerspectiveCamera(
      camera_Fov,
      camera_Aspect,
      camera_Near,
      camera_Far
    );
    this.camera.position.set(camera_Pos.x, camera_Pos.y, camera_Pos.z);
    //this.camera.lookAt(camera_Target.x, camera_Target.y, camera_Target.z);
    this.initOrbitController(
      this.camera,
      orbitConttroller_minDistance,
      orbitController_maxDistance,
      orbitController_panEnable,
      orbitController_Rotate,
      domElement
    );
    var result = {
      camera: this.camera,
      orbitController: this.orbitController
    };

    return result;
  }

  public GetMouseEvent(): Observable<any[]> {
    return this.MouseEvent.asObservable();
  }

  private initOrbitController(
    camera,
    minDistance,
    maxDistance,
    panEnable,
    rotateEnable,
    domElement
  ) {
    this.orbitController = new OrbitControls(this.camera, domElement);
    this.orbitController.minDistance = minDistance;
    this.orbitController.maxDistance = maxDistance;
    this.orbitController.enablePan = panEnable;
    this.orbitController.enableRotate = rotateEnable;
  }

  public initClickController(target, camera, canvas) {
    this.clickController = new ClickControls(target, camera, canvas);
    return this.clickController;
  }

  public activateListener() {
    this.clickController.addEventListener(
      "click",
      function(event) {
        this.clicked(event);
      }.bind(this)
    );
    this.clickController.addEventListener(
      "clickend",
      function(event) {
        this.clickend(event);
      }.bind(this)
    );
    this.clickController.addEventListener(
      "hover",
      function(event) {
        this.hover(event);
      }.bind(this)
    );
    this.clickController.addEventListener(
      "hoverend",
      function(event) {
        this.hoverend(event);
      }.bind(this)
    );
  }

  public deactivateListener() {
    this.clickController.removeEventListener("click", this.clicked);
    this.clickController.removeEventListener("clickend", this.clickend);
    this.clickController.removeEventListener("hover", this.hover);
    this.clickController.removeEventListener("hoverend", this.hoverend);
  }

  public resize(renderer, ctx) {
    this.camera.aspect = ctx.clientWidth / ctx.clientHeight;
    this.camera.updateProjectionMatrix();
    renderer.setSize(ctx.clientWidth, ctx.clientHeight);
  }
  private clickend(_event) {
    var resp = {
      node: _event.object,
      type: _event.type,
      event: _event.event
    };
    this.MouseEvent.next(resp);
  }
  private clicked(_event) {
    var resp = {
      node: _event.object,
      type: _event.type,
      event: _event.event
    };
    this.MouseEvent.next(resp);
  }

  private hover(_event) {
    var resp = {
      node: _event.object,
      type: _event.type,
      event: _event.event
    };
    this.MouseEvent.next(resp);
  }

  private hoverend(_event) {
    var resp = {
      node: _event.object,
      type: _event.type,
      event: _event.event
    };
    this.MouseEvent.next(resp);
  }

  public refreshCamera(controller) {
    var refreshtween = new TWEEN.Tween(this.camera.position)
      .to(
        {
          x: 0,
          y: -5,
          z: 6
        },
        500
      )
      .easing(TWEEN.Easing.Cubic.Out)
      .start()
      .onComplete(
        function() {
          controller.target = new THREE.Vector3(0, 0, 0);
          this.camera.rotation.set(0, 0, 0);
        }.bind(this)
      );
  }
  public panCamera(target, controller) {
    //controller.target = new THREE.Vector3(target.position.x, target.position.y, target.position.z);
    //this.camera.lookAt(new THREE.Vector3(target.position.x, target.position.y, target.position.z))
    //var distance = this.camera.position.distanceTo(target.position);
    //var direction = this.camera.getWorldDirection();
    var pantween = new TWEEN.Tween(this.camera.position)
      .to(
        {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z + 0.1
        },
        1000
      )
      .start();
  }
  public startTween(param = [], duration, particleSystem) {
    var tweenParticles = new TWEEN.Tween(particleSystem.position)
      .to(param[1], duration)
      .start()
      .onComplete(
        function() {
          param.splice(1, 0, param.splice(0, 1)[0]);
          this.startTween();
        }.bind(this)
      );
  }
  public requestCameraController() {
    return this.orbitController;
  }
  public update() {
    this.orbitController.update();
  }
  public resetOrbitController() {
    this.orbitController.reset();
  }
  public updateTarget(targets) {
    this.clickController.updateTargets(targets);
  }
}
