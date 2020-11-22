import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { CallNumber } from '@ionic-native/call-number/ngx'

import { AngularFireStorageModule } from '@angular/fire/storage';
import {HTTP} from '@ionic-native/http/ngx';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, 
            IonicModule.forRoot(), 
            AppRoutingModule, 
            AngularFireAuthModule,
            AngularFireModule.initializeApp(environment.firebase),
            ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
            AngularFirestoreModule.enablePersistence(), 
            AngularFireStorageModule],

    
  providers: [
    StatusBar,
    SplashScreen,
    CallNumber,
    InAppBrowser,
    Camera,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy, },
    HTTP
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
