import {Component, OnInit} from '@angular/core'
import { LoadingController, AlertController } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Observable} from 'rxjs';
import { Injectable} from '@angular/core';
import { Resolve } from '@angular/router';
import { logging } from 'protractor';
import { ActionSheetController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router } from '@angular/router'
import {ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string=""
  password: string=""

  usernamer: string=""
  passwordr: string=""
  cpassword: string=""

  constructor(
    public afAuth: AngularFireAuth,
    public alert: AlertController,
    public router: Router,
    public actionSheet: ActionSheetController,
    public toastCtrl: ToastController,
    public fs: AngularFirestore,
    ) { }

  ngOnInit() {
  }

  
  async login() {
    const { username, password } = this
    try {
      const res = await this.afAuth.auth.signInWithEmailAndPassword(username, password)
      localStorage.setItem('userid', this.afAuth.auth.currentUser.uid);
      this.showAlert("Logged In!",":)")
      this.router.navigate(['/dashboard'])
     } catch(err) {
      console.dir(err)
      if(err.code === "auth/wrong-password") {
        console.log("wrong password")
        this.showAlert("Incorrect Password", err.message)
      }
      if(err.code === "auth/user-not-found") {
        console.log("user not found")
        this.showAlert("Error user not found", err.message)
      }
      if(err.code === "auth/invalid-email") {
        console.log("user not found")
        this.showAlert("Error", err.message)
      }
    }
  }

  async recover() {
    this.afAuth.auth.sendPasswordResetEmail(this.username)
    if(this.username == "") {
      this.showAlert("Error no email given", "Please fill out email field")
    } else {
      this.presentToast('Password reset email sent', 3000);
    }
  }

  async presentToast(message: string, duration: number) {
    let toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom'
    })

    await toast.present()
  }


  async showAlert(header: string, message: string) {
    const alert = await this.alert.create({
      header,
      message,
      buttons: ["Ok"]
    })

    await alert.present()
  }

  async go() {
    this.router.navigate(['/signup'])
  }

}
