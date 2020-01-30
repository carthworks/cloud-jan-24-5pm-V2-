
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import * as THREE from 'three';
import { NodeShader } from '../../shaders/NodeShader';
import ForceGraph3D from '3d-force-graph';
import { Subscription } from 'rxjs';
import { TextureID } from 'src/app/home/models/TextureID';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { SessionManagerService } from '../../services/session_manager.service';
import { List } from 'linqts';

@Component({
  selector: 'app-topology3D',
  templateUrl: './topology-3D.component.html',
  styleUrls: ['./topology-3D.component.css'],
  host: {
    '(window:resize)': 'onWindowResize($event)'
  }
})

export class Topology3D implements OnInit, OnDestroy {

  private graph_3D: any;

  private elem_3D: any;

  private textureID = new TextureID();

  private foundAnomalies: Object[];

  private nodeRenderEvent: Subscription = null;

  private nodeAnimationControlEvent: Subscription = null;

  private textureTypes = [];

  private geometry: THREE.Geometry;

  public overlay: boolean = false;

  private clickedNode = [];

  private nodeGroup: any = new List<any>();

  private nodeInfoUpdateEvent:Subscription = null;

  constructor(private socket:SocketdataService,private sessionManager: SessionManagerService) { }

  public ngOnInit() {
    //console.log('Topology3D loaded !');

    this.DrawImage();

    this.Init2DGraph();

    this.nodeRenderEvent = this.sessionManager.GetNodeRender().subscribe(info => {

      var config = {

        cooldowntime: 2000

      }

      this.DrawTopology(info, config);

    });

    this.nodeInfoUpdateEvent = this.socket.getNodeDetails().subscribe(info => {
      if (info) {
        this.UpdateSelectedNode(info);
      }
    });

    this.nodeAnimationControlEvent = this.sessionManager.GetAnimationState().subscribe(info => {

      if (info) {

        this.graph_3D.resumeAnimation();

      }
      else {

        this.graph_3D.pauseAnimation();

      }
    });

    this.sessionManager.SetNodeRender(null);

  }

  public DrawImage() {

    let nor_on: any = {
      color: "",
      texture: "",
    };
    nor_on.color = new THREE.Vector3(130 / 255, 210 / 255, 80 / 255),
      nor_on.texture = null
    this.textureTypes.push(nor_on);

    let nor_off: any = {
      color: "",
      texture: "",
    };
    nor_off.color = new THREE.Vector3(153 / 255, 153 / 255, 153 / 255),
      nor_off.texture = null
    this.textureTypes.push(nor_off);

    this.geometry = new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);

  }

  private Init2DGraph() {

    if (this.graph_3D == null) {

      this.graph_3D = ForceGraph3D();

      this.elem_3D = document.getElementById('forceGraph-3D');

      (this.graph_3D)

        (this.elem_3D)

        .backgroundColor('#000000')

        .width(this.elem_3D.clientWidth)

        .height(this.elem_3D.clientHeight);

        // this.graph_3D.pauseAnimation();

    } else {

     // console.log("3D Graph Force exists");

    }

  }

  private DrawTopology(nodeData, config) {

    this.nodeGroup = new List<any>();

    (this.graph_3D)

      .graphData(nodeData)

      .nodeLabel('ipaddress')

      .linkColor((link) => this.GenerateLinks(link))

      .enableNodeDrag(true)

      .enablePointerInteraction(true)

      // .d3AlphaDecay(0)

      // .d3VelocityDecay(0.08)

      .cooldownTime(config.cooldowntime)

      .nodeThreeObject((nodes) => this.GenerateNode(nodes))

      .onNodeClick(node => { this.NodeClicked(node); })

      .onNodeHover(node => { this.HighlightNode(node); })

  }

  private HighlightNode(node) {

    node => this.elem_3D.style.cursor = node ? 'pointer' : null;

  }

  private NodeClicked(node) {
    this.clickedNode = node ? [node] : [];

    this.nodeGroup.Where(x => x.name !== this.clickedNode[0].id ? x.material.uniforms.alpha.value = new THREE.Vector4(0.3, 0.3, 0.3, 0.3) : x.material.uniforms.alpha.value = new THREE.Vector4(1.0, 1.0, 1.0, 1.0));

    const distance = 40;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    this.graph_3D.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node,
      1000
    );
    this.overlay = true;

    // var deviceObj = {};
    // deviceObj['mac_address'] = node.mac_address;
    // deviceObj['ip_address'] = node.ipaddress;
    // deviceObj['license_key'] = node.license_key;
    // deviceObj["nature"] = 4;
    // this.socket.requestNodeDetails(deviceObj);
  }
  private DeselectNode(event) {
    this.nodeGroup.Where(x => x.material.uniforms.alpha.value = new THREE.Vector4(1.0, 1.0, 1.0, 1.0));

    this.clickedNode = [];
    this.overlay = false;


  }
  private GenerateLinks(link: any) {

    if (this.clickedNode.length > 0) {

      for (var i = 0; i < this.clickedNode.length; i++) {

        if (link.source.id == this.clickedNode[i].id && link.target.id == this.clickedNode[0].id) {

          var _visible = 'rgba(255,255,255,0.5)';

          break;

        } else {

          var _visible = 'rgba(255,255,255,0.1)';

        }

      }

      return _visible;
    } else
    {

      return 'rgba(255,255,255,0.5)'

    }

  }

  private GenerateNode(node) {

    let textureid = this.textureID.ID[node.texture_type];

    var newNode = new THREE.Mesh(this.geometry,
      new THREE.ShaderMaterial(
        {
          vertexShader: NodeShader.vertexShader,
          fragmentShader: NodeShader.fragmentShader,
          uniforms: {
            "normalTexture": { type: "t", value: this.textureTypes[textureid].texture },
            "color": { type: "v3", value: this.textureTypes[textureid].color },
            "alpha": { type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) }
          },
        }
      ));
    newNode.matrixAutoUpdate = true;
    newNode.name = node.id;
    newNode.scale.set(2, 2, 2);
    this.nodeGroup.Add(newNode);
    return newNode;
  }

  public ngOnDestroy() {

    this.nodeRenderEvent.unsubscribe();

    this.nodeAnimationControlEvent.unsubscribe();

    this.nodeInfoUpdateEvent.unsubscribe();
  }

  public onWindowResize() {
    (this.graph_3D)

    (this.elem_3D)

    .width(this.elem_3D.clientWidth)

    .height(this.elem_3D.clientHeight);

  }
  private UpdateSelectedNode(param)
  {
    this.foundAnomalies = [];
    const tile = {}; //normal

    tile['ipaddress'] = param.selectedDeviceInfo.ipaddress;
    tile['macaddress'] = param.selectedDeviceInfo.mac_address;
    tile['manufacturer'] = param.selectedDeviceInfo.hasOwnProperty('m_name') ? param.selectedDeviceInfo.m_name : ' - ';
    tile['lastUpdated'] = param.selectedDeviceInfo.hasOwnProperty('updatedAt') ? param.selectedDeviceInfo.updatedAt : ' - ';

    if (this.clickedNode[0].texture_type== "offline") {
      tile['threatType'] = 4;
    } else
    {
      tile['threatType'] = 5;
    }


    tile['step'] = 2;
    tile['AttackerOrVictim'] = "";
    this.foundAnomalies.push(tile);
  }
}
