import { Injectable } from '@angular/core';
import { List } from 'linqts';


@Injectable()
export class TextureIDMap {

  private textureMap: any = new List<any>();

  constructor() {
    this.textureMap.Add("online");
    this.textureMap.Add("offline");
    this.textureMap.Add("cloud_online");
    this.textureMap.Add("cloud_offline");
    this.textureMap.Add("router");
    this.textureMap.Add("subnet");
    this.textureMap.Add("camera");
    this.textureMap.Add("laptop");
  }

  public AddImage(category) {
    this.textureMap.Add(category);
  }

  public checkImageAvailable(key){
    return this.textureMap.FindIndex(x => x === key);
  }
}
