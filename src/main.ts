import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PreloadAllModules, RouterModule } from '@angular/router';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import './polyfills';

import 'hammerjs';


if (environment.production) {
  enableProdMode();
}else{
  enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule)
  .then(ref => {

    // Ensure Angular destroys itself on hot reloads.
    if (window['ngRef']) {
      window['ngRef'].destroy();
    }
    window['ngRef'] = ref;

    // Otherise, log the boot error
  }).catch(err => console.error(err));

