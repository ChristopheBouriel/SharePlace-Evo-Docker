import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../models/profile';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  profile: Profile;
  passwordForm: FormGroup;
  userNameForm: FormGroup;
  userName: string;
  errorMsg: string;
  loading: boolean;
  notChanging: boolean;
  modPass: boolean;
  modName: boolean;
  makeSure: boolean;


  constructor(private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
      this.profileService.profileSubject.subscribe(
        (profile: Profile) => {
          this.profile = profile;
        }
      )

      this.route.params.subscribe(
        (params) => {
          this.userName = params.userName;
          this.profileService.getProfileByUserName(params.userName)
        }
      )

      this.passwordForm = this.formBuilder.group({
            newPassword: new FormControl(null, [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,}')]),
            password2: new FormControl(null, [Validators.required]),
          });

      this.userNameForm = this.formBuilder.group({
            newUserName: new FormControl(null, [Validators.required, Validators.maxLength(40), Validators.pattern('^[a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F \'-]*$')]),
          });

      this.notChanging = true;
  }

  onDeleteAccount() {
    this.authService.deleteAccount(this.userName).then(
      () => {
        this.authService.headMessage$.next('Votre compte a bien été supprimé');
        this.makeSure = false;
        this.authService.isAuth$.next(false);
      }
    ).catch(
          (error) => {           
            this.errorMsg = error.message;
          }
        );
  }

  onModifyPassword() {    
    const password = this.passwordForm.get('newPassword').value;    
    const userName = this.profile[0].userName;    
    this.authService.modifyPassword(password, userName).then(
      () => {
        this.router.navigate(['profile/', this.profile[0].userName]);
        this.authService.headMessage$.next('Votre mot de passe a bien été modifié');
      }
    ).catch(
          (error) => {           
            this.errorMsg = error.message;
          }
        );
  }

  onModifyUserName() {    
    const newUserName = this.userNameForm.get('newUserName').value;
    this.authService.modifyUserName(newUserName).then(
      (response) => {
        if (response === 'Update done') {
          this.authService.userName$.next(newUserName)
          this.router.navigate(['profile/', newUserName]);
          this.authService.headMessage$.next('Votre nom d\'utilisateur a bien été modifié');
        };
      }
    ).catch(
          (error) => {
            this.errorMsg = error.message;
          }
        );
  }

  onCancel() {
    this.notChanging = true;
    this.modPass = false;
    this.modName = false;
    this.makeSure = false;
    this.errorMsg = '';
  }
  
}


