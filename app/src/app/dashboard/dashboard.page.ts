import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { storage } from 'firebase';
import * as firebase from 'firebase';
import { NgZone} from '@angular/core';
import { ActionSheetController, LoadingController, NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';

export interface MyData {
  name: string;
  filepath: string;
  size: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  ngOnInit() {
  }

  task: AngularFireUploadTask;

  percentage: Observable<number>;

  snapshot: Observable<any>;

  UploadedFileURL: Observable<string>;

  images: Observable<MyData[]>;

  fileName:string;
  fileSize:number;

  isUploading:boolean;
  isUploaded:boolean;

  store;
  storageRef;
  imagesRef;
  yogaRef;

  img_src_string: any;

  imgpose: string;
  

  public static URL;
  imgURL;
  selectedPhoto;
  public static loading;

  private imageCollection: AngularFirestoreCollection<MyData>;
  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, private iab: InAppBrowser, private database: AngularFirestore,private storage: AngularFireStorage,private camera: Camera) { 
    this.isUploading = false;
    this.isUploaded = false;
    this.imageCollection = database.collection<MyData>('app');
    this.images = this.imageCollection.valueChanges();
    this.store = firebase.storage();
    this.storageRef = firebase.storage().ref();
    this.imagesRef = this.storageRef.child('output');
    

    var fileName = 'output.png';
    this.yogaRef = this.imagesRef.child(fileName);
  }

  getimg(){
    
    const browser = this.iab.create('https://firebasestorage.googleapis.com/v0/b/cadmus-eba15.appspot.com/o/app%2Foutput.txt?alt=media&token=54ceb1da-b6eb-41c5-afee-c4181cee8dbc');

  }
  
  takeImage() {
    const options:CameraOptions={
      quality: 100,
      targetHeight: 500,
      targetWidth: 500,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: false,
      allowEdit: true,
    }
    this.camera.getPicture(options).then((imageData)=>{
      this.selectedPhoto = this.dataURLtoBlob('data:image/jpeg;base64,' + imageData);
      this.upload();
    },(Err) => {
      alert("Error taking image")
    }
    );
  }

  dataURLtoBlob(dataURL){
      let binary=atob(dataURL.split(',')[1]);
      let array = [];
      for(let i =0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type:'image/jpeg'})
  };

  async upload() {
    DashboardPage.loading = await this.loadingCtrl.create({
      message: 'uploading...'
    });
    await DashboardPage.loading.present();

    if(this.selectedPhoto) {
      var uploadtask = firebase.storage().ref().child('app/input').put(this.selectedPhoto);
      uploadtask.then(this.onSuccess, this.onError);
    }
  }

  onSuccess = snapshot => {
    snapshot.ref.getDownloadURL().then(function(downloadURL){
      DashboardPage.URL = downloadURL;
      DashboardPage.loading.dismiss();
    });
    this.imgURL = DashboardPage.URL;
  };

  onError = error => {
    console.log('error', error)
  }
  
  
  uploadFile(event: FileList) {

    var storage = firebase.storage();    

    const file = event.item(0)

    if (file.type.split('/')[0] !== 'image') { 
     console.error('unsupported file type :( ')
     return;
    }

    this.isUploading = true;
    this.isUploaded = false;


    this.fileName = "Image";

    const path = `app/input`;

    const customMetadata = { app: 'Image Upload Demo' };

    const fileRef = this.storage.ref(path);

    this.task = this.storage.upload(path, file, { customMetadata });

    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      
      finalize(() => {
        this.UploadedFileURL = fileRef.getDownloadURL();
        
        this.UploadedFileURL.subscribe(resp=>{
          this.addImagetoDB({
            name: file.name,
            filepath: resp,
            size: this.fileSize
          });
          this.isUploading = false;
          this.isUploaded = true;
        },error=>{
          console.error(error);
        })
      }),
      tap(snap => {
          this.fileSize = snap.totalBytes;
      })
    )
  }

  addImagetoDB(image: MyData) {
    const id = this.database.createId();

    this.imageCollection.doc(id).set(image).then(resp => {
      console.log(resp);
    }).catch(error => {
      console.log("error " + error);
    });
  }

  doRefresh(event) {
    console.log('Begin async operation');
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1000);
  }

}
