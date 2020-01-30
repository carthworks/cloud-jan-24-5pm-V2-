
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import ForceGraph from 'force-graph';
import { Subscription } from 'rxjs';
import { Node } from 'src/app/home/models/node';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { Link } from 'src/app/home/models/link';
import { Device_State } from 'src/app/home/models/device-State';
import { TextureID } from 'src/app/home/models/TextureID';
import { SessionManagerService } from '../../services/session_manager.service';
import * as d3 from 'd3';
import { UnityService } from '../../services/UnityService.service';
import { Router } from '@angular/router';
import { TextureIDMap } from '../../services/TextureIDMap.service';
import { UnityAppRegistry } from '../../services/UnityAppRegistry.service';
import { UnityAppModel } from 'src/app/home/models/UnityAppModel';


@Component({
  selector: 'app-topology2D',
  templateUrl: './topology-2D.component.html',
  styleUrls: ['./topology-2D.component.css'],
  host: {
    '(window:resize)': 'onWindowResize($event)'
  }
})

export class Topology2D implements OnInit, OnDestroy {

  // @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
  //   console.log('Processing beforeunload...');
  //   // Do more processing...
  //   event.returnValue = false;
  // }
  private unityAppInstance: UnityAppModel;

  private graph_2D: any;

  private elem_2D: any;

  private textureID = new TextureID();

  private foundAnomalies: Object[];

  private nodeRenderEvent: Subscription = null;

  private nodeUpdateEvent: Subscription = null;

  private dropDownEvent:Subscription = null;

  private navigationClickEvent: Subscription = null;
  
  private nodeAnimationControlEvent: Subscription = null;

  private textureTypes = [];

  public overlay: boolean = false;

  private clickedNode = [];


  /* Prod build fix */
  searchpanel: any;

  constructor(private unityAppRegistry: UnityAppRegistry,private TextureIDMap: TextureIDMap,private socket: SocketdataService, private sessionManager: SessionManagerService,
    private intercommunicationService: IntercommunicationService, public unityService: UnityService, public router: Router) { }

  public ngOnInit() {
   // console.log('Topology2D loaded !');
   this.navigationClickEvent = this.intercommunicationService.getNavigationClickEvent().subscribe(info => {
    if (info == "dtable") {
      if (this.unityService.binaryStatus && this.unityService.isDesktop) {
        this.UnSubscribeScene();
      }
    }
    else if (info == "dashboard") {
      if (this.unityService.binaryStatus && this.unityService.isDesktop) {
        this.UnSubscribeScene();
      }
    }
    else if(info =="settings") {
      if (this.unityService.binaryStatus && this.unityService.isDesktop) {
        this.UnSubscribeScene();
      }
    }
   });
    if (!this.unityService.binaryStatus  && this.unityService.isDesktop) {
      this.router.navigate(['/alldevices']);
    } else {

      localStorage.setItem("last_loaded_screen", '/alldevices/twodimension');
      
      this.RegisterUnity();

      this.DrawImage();
      this.Init2DGraph();
      this.dropDownEvent = this.intercommunicationService.getheaderdropdownClicked().subscribe(info => {
        var param_req = {
          'event': 'TopologyTimeLineEvent',
          'method': 'Refresh',
          'param': null,
        }
        this.unityService.sendMessage('LibraryLinker', 'AngularEventDispatch', param_req, this.unityAppInstance.appInstance);
        
        var param2_req = {
          'event': 'GraphEvent',
          'method': 'Refresh',
          'param': null,
        }
        this.unityService.sendMessage('LibraryLinker', 'AngularEventDispatch', param2_req, this.unityAppInstance.appInstance);     
      });

      this.nodeRenderEvent = this.sessionManager.GetNodeRender().subscribe(info => {

        const config = {

          cooldowntime: 10000
        };
        this.DrawTopology(info, config);

      });

      this.nodeUpdateEvent = this.sessionManager.GetNodeUpdate().subscribe(info => {
        const config = {
          cooldownTime: 2000
        };
        this.updateTopology(info, config);
      })

      // this.nodeAnimationControlEvent = this.sessionManager.GetAnimationState().subscribe(info => {

      //   if (info) {

      //     this.graph_2D.resumeAnimation();

      //   } else {

      //     this.graph_2D.pauseAnimation();

      //   }
      // });
      //debugger;
      //this.sessionManager.SetNodeRender(null);
    }
  }
  
  public RegisterUnity() {
    var parentHTML: any = document.getElementById('UnityTimeLine');
    var unityCanvas = this.unityAppRegistry.getAppCanvas();
    parentHTML.appendChild(unityCanvas);
    this.UnityCanvasResize();
    this.unityAppInstance = this.unityAppRegistry.GetAppInstances();
    this.SwitchUnityScene('Topology');
    this.unityAppRegistry.loadedScene = "Topology";

    //var req = {
      //startTime: 0,
      //endTime: 0
    //};
    //setTimeout(() => { this.socket.getDevOverView(req); }, 100);
    
  }

  public UnityCanvasResize() {
    var container = this.unityAppRegistry.getAppCanvas();
    var canvas = document.getElementById('#canvas');
    var winW = parseInt(window.getComputedStyle(container).width, 10);
    var winH = parseInt(window.getComputedStyle(container).height, 10);
    var scale = 1;//Math.min(winW / container.clientWidth, winH / container.clientHeight);
    canvas.style.display = '';
    var fitW = Math.round(container.clientWidth * scale * 100) / 100;
    var fitH = Math.round(container.clientHeight * scale * 100) / 100;
    if (canvas) {
      canvas.setAttribute('width', fitW.toString());
      canvas.setAttribute('height', fitH.toString());
    }
  }

  public SwitchUnityScene(sceneName: string) {
    this.unityService.sendMessage('LibraryLinker', 'LoadScene', sceneName, this.unityAppInstance.appInstance);
  }

  public UnSubscribeScene() {
    this.unityService.sendMessage('LibraryLinker', 'UnloadScene', null, this.unityAppInstance.appInstance);
    this.unityAppRegistry.loadedScene = "Lobby";
  }

  public DrawImage() {

    const online = new Image(1, 1);

    online.src = 'assets/online.png';

    const offline = new Image(1, 1);

    offline.src = 'assets/offline.png';

    const cloud_online = new Image(1, 1);

    cloud_online.src = 'assets/cloud_online.png';

    const cloud_offline = new Image(1, 1);

    cloud_offline.src = 'assets/cloud_offline.png';

    const router = new Image(1, 1);

    router.src = 'assets/router.png';

    const subnet = new Image(1, 1);

    subnet.src = 'assets/subnet.png';

    const node = new Image(1,1);

    node.src = 'assets/node.png';

    const camera = new Image(1,1);
    
    camera.src = 'assets/camera.png';

    const laptop = new Image(1,1);

    laptop.src = 'assets/laptop.png';

    const vulnerable = new Image(1,1);

    vulnerable.src = 'assets/vulnerable.png';

    this.textureTypes = [

      online,

      offline,

      cloud_online,

      cloud_offline,

      router,

      subnet,
      
      node,

      camera, 

      laptop,

      vulnerable
    ];

  }

  private addImage(name, callback) {

    const category = new Image(1, 1);

    category.src = 'assets/' + name + '.png';
    category.onload = function () { callback(true, category) };
    category.onerror = function () { callback(false, null); };


  }

  private Init2DGraph() {

    if (this.graph_2D == null) {

      this.graph_2D = ForceGraph();

      this.elem_2D = document.getElementById('forceGraph-2D');

      (this.graph_2D)

        (this.elem_2D)

        .backgroundColor('#000000')

        .width(this.elem_2D.clientWidth)

        .height(this.elem_2D.clientHeight);

      // this.graph_2D.pauseAnimation();

    } else {

     // console.log('2D Graph Force exists');

    }

  }
  private updateTopology(nodeData, config) {
    (this.graph_2D)
    .graphData(nodeData);
  }
  private DrawTopology(nodeData, config) {

    (this.graph_2D)

      .graphData(nodeData)

      .dagMode('radialin')

      .dagLevelDistance(200)

      //.nodeVal(node => 100 / (node.size + 1))
     
      //.d3AlphaDecay(0)
      
      //.d3VelocityDecay(0.08)

      .cooldownTime(4000)

      .nodeLabel('name')

      .linkColor((link) => this.GenerateLinks(link))

      .nodeRelSize(5)

      .zoom(1)

      .enableNodeDrag(true)

      .enablePointerInteraction(true)

      // .d3AlphaDecay(0)

      // .d3VelocityDecay(0.08)
      //.nodeVal(node => 100 / (node.level + 1))

      //.d3Force('link', d3.forceLink().distance(function(d){return 100;}).strength(1))

      //.d3Force('collision', d3.forceCollide(node => Math.sqrt(100 / (node.level + 1)) * 1))


      //.d3Force('collision', d3.forceCollide(node => Math.sqrt(100 / (node.size + 1)) * 2))

      .nodeCanvasObject((node, ctx) => this.GenerateNode(ctx, node))

      .onNodeClick(node => { this.NodeClicked(node); })

      .onNodeHover(node => { this.HighlightNode(node); });

      if( nodeData.nodes.length > 5000 ){
        (this.graph_2D) .d3AlphaDecay(0);
      }
  }

  private HighlightNode(node) {

    node => this.elem_2D.style.cursor = node ? 'pointer' : null;

  }

  private NodeClicked(node) {

    if (node.level == "host") {
      this.graph_2D.centerAt(node.x, node.y, 500);

      this.graph_2D.zoom(2, 500);
    }
    else {
      //this.clickedNode = node ? [node] : []

      this.graph_2D.centerAt(node.x, node.y, 500);

      this.graph_2D.zoom(2, 500);

      //this.overlay = true;


      var deviceObj = {};
      deviceObj['mac_address'] = node.mac_address;
      deviceObj['ip_address'] = node.ipaddress;
      deviceObj['license_key'] = node.license_key;
      deviceObj['nature'] = 4;
       localStorage.setItem('mData', JSON.stringify(deviceObj));

    if(node.device_state!="subnet"&&node.device_state!="router"){
      this.intercommunicationService.requestRowClickedState(deviceObj);

      this.intercommunicationService.enableSettingsGear(false);
    }

   

      
    }

  }

  private DeselectNode(event) {


    this.clickedNode = [];
    //this.overlay = false;


    this.foundAnomalies = [];

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
    } else {

      return 'rgba(255,255,255,0.5)';

    }

  }

  private GenerateNode(ctx, node) {

    var textureid = this.textureID.ID[node.texture_type];

    if (this.clickedNode.length > 0) {

      for (var i = 0; i < this.clickedNode.length; i++) {

        if (this.clickedNode[i].id != node.id) {

          ctx.globalAlpha = 0.05

        } else {

          ctx.globalAlpha = 1;

        }

      }

    } else {

      ctx.globalAlpha = 1;

    }
    if (node.category) {

      var index = this.TextureIDMap.checkImageAvailable(node.category);

      if (index) {

        textureid = this.textureID.ID[index];

      }
      else {

        this.addImage(node, function (callback, image) {

          if (callback) {

            this.textureTypes.push(image);

            this.TextureIDMap.AddImage(node.category);

            ctx.drawImage(this.textureTypes[textureid], node.x - node.size / 2, node.y - node.size / 2, node.size, node.size);
            
            // PNG.decode('assets/cloud_online.png', function (imageData) {
              
            //   this.mergeImages(ctx.getImageData(node.x, node.y, node.size, node.size).data, imageData, ctx);
            
            // });

          } else {

            ctx.drawImage(this.textureTypes[textureid], node.x - node.size / 2, node.y - node.size / 2, node.size, node.size);

          }
        });
      }

    }
    else {
      // PNG.decode('assets/cloud_online.png', function (imageData) {
              
      //   //this.mergeImages(ctx.getImageData(node.x, node.y, node.size, node.size).data, imageData, ctx);
        
      //   ctx.putImageData(imageData,node.x - node.size / 2, node.y - node.size / 2, node.size, node.size);
      
      // });

      ctx.drawImage(this.textureTypes[textureid], node.x - node.size / 2, node.y - node.size / 2, node.size, node.size);
    }
  }

  public mergeImages(originalImageData, category, ctx) {

    //console.log(originalImageData.data, +"category" + category);

    for (var i = 0; i < originalImageData.data.length; i += 4) {

      originalImageData.data[i] = 255 + category[i];     // red

      originalImageData.data[i + 1] = 255 + category[i + 1]; // green

      originalImageData.data[i + 2] = 255 + category[i + 2]; // blue

    }

    ctx.putImageData(originalImageData, 0, 0);

  }

  public getRandomInt(max) {

    return Math.floor(Math.random() * Math.floor(max));

  }

  public ngOnDestroy() {
    
    this.navigationClickEvent.unsubscribe();

    this.dropDownEvent.unsubscribe();

    this.nodeUpdateEvent.unsubscribe();


    this.sessionManager.UnSubscribeSession();

    this.nodeRenderEvent.unsubscribe();

  }

  public onWindowResize() {

    (this.graph_2D)

      (this.elem_2D)
      .width(this.elem_2D.clientWidth)
      .height(this.elem_2D.clientHeight);
    this.UnityCanvasResize();
  }

  private UpdateSelectedNode(param) {
    this.foundAnomalies = [];
    const tile = {}; //normal

    tile['ipaddress'] = param.selectedDeviceInfo.ipaddress;
    tile['macaddress'] = param.selectedDeviceInfo.mac_address;
    tile['manufacturer'] = param.selectedDeviceInfo.hasOwnProperty('m_name') ? param.selectedDeviceInfo.m_name : ' - ';
    tile['lastUpdated'] = param.selectedDeviceInfo.hasOwnProperty('updatedAt') ? param.selectedDeviceInfo.updatedAt : ' - ';

    if (this.clickedNode[0].texture_type == "offline") {
      tile['threatType'] = 4;
    } else {
      tile['threatType'] = 5;
    }


    tile['step'] = 2;
    tile['AttackerOrVictim'] = "";
    this.foundAnomalies.push(tile);
  }

}
