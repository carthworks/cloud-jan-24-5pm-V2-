import { Injectable } from "@angular/core";
import * as THREE from "three";
import { List } from "linqts";

@Injectable()
export class UtilityService {
  private startTime = 0;
  private endTime = 0;
  private canAnimate: boolean = false;

  constructor() {}
  /**
   * Returns total width to be scaled from the camera depth
   * @param depth  Depth Of plane from the camera to be calculated
   * @param camera Active camera to calculate aspect ratio
   * @param width  Canvas total width
   * @param height Canvas total height
   */
  public visibleWidthAtZDepth(depth, camera, width, height) {
    return this.visibleHeightAtZDepth(depth, camera) * (width / height);
  }

  /**
   * //Returns total height to be scaled from the camera depth level
   * @param depth  Depth Of plane from the camera to be calculated
   * @param camera Active camera to calculate aspect ratio
   */
  public visibleHeightAtZDepth(depth, camera) {
    // compensate for cameras not positioned at z=0
    var cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;
    // vertical fov in radians
    var vFOV = (camera.fov * Math.PI) / 180;
    // Math.abs to ensure the result is always positive
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  }

  /**
   * Returns Linear interpolation from point A to B at uniform interval
   * @param x Starting Point
   * @param y Ending Point
   * @param alpha uniform Interval
   */
  public linerarInterPolation(x, y, alpha) {
    return (1 - alpha) * x + alpha * y;
  }

  /**
   * Returns cartesian position of lattitude and longitude for the given plane's width and height
   * @param lattitude Lattitude Points
   * @param longitude Longittude Points
   * @param plane_Width Total plane width
   * @param plane_Height Total plaen height
   */
  public locateGeoLocationInPlane(
    lattitude,
    longitude,
    plane_Width,
    plane_Height
  ) {
    //Plots In Plane Terrain
    let ScreenX_Y: THREE.Vector2 = new THREE.Vector2(
      (plane_Width / 360.0) * (180 + longitude),
      (plane_Height / 180.0) * (90 - lattitude)
    );

    var cartesianX = ScreenX_Y.x - plane_Width / 2;
    var cartesianY = -(ScreenX_Y.y - plane_Height / 2);
    var world_Pos = new THREE.Vector3(cartesianX, cartesianY, 0);

    var postion = new THREE.Vector3(world_Pos.x, world_Pos.y, world_Pos.z);
    return postion;
  }
  /**
   * Returns radians position of latitude and longitude for given radius of sphere
   * @param lattitude Lattitude Points
   * @param longitude Longitude Points
   * @param radius Radius of sphere
   */
  public locateGeoLocationInSphere(lattitude, longitude, radius) {
    //Plots In Spherical Terrain
    var phi = (90 - lattitude) * (Math.PI / 180);
    var theta = (longitude + 180) * (Math.PI / 180);

    var x = -(radius * Math.sin(phi) * Math.cos(theta)),
      z = radius * Math.sin(phi) * Math.sin(theta),
      y = radius * Math.cos(phi);
    var world_Pos = new THREE.Vector3(x, y, z);

    var postion = new THREE.Vector3(world_Pos.x, world_Pos.y, world_Pos.z);
    return postion;
  }

  /**
   * //Generate Random (+ve)/(-ve) range value with added Offset
   * @param Offset Offset value
   * @param range range value
   */
  public generateRandomPositionWithSign(Offset, range) {
    var sign = Math.random() < 0.5 ? -range : range;
    var value = Math.random() * sign + Offset;
    return value;
  }

  /**
   * Returns Mouse Position for the event
   * @param canvas Active Canvas
   * @param evt Triggerd Event
   */
  public getMousePosition(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  /**
   *
   * @param frequency Set Timer in milli seconds
   */
  public SetTimer(frequency: any) {
    this.startTime = 0;
    var wait_time = frequency;
    this.startTime = this.startTime + wait_time;
  }
  public update(tick?) {
    this.startTime = tick;
    if (this.startTime > this.endTime) {
      var callback = true;
      return callback;
    }
    return (callback = false);
  }
  public reset() {}
  /**
   *
   * @param radius radian of circle
   * @param deviceCount device count
   * @param iteration device index
   * @param lastPosition last start position
   * @param nodeSize node size
   */
  public GenerateCircleFormation(
    radius,
    deviceCount,
    iteration,
    lastPosition,
    nodeSize
  ) {
    var angle = iteration * (radius / deviceCount);
    var c_x = lastPosition.position.x + nodeSize * Math.cos(angle),
      c_y = lastPosition.position.y + nodeSize * Math.sin(angle);
    return new THREE.Vector3(c_x, c_y, 0);
  }

  public GenerateRandomWithinRange(min, max) {
    return Math.random() * (max - min + 1) + min;
  }

  public MatrixSet(origin, distance, vectorSet) {
    let tempUniqueVectorSet = new List<THREE.Vector3>();
    tempUniqueVectorSet.Add(origin);
    let radius: number = distance;
    var rotation: number = 1;
    while (tempUniqueVectorSet.Count() < vectorSet) {
      var angleCount = 360 / (45 / rotation);
      for (var i = 0; i < angleCount; i++) {
        var radian = ((45 / rotation) * i * Math.PI) / 180;
        tempUniqueVectorSet.Add(
          new THREE.Vector3(
            origin.x + radius * Math.cos(radian),
            origin.y + radius * Math.sin(radian),
            0
          )
        );
      }
      rotation++;
      radius = radius + distance;
    }
    return tempUniqueVectorSet;
  }

  public _MatrixSet(origin, distance, vectorSet) {
    let nearbyCount = 4;
    let tempUniqueVectorSet = new List<THREE.Vector3>();
    let tempOrigin: THREE.Vector3 = origin;
    tempUniqueVectorSet.Add(tempOrigin);
    while (tempUniqueVectorSet.Count() < vectorSet) {
      let nearbyVectors: THREE.Vector3[] = this.FindNearPosfromOrigin(
        tempOrigin,
        nearbyCount,
        distance
      );
      for (var i = 0; i < nearbyVectors.length; i++) {
        if (tempUniqueVectorSet.Count() > vectorSet) {
          break;
        }
        let state: boolean =
          tempUniqueVectorSet.Any(x => x.x == nearbyVectors[i].x) &&
          tempUniqueVectorSet.Any(y => y.y == nearbyVectors[i].y);
        if (!state) {
          tempUniqueVectorSet.Add(nearbyVectors[i]);
        }

        let nearbyVectors_1: THREE.Vector3[] = this.FindNearPosfromOrigin(
          nearbyVectors[
            Math.round(
              this.GenerateRandomWithinRange(0, nearbyVectors.length - 1)
            )
          ],
          nearbyCount,
          distance
        );
        for (var j = 0; j < nearbyVectors_1.length; j++) {
          if (tempUniqueVectorSet.Count() > vectorSet) {
            break;
          }
          let state: boolean =
            tempUniqueVectorSet.Any(x => x.x == nearbyVectors_1[j].x) &&
            tempUniqueVectorSet.Any(y => y.y == nearbyVectors_1[j].y);
          if (!state) {
            tempUniqueVectorSet.Add(nearbyVectors_1[j]);
          }
        }
        tempOrigin = tempUniqueVectorSet.ElementAt(
          Math.round(
            this.GenerateRandomWithinRange(0, tempUniqueVectorSet.Count() - 2)
          )
        );
      }
      // console.log((Math.round(this.GenerateRandomWithinRange(0, tempUniqueVectorSet.Count() - 2))));
    }
    return tempUniqueVectorSet;
  }

  /*
  Fisther Yates Shuffle
  */
  public Shufule(arr: any[]) {
    let n = arr.length;
    for (var i = 0; i < n; i++) {
      //let r = i + Math.random.
    }
  }

  public FindNearPointsfromOrigin(
    origin: THREE.Vector3,
    pointCount: number,
    distance: number
  ) {
    let nearbyPoints: List<THREE.Vector3> = new List<THREE.Vector3>();
    for (var i = 0; i < pointCount; i++) {
      var angle = i * (distance / pointCount);
      nearbyPoints.Add(
        new THREE.Vector3(
          origin.x + Math.round(distance * Math.cos(angle)),
          origin.y + Math.round(distance * Math.sin(angle)),
          0
        )
      );
    }
    return nearbyPoints;
  }

  public FindNearPosfromOrigin(
    origin: THREE.Vector3,
    pointCount: number,
    distance: number
  ) {
    let nearbyPoints: List<THREE.Vector3> = new List<THREE.Vector3>();
    var angle: number[] = [0, 90, 180, 270];
    for (var i = 0; i < pointCount; i++) {
      var radian = (angle[i] * Math.PI) / 180;
      nearbyPoints.Add(
        new THREE.Vector3(
          origin.x + Math.round(distance * Math.cos(radian)),
          origin.y + Math.round(distance * Math.sin(radian)),
          0
        )
      );
    }
    return nearbyPoints.ToArray();
  }
  public FormWifiPosition(origin, distance, vectorSet) {
    let tempUniqueVectorSet = new List<THREE.Vector3>();
    for (var i = 1; i <= vectorSet; i++) {
      for (var j = 1; j <= i; j++) {
        var angle = j * (distance / i);
        tempUniqueVectorSet.Add(
          new THREE.Vector3(
            Math.cos(angle) * (origin.x + i * distance),
            origin.y + (i * distance) / 2 + j * -distance,
            0
          )
        );
      }
    }
    return tempUniqueVectorSet;
  }
  public FormSemiCircle(radius, deviceCount) {
    let tempUniqueVectorSet = new List<THREE.Vector3>();
    let distance = radius;
    var rotation = 1;
    var angleCount = 225 / (45 / rotation);

    while (tempUniqueVectorSet.Count() < deviceCount) {
      for (var i = 0; i < angleCount; i++) {
        var angle = 180 - i * (45 / rotation); //(i * (distance / deviceCount) );
        // console.log(angle);
        if (angle < 0) {
          break;
        }
        if (tempUniqueVectorSet.Count() > deviceCount) {
          break;
        }
        var c_x = distance * Math.cos((angle * Math.PI) / 180),
          c_y = distance * Math.sin((angle * Math.PI) / 180);
        tempUniqueVectorSet.Add(new THREE.Vector3(c_x, c_y, 0));
      }
      rotation++;
      angleCount = 2 * angleCount - 1;
      distance = distance + radius;
    }
    return tempUniqueVectorSet;
  }


  public normalisation(oldValue, oldMin, oldMax, newMin, newMax) {
    let oldRange = oldMax - oldMin;
    let newRange = newMax - newMin;

    return ((oldValue - oldMin) * newRange) / oldRange + newMin;
  }

  public normalize(value, max, min) {
    let diff = value - min;
    return diff / (max - min);
  }
}
