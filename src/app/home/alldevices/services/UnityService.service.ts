import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';
import { UnityAppRegistry } from './UnityAppRegistry.service';
import { UnityLoader } from 'unity-loader';
import { UnityAppModel } from '../../models/UnityAppModel';
import { AppComponent } from 'src/app/app.component';

///ng-unity/ng-unity.es5.js

declare let window: any;

@Injectable()
export class UnityService implements OnInit {
  private instances: UnityAppModel;
  public binaryStatus: boolean = false;
  public isDesktop: boolean = false;

  constructor(public appRegistry: UnityAppRegistry) { }

  ngOnInit() {

  }
  public load(appName: string, buildJsonPath: string) {
    window.UnityLoader = UnityLoader;
    var gameInstance = UnityLoader.instantiate(appName, buildJsonPath);
    var modal = new UnityAppModel;
    modal.appName = appName;
    modal.appInstance = gameInstance;
    this.instances = modal;
    //document.addEventListener('UnityAppLoaderStatus', function (event) { this.RegisterUnityApplicaiton(event); }.bind(this));
  }

  /**
   *
   * @param _messageHandler UnityComponent to be searched in herarichy
   * @param _function Function name in UnityComponent
   * @param argument Parameter to be passed to the function
   * @param appInstance App Instance to be used
   */
  public sendMessage(_messageHandler: string, _function: any, argument: any, appInstance: any) {
    // console.log(argument);
    appInstance.SendMessage(_messageHandler, _function, JSON.stringify(argument));
  }

  /**
 *    
 * @param event = detail {
 *                app : string,
 *                status : boolean,  
 *                container : string             
 *                }
 */
  public RegisterUnityApplicaiton(event) {
    //console.log(event);
    if (event != null) {
      if (this.instances.appName == event.detail.appName) {
        this.instances.appID = event.detail.appID;
        this.instances.appStatus = event.detail.status;
        this.appRegistry.RegisterApp(this.instances);
        this.binaryStatus = true;
      } else {
        console.log('Container Miss Match');
      }
    }
  }
  public getInstance() {
    return this.instances;
  }
  /**
  * 
  * @param appName:string => App Name
  */
  public DestroyApp(appName: string) {
    this.appRegistry.DestroyApp(appName);
    this.instances = null;
    window = null;
  }

  public UnSubscribeApplication() {
    document.removeEventListener('UnityAppLoader', this.RegisterUnityApplicaiton);
  }
}
