import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RestserviceService } from '../services/restservice.service';
import { IntercommunicationService } from '../services/intercommunication.service';

import { User } from './user';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Dialog } from 'primeng/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit, OnDestroy {


  @ViewChild('regDialog') dialog: Dialog;

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event) {
    setTimeout(() => {
      this.dialog.center();
    }, 100);
  }

  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  registed = false;
  public loginUserData = <any>{};

  public msgs: any = [];
  registration_popup;
  boolean = false;
  public user = {
    username: '',
    password: ''
  };

  getCustomerConnection: Subscription = null;


  @ViewChild('usernameInp') usernameInp: ElementRef;
  @ViewChild('passwordInp') passwordInp: ElementRef;

  public username;
  public password;

  public loginError = '';
  public useremail;
  public userpassword;
  setting_values: any = [];
  details: any = [];
  Current_customer_id: any;
  model: any = {};
  country_list: any = [];

  type1 = 'password';
  show = false;

  constructor(
    private restService: RestserviceService,
    public http: HttpClient,
    public router: Router,
    public intercomm: IntercommunicationService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private socketdataService: SocketdataService,
    private spinner: NgxSpinnerService
  ) { }

  captchaa: any;

  resolved(captchaResponse: string) {
    this.captchaa = captchaResponse;
    // console.log(`Resolved captcha with response ${captchaResponse}:`);
  }

  ngOnInit() {
    localStorage.clear();

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      name: [
        '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(/^(?!\s)[a-zA-Z ]+$/)
          ],
          updateOn: 'blur'
        }
      ],

      description: [
        '',
        {
          validators: [Validators.maxLength(50), Validators.pattern(/^(?!\s)/)],
          updateOn: 'blur'
        }
      ],

      website: [
        '',
        {
          validators: [
            Validators.maxLength(50),
            Validators.pattern(
              '(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,})'
            )
          ],
          updateOn: 'blur'
        }
      ],

      streetaddress: [
        '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(/^(?!\s)/)
          ],
          updateOn: 'blur'
        }
      ],

      locality: [
        '',
        {
          validators: [Validators.required, Validators.pattern(/^\S*$/), Validators.maxLength(50)],
          updateOn: 'blur'
        }
      ],

      country: ['', { validators: [Validators.required], updateOn: 'blur' }],

      postalcode: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.minLength(5),
            Validators.maxLength(50)
          ],
          updateOn: 'blur'
        }
      ],

      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
            Validators.maxLength(254)
          ],
          updateOn: 'blur'
        }
      ],

      phoneno: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.minLength(6),
            Validators.maxLength(20)
          ],
          updateOn: 'blur'
        }
      ]
    });

    this.country_list = [
      { name: 'United States', code: 'US' },
      { name: 'Afghanistan', code: 'AF' },
      { name: 'Aland Islands', code: 'AX' },
      { name: 'Albania', code: 'AL' },
      { name: 'Algeria', code: 'DZ' },
      { name: 'American Samoa', code: 'AS' },
      { name: 'AndorrA', code: 'AD' },
      { name: 'Angola', code: 'AO' },
      { name: 'Anguilla', code: 'AI' },
      { name: 'Antarctica', code: 'AQ' },
      { name: 'Antigua and Barbuda', code: 'AG' },
      { name: 'Argentina', code: 'AR' },
      { name: 'Armenia', code: 'AM' },
      { name: 'Aruba', code: 'AW' },
      { name: 'Australia', code: 'AU' },
      { name: 'Austria', code: 'AT' },
      { name: 'Azerbaijan', code: 'AZ' },
      { name: 'Bahamas', code: 'BS' },
      { name: 'Bahrain', code: 'BH' },
      { name: 'Bangladesh', code: 'BD' },
      { name: 'Barbados', code: 'BB' },
      { name: 'Belarus', code: 'BY' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Belize', code: 'BZ' },
      { name: 'Benin', code: 'BJ' },
      { name: 'Bermuda', code: 'BM' },
      { name: 'Bhutan', code: 'BT' },
      { name: 'Bolivia', code: 'BO' },
      { name: 'Bosnia and Herzegovina', code: 'BA' },
      { name: 'Botswana', code: 'BW' },
      { name: 'Bouvet Island', code: 'BV' },
      { name: 'Brazil', code: 'BR' },
      { name: 'British Indian Ocean Territory', code: 'IO' },
      { name: 'Brunei Darussalam', code: 'BN' },
      { name: 'Bulgaria', code: 'BG' },
      { name: 'Burkina Faso', code: 'BF' },
      { name: 'Burundi', code: 'BI' },
      { name: 'Cambodia', code: 'KH' },
      { name: 'Cameroon', code: 'CM' },
      { name: 'Canada', code: 'CA' },
      { name: 'Cape Verde', code: 'CV' },
      { name: 'Cayman Islands', code: 'KY' },
      { name: 'Central African Republic', code: 'CF' },
      { name: 'Chad', code: 'TD' },
      { name: 'Chile', code: 'CL' },
      { name: 'China', code: 'CN' },
      { name: 'Christmas Island', code: 'CX' },
      { name: 'Cocos (Keeling) Islands', code: 'CC' },
      { name: 'Colombia', code: 'CO' },
      { name: 'Comoros', code: 'KM' },
      { name: 'Congo', code: 'CG' },
      { name: 'Congo, The Democratic Republic of the', code: 'CD' },
      { name: 'Cook Islands', code: 'CK' },
      { name: 'Costa Rica', code: 'CR' },
      { name: 'Cote D"Ivoire', code: 'CI' },
      { name: 'Croatia', code: 'HR' },
      { name: 'Cuba', code: 'CU' },
      { name: 'Cyprus', code: 'CY' },
      { name: 'Czech Republic', code: 'CZ' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Djibouti', code: 'DJ' },
      { name: 'Dominica', code: 'DM' },
      { name: 'Dominican Republic', code: 'DO' },
      { name: 'Ecuador', code: 'EC' },
      { name: 'Egypt', code: 'EG' },
      { name: 'El Salvador', code: 'SV' },
      { name: 'Equatorial Guinea', code: 'GQ' },
      { name: 'Eritrea', code: 'ER' },
      { name: 'Estonia', code: 'EE' },
      { name: 'Ethiopia', code: 'ET' },
      { name: 'Falkland Islands (Malvinas)', code: 'FK' },
      { name: 'Faroe Islands', code: 'FO' },
      { name: 'Fiji', code: 'FJ' },
      { name: 'Finland', code: 'FI' },
      { name: 'France', code: 'FR' },
      { name: 'French Guiana', code: 'GF' },
      { name: 'French Polynesia', code: 'PF' },
      { name: 'French Southern Territories', code: 'TF' },
      { name: 'Gabon', code: 'GA' },
      { name: 'Gambia', code: 'GM' },
      { name: 'Georgia', code: 'GE' },
      { name: 'Germany', code: 'DE' },
      { name: 'Ghana', code: 'GH' },
      { name: 'Gibraltar', code: 'GI' },
      { name: 'Greece', code: 'GR' },
      { name: 'Greenland', code: 'GL' },
      { name: 'Grenada', code: 'GD' },
      { name: 'Guadeloupe', code: 'GP' },
      { name: 'Guam', code: 'GU' },
      { name: 'Guatemala', code: 'GT' },
      { name: 'Guernsey', code: 'GG' },
      { name: 'Guinea', code: 'GN' },
      { name: 'Guinea-Bissau', code: 'GW' },
      { name: 'Guyana', code: 'GY' },
      { name: 'Haiti', code: 'HT' },
      { name: 'Heard Island and Mcdonald Islands', code: 'HM' },
      { name: 'Holy See (Vatican City State)', code: 'VA' },
      { name: 'Honduras', code: 'HN' },
      { name: 'Hong Kong', code: 'HK' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Iceland', code: 'IS' },
      { name: 'India', code: 'IN' },
      { name: 'Indonesia', code: 'ID' },
      { name: 'Iran, Islamic Republic Of', code: 'IR' },
      { name: 'Iraq', code: 'IQ' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Isle of Man', code: 'IM' },
      { name: 'Israel', code: 'IL' },
      { name: 'Italy', code: 'IT' },
      { name: 'Jamaica', code: 'JM' },
      { name: 'Japan', code: 'JP' },
      { name: 'Jersey', code: 'JE' },
      { name: 'Jordan', code: 'JO' },
      { name: 'Kazakhstan', code: 'KZ' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Kiribati', code: 'KI' },
      { name: 'Korea, Democratic People"S Republic of', code: 'KP' },
      { name: 'Korea, Republic of', code: 'KR' },
      { name: 'Kuwait', code: 'KW' },
      { name: 'Kyrgyzstan', code: 'KG' },
      { name: 'Lao People"S Democratic Republic', code: 'LA' },
      { name: 'Latvia', code: 'LV' },
      { name: 'Lebanon', code: 'LB' },
      { name: 'Lesotho', code: 'LS' },
      { name: 'Liberia', code: 'LR' },
      { name: 'Libyan Arab Jamahiriya', code: 'LY' },
      { name: 'Liechtenstein', code: 'LI' },
      { name: 'Lithuania', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Macao', code: 'MO' },
      { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
      { name: 'Madagascar', code: 'MG' },
      { name: 'Malawi', code: 'MW' },
      { name: 'Malaysia', code: 'MY' },
      { name: 'Maldives', code: 'MV' },
      { name: 'Mali', code: 'ML' },
      { name: 'Malta', code: 'MT' },
      { name: 'Marshall Islands', code: 'MH' },
      { name: 'Martinique', code: 'MQ' },
      { name: 'Mauritania', code: 'MR' },
      { name: 'Mauritius', code: 'MU' },
      { name: 'Mayotte', code: 'YT' },
      { name: 'Mexico', code: 'MX' },
      { name: 'Micronesia, Federated States of', code: 'FM' },
      { name: 'Moldova, Republic of', code: 'MD' },
      { name: 'Monaco', code: 'MC' },
      { name: 'Mongolia', code: 'MN' },
      { name: 'Montenegro', code: 'ME' },
      { name: 'Montserrat', code: 'MS' },
      { name: 'Morocco', code: 'MA' },
      { name: 'Mozambique', code: 'MZ' },
      { name: 'Myanmar', code: 'MM' },
      { name: 'Namibia', code: 'NA' },
      { name: 'Nauru', code: 'NR' },
      { name: 'Nepal', code: 'NP' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'Netherlands Antilles', code: 'AN' },
      { name: 'New Caledonia', code: 'NC' },
      { name: 'New Zealand', code: 'NZ' },
      { name: 'Nicaragua', code: 'NI' },
      { name: 'Niger', code: 'NE' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'Niue', code: 'NU' },
      { name: 'Norfolk Island', code: 'NF' },
      { name: 'Northern Mariana Islands', code: 'MP' },
      { name: 'Norway', code: 'NO' },
      { name: 'Oman', code: 'OM' },
      { name: 'Pakistan', code: 'PK' },
      { name: 'Palau', code: 'PW' },
      { name: 'Palestinian Territory, Occupied', code: 'PS' },
      { name: 'Panama', code: 'PA' },
      { name: 'Papua New Guinea', code: 'PG' },
      { name: 'Paraguay', code: 'PY' },
      { name: 'Peru', code: 'PE' },
      { name: 'Philippines', code: 'PH' },
      { name: 'Pitcairn', code: 'PN' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Puerto Rico', code: 'PR' },
      { name: 'Qatar', code: 'QA' },
      { name: 'Reunion', code: 'RE' },
      { name: 'Romania', code: 'RO' },
      { name: 'Russian Federation', code: 'RU' },
      { name: 'RWANDA', code: 'RW' },
      { name: 'Saint Helena', code: 'SH' },
      { name: 'Saint Kitts and Nevis', code: 'KN' },
      { name: 'Saint Lucia', code: 'LC' },
      { name: 'Saint Pierre and Miquelon', code: 'PM' },
      { name: 'Saint Vincent and the Grenadines', code: 'VC' },
      { name: 'Samoa', code: 'WS' },
      { name: 'San Marino', code: 'SM' },
      { name: 'Sao Tome and Principe', code: 'ST' },
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'Senegal', code: 'SN' },
      { name: 'Serbia', code: 'RS' },
      { name: 'Seychelles', code: 'SC' },
      { name: 'Sierra Leone', code: 'SL' },
      { name: 'Singapore', code: 'SG' },
      { name: 'Slovakia', code: 'SK' },
      { name: 'Slovenia', code: 'SI' },
      { name: 'Solomon Islands', code: 'SB' },
      { name: 'Somalia', code: 'SO' },
      { name: 'South Africa', code: 'ZA' },
      { name: 'South Georgia and the South Sandwich Islands', code: 'GS' },
      { name: 'Spain', code: 'ES' },
      { name: 'Sri Lanka', code: 'LK' },
      { name: 'Sudan', code: 'SD' },
      { name: 'Suriname', code: 'SR' },
      { name: 'Svalbard and Jan Mayen', code: 'SJ' },
      { name: 'Swaziland', code: 'SZ' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Switzerland', code: 'CH' },
      { name: 'Syrian Arab Republic', code: 'SY' },
      { name: 'Taiwan, Province of China', code: 'TW' },
      { name: 'Tajikistan', code: 'TJ' },
      { name: 'Tanzania, United Republic of', code: 'TZ' },
      { name: 'Thailand', code: 'TH' },
      { name: 'Timor-Leste', code: 'TL' },
      { name: 'Togo', code: 'TG' },
      { name: 'Tokelau', code: 'TK' },
      { name: 'Tonga', code: 'TO' },
      { name: 'Trinidad and Tobago', code: 'TT' },
      { name: 'Tunisia', code: 'TN' },
      { name: 'Turkey', code: 'TR' },
      { name: 'Turkmenistan', code: 'TM' },
      { name: 'Turks and Caicos Islands', code: 'TC' },
      { name: 'Tuvalu', code: 'TV' },
      { name: 'Uganda', code: 'UG' },
      { name: 'Ukraine', code: 'UA' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'United States', code: 'US' },
      { name: 'United States Minor Outlying Islands', code: 'UM' },
      { name: 'Uruguay', code: 'UY' },
      { name: 'Uzbekistan', code: 'UZ' },
      { name: 'Vanuatu', code: 'VU' },
      { name: 'Venezuela', code: 'VE' },
      { name: 'Viet Nam', code: 'VN' },
      { name: 'Virgin Islands, British', code: 'VG' },
      { name: 'Virgin Islands, U.S.', code: 'VI' },
      { name: 'Wallis and Futuna', code: 'WF' },
      { name: 'Western Sahara', code: 'EH' },
      { name: 'Yemen', code: 'YE' },
      { name: 'Zambia', code: 'ZM' },
      { name: 'Zimbabwe', code: 'ZW' }
    ];
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
  get e() {
    return this.registerForm.controls;
  }


  toggleShow() {
    this.show = !this.show;
    if (this.show) {
      this.type1 = 'text';
    } else {
      this.type1 = 'password';
    }
  }

  usernameKeyDown() {
    this.submitted = false;
    this.loginForm.controls['username'].setValue(this.usernameInp.nativeElement.value)
  }

  passwordKeyDown() {
    this.submitted = false;
    this.loginForm.controls['password'].setValue(this.passwordInp.nativeElement.value);
  }

  onSubmit() {

    const username = this.usernameInp.nativeElement.value;
    const password = this.passwordInp.nativeElement.value;

    this.loginForm.controls['username'].setValue(username);
    this.loginForm.controls['password'].setValue(password);

    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.user['username'] = this.f.username.value;
    this.user['password'] = this.f.password.value;
    this.loading = true;
    this.restService.login(this.user).then(
      user => {

        if (!localStorage.getItem('loginTime')) {
          localStorage.setItem('loginTime', String(new Date().getTime() / 1000));
        }

        localStorage.setItem('token', user['TOKEN']);
        localStorage.setItem('version', user['VERSION']);
        localStorage.setItem('isLoggged', 'true');
        localStorage.setItem('customer_id', user['customer_id']); // admin
        localStorage.setItem('customer_name', user['customer_name']);
        localStorage.setItem('setting_customer_id', user['customer_id']);
        localStorage.setItem('first_time_login', user['isNewUser']);
        localStorage.setItem('old_password', btoa(this.f.password.value));
        localStorage.setItem('ROLE', user['ROLE']);

        var parameter = { token: localStorage.getItem('token'), customer_id: user['customer_id'] };

        this.socketdataService.setCustomerList(parameter);

        this.getCustomerConnection = this.socketdataService.getCustomerList().subscribe((info: any) => {
          this.getCustomerConnection.unsubscribe();
          this.setting_values = [];

          info.map(customer => {
            var cust = {};
            cust['id'] = customer['customer_id'];
            cust['license'] = customer['license'];
            cust['name'] = customer["customer_name"];
            // localStorage.setItem('cust', btoa(JSON.stringify(cust)));
            // this.array.push(JSON.parse(atob(localStorage.getItem('cust'))));
            this.setting_values.push(cust);
          });

          this.Current_customer_id = '';
          if (localStorage.getItem('setting_customer_id') == '0') {
            localStorage.setItem('customer_id_host', this.setting_values[0].id);
            localStorage.setItem('customer_id', this.setting_values[0].id);
            this.prepareCollecterOptions(this.setting_values[0]);
          } else {
            localStorage.setItem('customer_id_host', user['customer_id']);
            this.prepareCollecterOptions(this.setting_values[0]);
          }

          this.intercomm.isLoginDetails(true);
          this.loading = false;
          this.router.navigate(['/alldevices']);
        });
      },
      user => {
        this.loading = false;
        this.toastr.error(user.error['ERROR'], 'Login failed');
      }
    );
  }

  prepareCollecterOptions(user) {
    let collecters = [{ label: "All", value: "all" }];
    for (var key in user['license']) {
      if (user['license'].hasOwnProperty(key)) {
        collecters.push({ label: user['license'][key], value: key });
      }
    }

    localStorage.setItem('selected_collecter', collecters[0]['value']);
  }

  public noWhitespaceValidator(name: FormControl) {
    const isWhitespace = (name.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  onChange(e) {
    // console.log(e.value.name)
  }

  details_update() {
    this.registed = true;
    if (this.registerForm.invalid) {
      return;
    }

    this.spinner.show();
    var reg = {
      org_name: this.model.name,
      org_email: this.model.email,
      org_description: this.model.description || '',
      org_website: this.model.website || '',
      org_street_address: this.model.streetaddress,
      org_address_locality: this.model.locality,
      org_country_locality: this.model.country.name,
      org_postal_code: this.model.postalcode,
      org_mobile_number: this.model.phoneno
    };
    this.restService.add_customer(reg).then(
      data => {
        this.spinner.hide();
        this.toastr.success('Registration complete.Please check your inbox to proceed further.');
        this.registration_popup = false;
        this.close_reg();
      },
      err => {
        this.spinner.hide();
        this.toastr.error(err.error.ERROR);
      }
    );
  }

  regitration() {
    this.registration_popup = true;
  }

  close_reg() {
    this.submitted = false;
    this.registed = false;
    this.registration_popup = false;
    this.model.name = '';
    this.model.description = '';
    this.model.website = '';
    this.model.streetaddress = '';
    this.model.locality = '';
    this.model.country = '';
    this.model.postalcode = '';
    this.model.email = '';
    this.model.phoneno = '';
  }

  ngOnDestroy() {
    this.registed = false;
  }
}
