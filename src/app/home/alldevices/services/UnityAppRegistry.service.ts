import { UnityAppModel } from './../../models/UnityAppModel';
import { Injectable } from '@angular/core';
import { List } from 'linqts';
import { Subject } from 'rxjs';


@Injectable()
export class UnityAppRegistry {
    public app: UnityAppModel = new UnityAppModel();
    private appCanvas: any;
    public loadedScene: string;

    public RegisterApp(model: UnityAppModel) {
        this.app = model;
    }

    public RegisterAppCanvas(canvas: any){
        this.appCanvas = canvas;
    }

    public DestroyApp(name: string) {
        this.app = null;
    }

    public GetAppInstances() {
        return this.app;
    }

    public getAppCanvas() {
        return this.appCanvas;
    }
}
