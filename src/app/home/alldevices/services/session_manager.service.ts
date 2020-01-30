import { Injectable } from "@angular/core";
import { List } from "linqts";
import { Subject, Observable } from "rxjs";
import { Link } from "../../models/link";
import { Node } from "../../models/node";

@Injectable()
export class SessionManagerService {
  private hostIndex: number;

  private nodeRender = new Subject<any[]>();

  private nodeUpdate = new Subject<any[]>();

  private animationState = new Subject<boolean>();

  //private nodesInTimeline: List<Node> = new List<Node>();

  private nodesData: any = {
    nodes: [],
    links: []
  };

  constructor() {}

  public SetAnimationState(param) {
    this.animationState.next(param);
  }

  public GetAnimationState(): Observable<boolean> {
    return this.animationState.asObservable();
  }

  public SetNodeRender(param) {
    this.nodeRender.next(this.nodesData);
  }

  public UpdateNodeRender(param) {
    this.nodeUpdate.next(this.nodesData);
  }

  public GetNodeUpdate(): Observable<any[]> {
    return this.nodeUpdate.asObservable();
  }
  public GetNodeRender(): Observable<any[]> {
    return this.nodeRender.asObservable();
  }

  public filterData(
    totalDevices,
    index,
    onlineDevices,
    deviceInfo,
    subnetInfo
  ) {
    let filteredIndex: number = index;

    if (this.nodesData.nodes.length > 1) {
      for (var license_key in subnetInfo) {
        for (var k = 0; k < subnetInfo[license_key].length; k++) {
          let subnet = subnetInfo[license_key].find(
            x => license_key + x == this.nodesData.nodes[filteredIndex].id
          );

          if (subnet) {
            filteredIndex++;
          } else {
            let deviceUnlinked = this.nodesData.nodes.filter(
              l => l.subnet == this.nodesData.nodes[filteredIndex].subnet
            ); // Remove links attached to node

            this.nodesData.links = this.nodesData.links.filter(
              l =>
                l.source !== this.nodesData.nodes[filteredIndex] &&
                l.target !== this.nodesData.nodes[filteredIndex]
            ); // Remove links attached to node

            let remove_index = this.nodesData.nodes.indexOf(
              this.nodesData.nodes[filteredIndex]
            );

            this.nodesData.nodes.splice(remove_index, 1);

            for (var j = 0; j < deviceUnlinked.length; j++) {
              let link: Link = new Link();

              link.source = deviceUnlinked.id;

              link.level = "device";

              let targetNode = this.nodesData.nodes[0];

              link.target = targetNode;

              this.nodesData.links.push(link);
            }
          }
        }
      }

      let count = this.nodesData.nodes.length;

      let startCount = filteredIndex;

      for (var i = startCount; i < count; i++) {
        var node = totalDevices.find(
          x =>
            deviceInfo[x]["mac_address"] +
              "-" +
              deviceInfo[x]["license_key"] +
              "-" +
              deviceInfo[x]["ipaddress"] ==
            this.nodesData.nodes[filteredIndex].id
        );

        if (!isNaN(node)) {
          // let remove_index = totalDevices.indexOf(node);

          // totalDevices.splice(remove_index, 1);

          totalDevices = totalDevices.filter(l => l !== node);

          // if (
          //   Boolean(
          //     this.nodesData.nodes[filteredIndex].device_state == "vulnerable"
          //   )
          // ) {
          //   //this.nodesData.nodes[filteredIndex].device_state = "vulnerable"
          // } 
          // else {
            //Check Device Type --> cloud_online, cloud_offline
            if (
              onlineDevices.find(
                x =>
                  deviceInfo[x].mac_address +
                    "-" +
                    deviceInfo[x].license_key +
                    "-" +
                    deviceInfo[x].ipaddress ==
                  this.nodesData.nodes[filteredIndex].id
              )
            ) {
              this.nodesData.nodes[filteredIndex].type == true
                ? (this.nodesData.nodes[filteredIndex].device_state =
                    "cloud_online")
                : (this.nodesData.nodes[filteredIndex].device_state = "online");
            } else {
              this.nodesData.nodes[filteredIndex].type == true
                ? (this.nodesData.nodes[filteredIndex].device_state =
                    "cloud_offline")
                : (this.nodesData.nodes[filteredIndex].device_state =
                    "offline");
            }
            this.nodesData.nodes[
              filteredIndex
            ].texture_type = this.nodesData.nodes[filteredIndex].device_state;
          // }

          filteredIndex++;
        } else {
          this.nodesData.links = this.nodesData.links.filter(
            l =>
              l.source !== this.nodesData.nodes[filteredIndex] &&
              l.target !== this.nodesData.nodes[filteredIndex]
          ); // Remove links attached to node

          let remove_index = this.nodesData.nodes.indexOf(
            this.nodesData.nodes[filteredIndex]
          );

          this.nodesData.nodes.splice(remove_index, 1);

          // for (var k = 0; k < this.nodesData.nodes.length; k++) {

          //  var _links =  this.nodesData.links.find(k => k.source == this.nodesData.nodes[k] || k.target == this.nodesData.nodes[k]);

          //   if (_links) {

          //   }
          //   else {
          //     let link: Link = new Link();

          //     link.source = this.nodesData.nodes[k].id;

          //     let linkeIndex = this.GetRandomInt(k);

          //     link.target = this.nodesData.nodes[linkeIndex].id;

          //     this.nodesData.links.push(link);

          //   }

          // }
        }
      }
      //for (var i = 0; i < this.nodesData.nodes.length; i++) {

      // let link: Link = new Link();

      //  link.source = this.nodesData.nodes[i].id;

      // let linkeIndex = this.GetRandomInt(i);

      //  link.target = this.nodesData.nodes[linkeIndex].id;

      // this.nodesData.links.push(link);

      // }
    }
    this.AddDevice(totalDevices, onlineDevices, deviceInfo, subnetInfo, null);
  }

  public AddDevice(totalDevices, onlineDevices, deviceInfo, subnetInfo, type) {
    let isFirstTimeRender = false;

    if (this.nodesData.nodes.length == 0) {
      isFirstTimeRender = true;

      let router: Node = new Node();

      router.id = "Router"; //localStorage.getItem("customer_name");

      router.ipaddress = "";

      router.mac_address = "";

      router.license_key = "";

      router.device_state = "router";

      router.level = "device";

      router.name = router.id;

      router.size = 25;

      router.texture_type = router.device_state;

      this.nodesData.nodes.push(router);
    }

    for (var licencse_key in subnetInfo) {
      for (var k = 0; k < subnetInfo[licencse_key].length; k++) {
        let subnet_node = this.nodesData.nodes.find(
          x => x.id == licencse_key + subnetInfo[licencse_key][k]
        );

        if (subnet_node) {
        } else {
          let new_node: Node = new Node();

          new_node.id = licencse_key + subnetInfo[licencse_key][k];

          new_node.name = subnetInfo[licencse_key][k]; // To change collector tool

          new_node.subnet = subnetInfo[licencse_key][k];

          new_node.ipaddress = "";

          new_node.mac_address = "";

          new_node.license_key = "";

          new_node.device_state = "subnet";

          new_node.level = "device";

          new_node.size = 25 / 2;

          new_node.texture_type = new_node.device_state;

          this.nodesData.nodes.push(new_node);

          let link: Link = new Link();

          link.source = new_node.id;

          link.distance = 100;

          link.level = "device";

          link.target = this.nodesData.nodes[0].id;

          this.nodesData.links.push(link);
        }
      }
    }

    for (var i = 0; i < totalDevices.length; i++) {
      //Create Nodes as Host by type checking

      let new_Node: Node = new Node();

      new_Node.id =
        deviceInfo[totalDevices[i]]["mac_address"] +
        "-" +
        deviceInfo[totalDevices[i]]["license_key"] +
        "-" +
        deviceInfo[totalDevices[i]]["ipaddress"];

      new_Node.ipaddress = deviceInfo[totalDevices[i]]["ipaddress"];

      new_Node.name = new_Node.ipaddress;

      new_Node.subnet = deviceInfo[totalDevices[i]]["subnet"];

      new_Node.mac_address = deviceInfo[totalDevices[i]]["mac_address"];

      new_Node.license_key = deviceInfo[totalDevices[i]]["license_key"];

      new_Node.level = "device";

      new_Node.vulnerable = Boolean(
        deviceInfo[totalDevices[i]]["isVulnerable"]
      );

      new_Node.type =
        deviceInfo[totalDevices[i]]["asset_type"] == null ? false : true;

      new_Node.size = 25 / 3;

      this.ConstructDevices(new_Node, onlineDevices, deviceInfo);
    }
    if (isFirstTimeRender) {
      this.SetNodeRender(null);
    } else {
      this.UpdateNodeRender(null);
    }
  }

  public ConstructDevices(new_node, onlineDevices, deviceInfo) {
    // if (new_node.vulnerable) {

    //   new_node.device_state = "vulnerable"

    // }
    // else {
    let state = onlineDevices.find(
      x =>
        deviceInfo[x].mac_address +
          "-" +
          deviceInfo[x].license_key +
          "-" +
          deviceInfo[x].ipaddress ==
        new_node.id
    );
    if (!isNaN(state)) {
      new_node.type == true
        ? (new_node.device_state = "cloud_online")
        : (new_node.device_state = "online");
    } else {
      new_node.type == true
        ? (new_node.device_state = "cloud_offline")
        : (new_node.device_state = "offline");
    }

    // }

    new_node.texture_type = new_node.device_state;

    this.nodesData.nodes.push(new_node);

    if (this.nodesData.nodes.length > 1) {
      let link: Link = new Link();

      link.source = new_node.id;

      link.level = "device";

      var targetNode: any;

      if (new_node.subnet != null) {
        targetNode = this.nodesData.nodes.find(
          x => x.id == new_node.license_key + new_node.subnet
        );
      } else {
        targetNode = this.nodesData.nodes[0].id;
      }

      link.target = targetNode;

      this.nodesData.links.push(link);
    }
  }

  public ResetDevice() {
    this.nodesData.links = this.nodesData.links.filter(l => l.level == "host");
    this.nodesData.nodes = this.nodesData.nodes.filter(x => x.level == "host");
    // this.nodesData = {
    //   nodes: [],
    //   links: []
    // };

    //this.nodesInTimeline = new List<Node>();

    this.SetNodeRender(null);
  }
  public randomExcluded(min, max, excluded) {
    var n = Math.floor(Math.random() * (max - min) + min);

    if (n >= excluded) {
      n--;
    }

    return n;
  }

  public GetRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  public UnSubscribeSession() {
    this.nodesData = {
      nodes: [],
      links: []
    };

    this.SetNodeRender(null);
  }
}
