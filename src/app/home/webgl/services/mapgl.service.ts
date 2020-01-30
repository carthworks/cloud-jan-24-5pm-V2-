import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { List } from 'linqts';
import { CameracontrollerService } from './cameracontroller.service';
import { UtilityService } from './utility.service';
import { TextureID } from 'src/app/home/models/TextureID';
import { Node } from 'src/app/home/models/node';
import { GPUParticleSystem } from '../shaders/GPUParticleSystem';
import { AnomalyEventShader } from '../shaders/AnomalyEventShader';
import { AnomalyShader } from '../shaders/AnomalyShader';
import { pingPong } from '../../models/pingPong';
import { TopologyNodeShader } from '../../alldevices/shaders/TopologyNodeShader';
import { LineConnectionShader } from '../shaders/LineConnectionShader';




@Injectable()

/**
 * MapGL allow you to set up webgl renderer for a given canvas, what and where is to be rendered by three.js.
 * This is where you create objects, lights and cameras.
 */
export class MapGL {
  constructor(private cameracontrollerService: CameracontrollerService, private utilityService: UtilityService) { }

  private canvas_Ctx;
  public scene;
  private camera;
  private renderer;
  private mapTerrain;
  private textureTypes = [];
  private textureID = new TextureID();
  public selectedDevice: any;

  private clock: THREE.Clock = new THREE.Clock();
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private mapGLViewList: any = new List<any>();
  private anomalyPointsList: any = new List<any>();
  private anomalySummeryList: any = new List<any>();
  private anomalyEventLogList: any = new List<any>();
  private uTime = 0;
  private positions = new Float32Array(10 * 3);
  private sizes = new Float32Array(10);
  private lineBuffer: any;
  private canAnimate: boolean = false;
  private lastCameraPosition: THREE.Vector3;
  private ping_Pong;

  /**
   * @param param Canvas ELement Id to be used by webgl render,
   * Creates MapGL used to view world terrain on plane
   */
  public InitGl(param) {

    var canvas: any = document.getElementById(param);
    if (canvas) {
      canvas.getContext('webgl') != null ? this.canvas_Ctx = canvas.getContext('webgl').canvas : alert('Browser Doestnt Support WebGL');
    } else {
      //console.log(param + ' ' + 'Element not found');
      return this.CreateCanvas(param);
    }
    if (this.canvas_Ctx) {

      this.scene = new THREE.Scene();
      this.mapGLViewList.Add(this.scene);
      this.scene.name = param;
      this.scene.background = new THREE.Color(0x000000);
      this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas: this.canvas_Ctx });
      this.renderer.setSize(this.canvas_Ctx.clientWidth, this.canvas_Ctx.clientHeight, true);
      this.mapGLViewList.Add(this.renderer);
      this.clock = new THREE.Clock();
      /*
      * Returns THREEJS Persceptive Camera and Orbit Controller
      */
      const camera_param = {
        camera_Pos: new THREE.Vector3(-4, 0, 10),
        camera_Target: new THREE.Vector3(0, 0, 0),
        camera_Aspect: this.canvas_Ctx.clientWidth / this.canvas_Ctx.clientHeight,
        camera_Fov: 40,
        camera_Near: 0.1,
        camera_Far: 1000,
        orbitConttroller_minDistance: 0.5,
        orbitController_maxDistance: 30,
        orbitController_panEnable: true,
        orbitController_Rotate: false,
        domElement: this.canvas_Ctx
      };
      let result = this.cameracontrollerService.initCamera(camera_param);
      this.camera = result['camera'];
      this.mapGLViewList.Add(this.camera);
      this.scene.add(this.camera);
      this.cameracontrollerService.initClickController([], this.camera, this.canvas_Ctx);
      this.cameracontrollerService.deactivateListener();
      this.cameracontrollerService.activateListener();
      this.camera.position.set(0, 0, 10);
      this.camera.lookAt(this.camera.position.x, this.camera.position.y, this.camera.position.z);
      this.cameracontrollerService.requestCameraController().target = new THREE.Vector3(this.camera.position.x, 0, 0);
      this.cameracontrollerService.update();
      this.camera.updateProjectionMatrix();
      this.lastCameraPosition = this.camera.position;
      this.cameracontrollerService.requestCameraController().enableKeys = false;
      if (param == "anomaly") {
        this.GenerateMap(this.textureLoader.load('assets/img/maporg.png'), 0, 0.9);
      }
    }
    // this.selectedDevice.texture_type = "potential_attacker";
    // this.selectedDevice.mac_address = 0;
    // this.selectedDevice.ipaddress = 0;
  }

  public DrawImage() {
    this.textureTypes = [

      this.textureLoader.load('assets/online.png'),

      this.textureLoader.load('assets/offline.png'),

      this.textureLoader.load('assets/cloud_online.png'),

      this.textureLoader.load('assets/cloud_offline.png'),

      this.textureLoader.load('assets/router.png'),

      this.textureLoader.load('assets/subnet.png'),

      this.textureLoader.load('assets/nodes.png'),

      this.textureLoader.load('assets/BlackList.png'), //7

      this.textureLoader.load('assets/Vulnerable_State.png'), //8

      this.textureLoader.load('assets/device_type/laptop.png'), //9

      this.textureLoader.load('assets/device_type/iot.png'), //10

      this.textureLoader.load('assets/device_type/printer.png'), //11

      this.textureLoader.load('assets/device_type/router.png'), //12

      this.textureLoader.load('assets/device_type/thermostat.png'), //13

      this.textureLoader.load('assets/device_type/bulb.png'), //14

      this.textureLoader.load('assets/device_type/mobile.png'), //15

      this.textureLoader.load('assets/device_type/accesspoint.png'), //16

      this.textureLoader.load('assets/device_type/camera.png'), //17

      this.textureLoader.load('assets/device_type/nas.png'), //18

      this.textureLoader.load('assets/device_type/ipad.png'), //19

      this.textureLoader.load('assets/device_type/desktop.png'), //19
      // this.textureLoader.load('assets/potential_victim.png'),
      // this.textureLoader.load('assets/potential_attacker_Victim.png'),

      // this.textureLoader.load('assets/bot.png'),

      // this.textureLoader.load('assets/noPotential_attacker.png'),
      // this.textureLoader.load('assets/noPotential_victim.png'),
      // this.textureLoader.load('assets/noPotential_attacker_victim.png'),

      // this.textureLoader.load('assets/normal_online.png'),
      // this.textureLoader.load('assets/normal_offline.png'),
      // this.textureLoader.load('assets/anomaly_highlight.png')
    ];
  }

  private fitToContainer(canvas) {
    // Make it visually fill the positioned parent
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // ...then set the internal size to match
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  /**
   * @param param Canvas Id to be created
   */
  private CreateCanvas(param) {
    this.canvas_Ctx = document.createElement('canvas');
    this.canvas_Ctx.id = param;
    document.body.appendChild(this.canvas_Ctx);
    document.getElementById(param).appendChild(this.canvas_Ctx);
    // console.log('Created Canvas with element id' + param + ' ');
  }

  /**
    * Creates a mapPlane with given texture and depth
    * @param texture texture to drawn on plane
    * @param depth depth to be created from camera
    * @param light intensity of spotlight to be added in scene
    */
  public GenerateMap = function (texture, depth, light) {
    var planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
    var materrial = new THREE.MeshBasicMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mapTerrain = new THREE.Mesh(planeGeo, materrial);
    this.mapTerrain.name = 'Terrain';
    this.mapGLViewList.Add(this.mapTerrain);
    this.mapTerrain.receiveShadow = true;
    this.mapTerrain.scale.set(this.utilityService.visibleWidthAtZDepth(depth, this.camera, this.canvas_Ctx.clientWidth, this.canvas_Ctx.height), this.utilityService.visibleHeightAtZDepth(depth, this.camera), 1);
    // this.spotLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    // this.mapGLViewList.Add(this.spotLight);
    // this.spotLight.position.set(0, 0, 1);
    this.scene.add(this.mapTerrain);

  }

  /**
   * Draw Anomaly Points in map using GLSL_POINTS
   *
   * @param param Device list information => param = { Macaddress: "",
   *                                                   ThreatType: "immediate,nopotential,normal",
   *                                                   EventType: "victim,attacker"
   * @param location Location: <Vector2>"Lat,Long of subnet to fill anomaly devices crowded" }
   * @param anomalySize Size to be occupied by sprite in area => (1.0 to 50.0 At zero depth level).
   */
  public DrawAnamoly = function (param: Node[], location: THREE.Vector2, anomalySize: number) {
    this.DestroyObject(THREE.Points);
    var nodeSize = anomalySize;
    var nodeStructure = this.utilityService.MatrixSet(new THREE.Vector3(location.x, location.y, 0), 1.0, param.length).ToArray();
    for (var i = 0; i < param.length; i++) {
      let textureid = this.textureID.ID[param[i].texture_type];
      var tex = this.textureTypes[textureid];
      tex.flipY = false;
      var geometry = new THREE.Geometry();
      var locatioPosition: THREE.Vector3 = this.utilityService.locateGeoLocationInPlane(nodeStructure[i].x, nodeStructure[i].y, this.mapTerrain.scale.x, this.mapTerrain.scale.y);
      geometry.vertices.push(locatioPosition);
      var material = new THREE.ShaderMaterial({
        vertexShader: AnomalyShader.vertexShader,
        fragmentShader: AnomalyShader.fragmentShader,
        uniforms: {
          'status': { type: 'f', value: 0.1 },
          'normalTexture': { type: 't', value: tex },
          'nodePos': { type: 'v3', value: new THREE.Vector3(locatioPosition.x, locatioPosition.y, locatioPosition.z) },
          'nodeSize': { type: 'f', value: nodeSize },
        },
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false,
      });
      material.needsUpdate = true;
      var node = new THREE.Points(geometry, material);
      node.name = param[i].mac_address;
      node.userData = {
        'textureTypes': textureid,
        'location': locatioPosition,
        'nature': param[i].anomaly_nature,
        'status': param[i].anomaly_status,
      }
      this.anomalyPointsList.Add(node);
      this.scene.add(node);
    }

    this.cameracontrollerService.updateTarget(this.anomalyPointsList.Where(x => x.type === 'Points').ToArray());
  }

  /**
   * HighLights Selected Anomaly // Internal Call
   * @param param Callback Event for Listeners with Selected Anomaly MacAddress in map
   */
  public HighlightAnomaly(param) {
    this.DeselectAnomaly(param);
    var obj = this.anomalyPointsList.Where(x => x.type === 'Points');
    obj.Where(x => x.name !== param ? x.material.uniforms.normalTexture.value = this.textureTypes[8] : '');
  }

  /**
  * Reset Highlighted Anomaly //Internal Call
  * @param param Callback Event for Listeners with Selected Anomaly MacAddress in map
  */
  public DeselectAnomaly(param) {
    var obj = this.anomalyPointsList.Where(x => x.type === 'Points');
    obj.Where(x => x.material.uniforms.normalTexture.value = this.textureTypes[x.userData['textureTypes']]);
  }

  public GetAnomalyRecord(device_Mac) {
    let obj = this.anomalyPointsList.Where(x => x.type === 'Points');
    return obj.First(x => x.name === device_Mac);
  }

  public ChangeMapVisiblity(state: boolean) {
    var obj = this.mapGLViewList.Where(x => x.name === 'Terrain');
    let points = this.anomalyPointsList.Where(x => x.type === 'Points');
    if (state) {
      obj.visible = state;
      points.Where(x => x.visible = state);
    }
    else {
      obj.visible = state;
      points.Where(x => x.visible = state);
    }
  }
  public SwitchtoPopUp() {
    this.camera.position.set(0, 4, 20);
    this.cameracontrollerService.requestCameraController().target = new THREE.Vector3(this.camera.position.x, this.camera.position.y, 0);
    this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
    this.camera.updateProjectionMatrix();

    this.scene.background = new THREE.Color(0x000000);

    this.lastCameraPosition = this.camera.position;
    this.cameracontrollerService.requestCameraController().enabled = true;
  }

  public CheckBlackListIP(list, ip) {
    return list.includes(ip)

  }

  public CHeckVulnerable(list, ip) {
    return list.includes(ip);
  }

  public updatedeviceTexture(type) {
    if (this.selectedDevice) {
      let selectedNodetextureid = this.textureID.DeviceTypeID[
        type.toLowerCase()
      ];
      var tex;
      if (!selectedNodetextureid || selectedNodetextureid == undefined) {
        tex = this.textureTypes[10];
      } else {
        tex = this.textureTypes[selectedNodetextureid];
      }
      tex.flipY = false;
      this.selectedDevice.material.uniforms.normalTexture.value = tex;
    }
  }
  public populateConnectedDevices(nodes, blackLists, vulnarableList, selectedNode, protoIndex: number[]) {


    var nodeSize = 400.0;
    let selectedNodeGeometry = new THREE.Geometry();
    let selectedNodePos = new THREE.Vector3(0, -2, 0);
    selectedNodeGeometry.vertices.push(selectedNodePos);

    let selectedNodetextureid = this.textureID.DeviceTypeID[selectedNode.texture_type.toLowerCase()];
    // console.log(selectedNode.texture_type.toLowerCase());
    var tex;
    if (!selectedNodetextureid || selectedNodetextureid == undefined) {
      tex = this.textureTypes[10];
    }
    else {
      tex = this.textureTypes[selectedNodetextureid];
    }
    tex.flipY = false;
    let selectedNodeMaterial = new THREE.ShaderMaterial({
      vertexShader: AnomalyShader.vertexShader,
      fragmentShader: AnomalyShader.fragmentShader,
      uniforms: {
        'status': { type: 'f', value: 0.1 },
        'normalTexture': { type: 't', value: tex },
        'nodePos': { type: 'v3', value: new THREE.Vector3(selectedNodePos.x, selectedNodePos.y, selectedNodePos.z) },
        'nodeSize': { type: 'f', value: 1000 },
      },
      blending: THREE.AdditiveBlending,
      transparent: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });
    selectedNodeMaterial.needsUpdate = true;
    this.selectedDevice = new THREE.Points(selectedNodeGeometry, selectedNodeMaterial);
    this.selectedDevice.userData = {
      'source': true,
      'location': selectedNodePos,
      'type': "host"
    }
    this.anomalySummeryList.Add(this.selectedDevice);
    this.scene.add(this.selectedDevice);

    var nodeStructure = this.utilityService.FormSemiCircle(2, nodes.length).ToArray();
    for (var i = 0; i < nodes.length; i++) {
      let geometry = new THREE.Geometry();
      let nodePos = nodeStructure[i]//new THREE.Vector3(i % 2 == 0 ? 0.2 : 0.4, 2 - (i / 2), 0);
      geometry.vertices.push(nodePos);
      let tex;
      if (this.CHeckVulnerable(vulnarableList, nodes[i].ipaddress)) {
        tex = this.textureTypes[8]
      }
      else {
        if (this.CheckBlackListIP(blackLists, nodes[i].ipaddress)) {
          tex = this.textureTypes[7];
        }
        else {
          tex = this.textureTypes[6];
        }
      }
      tex.flipY = false;
      //let normalisez = this.utilityService.normalize(protoIndex[i],protoIndex[0],protoIndex[protoIndex.length-1]);
      var material = new THREE.ShaderMaterial({
        vertexShader: TopologyNodeShader.vertexShader,
        fragmentShader: TopologyNodeShader.fragmentShader,
        uniforms: {
          //'color': { type: 'f', value: blackList == true ?  new THREE.Vector3(1.0,1.0,1.0) : new THREE.Vector3(1.0,this.utilityService.normalisation(normalisez,0,1, 0.2, 0.7),0)},//Update RGB --> G 1.0 yellow; 0.0 red;
          'color': { type: 'f', value: new THREE.Vector3(1.0, 1.0, 1.0) },
          'normalTexture': { type: 't', value: tex },
          'nodePos': { type: 'v3', value: new THREE.Vector3(nodePos.x, nodePos.y, nodePos.z) },
          'nodeSize': { type: 'f', value: nodeSize },
        },
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      material.needsUpdate = true;
      let gl_nodes = new THREE.Points(geometry, material);
      gl_nodes.userData = {
        'source': false,
        'location': nodePos,
        'type': "device",
        'id': nodes[i].id,
        'ip': nodes[i].ipaddress,
        'bytesTransfered': nodes[i].bytesTransfered
      }
      gl_nodes.name = nodes[i].mac_address;
      this.anomalySummeryList.Add(gl_nodes);
      this.scene.add(gl_nodes);
    }
    this.cameracontrollerService.updateTarget(this.anomalySummeryList.Where(x => x.userData['type'] != 'host').ToArray());

  }

  public SwitchToEventLog() {
    //this.cameracontrollerService.resetOrbitController();


    //this.cameracontrollerService.update();
    this.camera.position.set(0, 0, 15);
    this.cameracontrollerService.requestCameraController().target = new THREE.Vector3(this.camera.position.x, this.camera.position.y, 0);
    this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
    this.camera.updateProjectionMatrix();

    this.scene.background = new THREE.Color(0x000000);

    this.lastCameraPosition = this.camera.position;
    this.cameracontrollerService.requestCameraController().enabled = true;

    //this.cameracontrollerService.requestCameraController().enabled = false;

  }

  public SwitchToEventLogDetails() {
    this.camera.position.set(0, 0, 15);
    this.cameracontrollerService.requestCameraController().target = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    //this.cameracontrollerService.requestCameraController().target = new THREE.Vector3(-4, -2, 0);
    //this.camera.updateProjectionMatrix();
    // this.cameracontrollerService.update();
    // this.camera.updateProjectionMatrix();
    this.cameracontrollerService.requestCameraController().enabled = false;
    var obj = this.anomalySummeryList.Where(x => x.type === 'Points');
    obj.Where(x => x.visible = false);

    //var arrow = this.anomalySummeryList.First(x => x.type === 'Object3D');
    // arrow.visible = false;

    var nodeSize = 500.0;
    let selectedNodeGeometry = new THREE.Geometry();
    let selectedNodePos = new THREE.Vector3(-2, 4, 0);
    selectedNodeGeometry.vertices.push(selectedNodePos);
    let selectedNodetextureid = this.textureID.ID[this.selectedDevice.texture_type];
    let tex = this.textureTypes[selectedNodetextureid]
    tex.flipY = false;
    let selectedNodeMaterial = new THREE.ShaderMaterial({
      vertexShader: AnomalyEventShader.vertexShader,
      fragmentShader: AnomalyEventShader.fragmentShader,
      uniforms: {
        'status': { type: 'f', value: 0.2 },
        'normalTexture': { type: 't', value: tex },
        'nodePos': { type: 'v3', value: new THREE.Vector3(selectedNodePos.x, selectedNodePos.y, selectedNodePos.z) },
        'nodeSize': { type: 'f', value: nodeSize },
      },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      side: THREE.DoubleSide,
    });
    selectedNodeMaterial.needsUpdate = true;
    let selectedDevice = new THREE.Points(selectedNodeGeometry, selectedNodeMaterial);
    selectedDevice.userData = {
      'location': selectedNodePos,
    }
    this.scene.add(selectedDevice);
    this.anomalyEventLogList.Add(selectedDevice);

    let geometry = new THREE.Geometry();
    let nodePos = new THREE.Vector3(4, 4, 0);
    geometry.vertices.push(selectedNodePos);
    let tex1 = this.textureTypes[9]
    tex.flipY = false;
    var material = new THREE.ShaderMaterial({
      vertexShader: AnomalyEventShader.vertexShader,
      fragmentShader: AnomalyEventShader.fragmentShader,
      uniforms: {
        'status': { type: 'f', value: 0.2 },
        'normalTexture': { type: 't', value: tex1 },
        'nodePos': { type: 'v3', value: new THREE.Vector3(nodePos.x, nodePos.y, nodePos.z) },
        'nodeSize': { type: 'f', value: nodeSize },
      },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      side: THREE.DoubleSide,
    });
    material.needsUpdate = true;
    let nodes = new THREE.Points(geometry, material);
    nodes.userData = {
      'location': nodePos,
    }
    this.anomalyEventLogList.Add(nodes);
    this.scene.add(nodes);

    this.DrawLine(this.anomalyEventLogList.ToArray());

    // var dir = new THREE.Vector3(1, 0, 0);
    // //normalize the direction vector (convert to vector of length 1)
    // dir.normalize();
    // var origin = new THREE.Vector3(-4, 2, 0);
    // var length = origin.distanceTo(dir);
    // var hex = 0xdd6e1f;

    // var flowDirection = new THREE.ArrowHelper(dir, origin, 1, hex);
    // //this.scene.add(flowDirection);
    // this.anomalyEventLogList.Add(flowDirection);

    //this.PacketReplay(pingPong.ping);
  }
  public EventLogDetailsOff() {
    this.camera.position.set(0, 0, 15);
    this.cameracontrollerService.requestCameraController().target = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.uTime = 0;
    this.canAnimate = false;
    var _obj = this.anomalySummeryList.Where(x => x.type === 'Points');
    _obj.Where(x => x.visible = true);
    this.cameracontrollerService.requestCameraController().enabled = true;
    // var arrow = this.anomalySummeryList.First(x => x.type === 'Object3D');
    // arrow.visible = true;

    var obj: any[] = this.anomalyEventLogList.ToArray();
    let length = obj.length;
    for (var i = 0; i < length; i++) {
      if (obj[i].type == "Points") {
        obj[i].geometry.dispose();
        obj[i].material.dispose();
      }
      this.scene.remove(obj[i]);
    }
    obj = null;
    this.anomalyEventLogList = new List<any>();
  }
  public GetEventLogNodesData(param: any) {
    this.GenerateEventLogNode(param);
    //this.GenerateDirectionalGeometry();
  }

  public GenerateDirectionalGeometry() {
    var dir = new THREE.Vector3(1, 0, 0);
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();
    var origin = new THREE.Vector3(-1.9, 1.5, 0);
    var length = origin.distanceTo(dir);
    var hex = 0xdd6e1f;

    var flowDirection = new THREE.ArrowHelper(dir, origin, 1, hex);
    //this.scene.add(flowDirection);
    this.anomalySummeryList.Add(flowDirection);
  }

  private GenerateEventLogNode(param: any) {
    // var nodeSize = 500.0;
    // let selectedNodeGeometry = new THREE.Geometry();
    // let selectedNodePos = new THREE.Vector3(2, 0, 0);
    // selectedNodeGeometry.vertices.push(selectedNodePos);
    // let selectedNodetextureid = this.textureID.ID[this.selectedDevice.texture_type];
    // let tex = this.textureTypes[selectedNodetextureid]
    // tex.flipY = false;
    // let selectedNodeMaterial = new THREE.ShaderMaterial({
    //   vertexShader: AnomalyEventShader.vertexShader,
    //   fragmentShader: AnomalyEventShader.fragmentShader,
    //   uniforms: {
    //     'status': { type: 'f', value: 0.2 },
    //     'normalTexture': { type: 't', value: tex },
    //     'nodePos': { type: 'v3', value: new THREE.Vector3(selectedNodePos.x, selectedNodePos.y, selectedNodePos.z) },
    //     'nodeSize': { type: 'f', value: nodeSize },
    //   },
    //   blending: THREE.AdditiveBlending,
    //   transparent: false,
    //   depthTest: false,
    //   side: THREE.DoubleSide,
    // });
    // selectedNodeMaterial.needsUpdate = true;
    // let selectedDevice = new THREE.Points(selectedNodeGeometry, selectedNodeMaterial);
    // selectedDevice.userData = {
    //   'source': true,
    //   'location': selectedNodePos
    // }
    // //selectedDevice.name = this.selectedDevice.mac_address;
    // this.anomalySummeryList.Add(selectedDevice);
    // this.scene.add(selectedDevice);
    // var nodeStructure = this.utilityService.FormSemiCircle(new THREE.Vector3(2, 0.5, 0), 0.8, param.length).ToArray();
    // for (var i = 0; i < param.length; i++) {
    //   let geometry = new THREE.Geometry();
    //   let nodePos = nodeStructure[i]//new THREE.Vector3(i % 2 == 0 ? 0.2 : 0.4, 2 - (i / 2), 0);
    //   geometry.vertices.push(selectedNodePos);
    //   let tex = this.textureTypes[9]
    //   tex.flipY = false;
    //   var material = new THREE.ShaderMaterial({
    //     vertexShader: AnomalyEventShader.vertexShader,
    //     fragmentShader: AnomalyEventShader.fragmentShader,
    //     uniforms: {
    //       'status': { type: 'f', value: 0.1 },
    //       'normalTexture': { type: 't', value: tex },
    //       'nodePos': { type: 'v3', value: new THREE.Vector3(nodePos.x, nodePos.y, nodePos.z) },
    //       'nodeSize': { type: 'f', value: nodeSize },
    //     },
    //     blending: THREE.AdditiveBlending,
    //     transparent: true,
    //     depthTest: false,
    //     side: THREE.DoubleSide,
    //   });
    //   material.needsUpdate = true;
    //   let nodes = new THREE.Points(geometry, material);
    //   nodes.userData = {
    //     'source': false,
    //     'location': nodePos,
    //   }
    //   nodes.name = param[i].mac_address;
    //   this.anomalySummeryList.Add(nodes);
    //   this.scene.add(nodes);
    // }
  }

  public HighlightAttacker_Victim(mac_address) {
    this.De_HighlightAttacker_Victim();
    var obj = this.anomalySummeryList.Where(x => x.type === 'Points');
    var node = obj.First(x => x.name === mac_address);
    node.material.uniforms.status.value = 0.2;
    //this.HighlightDirection(node);
  }

  public HighlightDirection(node) {
    var arrow = this.anomalySummeryList.First(x => x.type === 'Object3D');
    var origin: THREE.Vector3 = this.anomalySummeryList.ElementAt(0).userData["location"];
    var target: THREE.Vector3 = node.userData["location"].clone();
    var direction = target.sub(origin);
    arrow.setDirection(direction.normalize());
    arrow.setLength(direction.length());
  }

  public De_HighlightAttacker_Victim() {
    var obj = this.anomalySummeryList.Where(x => x.type === 'Points');
    var targetObj = obj.Where(x => x.userData["source"] === false);
    targetObj.Where(x => x.material.uniforms.status.value = 0.1);
  }
  public EventLogOff() {

    this.ChangeMapVisiblity(true);
    this.cameracontrollerService.requestCameraController().enabled = true;
    this.ResetEventLog();
    this.camera.position.set(this.lastCameraPosition.x, this.lastCameraPosition.y, this.lastCameraPosition.z);
    this.camera.updateProjectionMatrix();
    this.cameracontrollerService.update();

  }

  public ResetEventLog() {

    var obj: any[] = this.anomalySummeryList.ToArray();
    let length = obj.length;
    for (var i = 0; i < length; i++) {
      obj[i].geometry.dispose();
      obj[i].material.dispose();
      this.scene.remove(obj[i]);
    }
    this.anomalySummeryList = new List<any>();

  }

  /**
   * Call On each frame update to update scene
   */
  public Update() {

    if (this.renderer) {
      var delta = this.clock.getDelta();
      this.uTime += delta;
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * @param type Type of objects to be destroyed from scene
   */
  public DestroyObject = function (objectType) {

    switch (objectType) {

      case THREE.Points: {
        var obj: any[] = this.anomalyPointsList.ToArray();
        let length = obj.length;
        for (var i = 0; i < length; i++) {
          obj[i].hasOwnProperty('geometry') ? obj[i].geometry.dispose() : null;
          obj[i].hasOwnProperty('material') ? obj[i].material.dispose() : null;
          this.scene.remove(obj[i]);
        }
        this.anomalyPointsList = new List<any>();
        break;
      }
      case THREE.Mesh: {
        var obj: any[] = this.mapGLViewList.Where(x => x.type === 'Mesh').ToArray();
        let length = obj.length;
        for (var i = 0; i < length; i++) {
          obj[i].hasOwnProperty('geometry') ? obj[i].geometry.dispose() : null;
          obj[i].hasOwnProperty('material') ? obj[i].material.dispose() : null;
          this.scene.remove(obj[i]);
        }

        break;
      }
      case THREE.Line: {
        let obj: any[] = this.object3D_List.Where(x => x.type === 'Line').ToArray();
        let length = obj.length;
        for (let i = 0; i < length; i++) {
          obj[i].hasOwnProperty('geometry') ? obj[i].geometry.dispose() : null;
          obj[i].hasOwnProperty('material') ? obj[i].material.dispose() : null;
          this.scene.remove(obj[0]);
        }
        break;
      }
      case THREE.SpotLight: {
        let obj: any[] = this.object3D_List.Where(x => x.type === 'SpotLight').ToArray();
        let length = obj.length;
        for (let i = 0; i < length; i++) {
          obj[i].hasOwnProperty('geometry') ? obj[i].geometry.dispose() : null;
          obj[i].hasOwnProperty('material') ? obj[i].material.dispose() : null;
          this.scene.remove(obj[0]);
        }
        break;
      }
      case GPUParticleSystem: {
        // console.log('Cannot remove GPU Particle')
        // this.scene.remove(this.gpuParticleSystem);
      }
      default: {
        //  console.log('Invalid object type to distroy');
        break;
      }
    }
  }

  /**
   * Disposes Webgl Content from canvas element
   */
  public Dispose() {

    this.anomalySummeryList = new List<any>();
    this.mapGLViewList = new List<any>();
    this.anomalyPointsList = new List<any>();
    let length = this.scene.children.length;
    for (let i = 0; i < length; i++) {
      this.scene.children[0].hasOwnProperty('geometry') ? this.scene.children[0].geometry.dispose() : null;
      this.scene.children[0].hasOwnProperty('material') ? this.scene.children[0].material.dispose() : null;
      this.scene.remove(this.scene.children[0]);
    }
    this.renderer.forceContextLoss();
    this.renderer.context = null;
    this.renderer.domElement = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.canvas_Ctx = null;

  }
  /**
 * Resize Webgl Canvas Size
 */
  public WindowResize(event) {

    this.cameracontrollerService.resize(this.renderer, this.canvas_Ctx);
  }

  public DrawLine(param) {
    var geometry = new THREE.BufferGeometry();
    var color = 0.3;

    var attributes = this.GenerateLineAttributes(this.positions, this.sizes, param);
    this.positions = attributes['positions'];
    this.sizes = attributes['sizes'];

    geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    var shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: LineConnectionShader.vertexShader,
      fragmentShader: LineConnectionShader.fragmentShader,
      uniforms: {
        'packetSource': { type: 'f', value: color },
        'normalTexture': { type: 't', value: this.textureLoader.load('assets/new_circle.png') },
      },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
    });

    this.lineBuffer = new THREE.Points(geometry, shaderMaterial);
    this.lineBuffer.name = 'Packets';
    this.anomalyEventLogList.Add(this.lineBuffer);

    this.scene.add(this.lineBuffer);
  }
  /**
 *  Generate Points Position
 * @param positions Float32 Array for position atributes to save interpolation co-ordinates
 * @param sizes Float 32 Array for size attributes to save sizes of each points
 * @param param  Source Destination position
 */
  private GenerateLineAttributes(positions, sizes, param) {
    for (var i = 0; i < positions.length; i++) {
      positions[i * 3] = (this.utilityService.linerarInterPolation(param[0].userData['location'].x + 0.5, param[1].userData['location'].x, i / 10));
      positions[i * 3 + 1] = (this.utilityService.linerarInterPolation(param[0].userData['location'].y, param[1].userData['location'].y, i / 10));
      positions[i * 3 + 2] = 0;
    }
    for (var j = 0; j < sizes.length; j++) {
      sizes[j] = Math.sin(j / 0.1 + Math.PI) * 150.0;
      // sizes[i] = Math.sin(i / 10) * 300.0;
    }
    var attributes = {
      positions,
      sizes
    }
    return attributes;
  }
  public PacketReplay(packets) {
    this.canAnimate = true;
    this.lineBuffer.material.uniforms.packetSource.value = packets === pingPong.ping ? 0.3 : 0.9;
    this.ping_Pong = packets;
    this.uTime = 0;
    this.PlayAnimation();
  }
  private PlayAnimation() {
    // if (this.uTime > 1) {
    //   this.uTime = 0;
    //   this.canAnimate = false;
    //   this.PacketReplay();
    // }
    if (this.canAnimate) {
      var sizes = this.lineBuffer.geometry.attributes.size.array;
      if (this.ping_Pong === pingPong.ping) {
        for (var i = 0; i < 10; i++) {
          // sizes[i] = Math.sin((i + time / 0.60)) * 50.0;
          sizes[i] = Math.sin((i - 10 * this.uTime) / 2) * 150.0;
        }
      } else if (this.ping_Pong === pingPong.pong) {
        for (var i = 0; i < 10; i++) {
          // sizes[i] = Math.sin((i + time / 0.60)) * 50.0;
          sizes[i] = Math.sin((i + 10 * this.uTime) / 2) * 150.0;
        }
      }
      this.lineBuffer.geometry.attributes.size.needsUpdate = true;
      requestAnimationFrame(this.PlayAnimation.bind(this));
    }
  }
}
