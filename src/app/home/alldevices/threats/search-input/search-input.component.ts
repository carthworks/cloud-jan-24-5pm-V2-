import { ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.css']
})
export class SearchInputComponent implements OnInit {
  selectable = false;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER];
  chipCtrl = new FormControl();
  filteredOptions: Observable<string[]>;
  copyOfAllChips: any[] = [];
  chipPosibilities = {
    'SEVERITY': ['LOW', 'MEDIUM', 'HIGH', 'ALL'],
    'INCIDENT': ['TRUE', 'FALSE'],
    'STATUS': ['ONLINE', 'OFFLINE'],
    'ASSET TYPE': ['AWS', 'LOCAL']
  };
  @Input() chips: string[] = [];
  @Input() allChips: any[];
  @Output() queries: EventEmitter<any> = new EventEmitter();
  isTablet: boolean;
  clearConnection: Subscription = null;

  @ViewChild('chipInput') chipInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  constructor(private app: AppComponent,
    private interComm: IntercommunicationService) {

    this.filteredOptions = this.chipCtrl.valueChanges.pipe(
      startWith(null),
      map((chip: string | null) => chip ? this._filter(chip) : this.allChips.slice()));

    this.isTablet = !this.app.isSettingsDownloadEnable;
    this.interComm.setChipRemovable(this.removable);

    this.interComm.getChipRemovable().subscribe(isChipRemovable => {
      this.removable = isChipRemovable;
    });
  }

  ngOnInit() {
    this.clearConnection = this.interComm.clearSearchRes().subscribe(info => {
      this.chips = [];
      this.allChips = this.copyOfAllChips.slice();
      this.chipPosibilities = {
        'SEVERITY': ['LOW', 'MEDIUM', 'HIGH', 'ALL'],
        'INCIDENT': ['TRUE', 'FALSE'],
        'STATUS': ['ONLINE', 'OFFLINE'],
        'ASSET TYPE': ['AWS', 'LOCAL']
      }
      this.queries.emit([]);
      this.chipCtrl.setValue(null);
    });
  }

  ngAfterViewInit() {
    this.copyOfAllChips = this.allChips.slice();

    this.chips.map(chip => {
      let splittedValue = chip.split(':');
      this.checkPossibles(splittedValue);
      this.doValidationsOnAdd(splittedValue);
    });
  }

  add(event: MatChipInputEvent): void {
    localStorage.setItem('isExactMatch', 'false');
    // debugger
    // Add chip only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      let splittedValue: any[] = [];

      splittedValue = value.split(':');
      let indexOne = '' + splittedValue[1];
      let indexZero = '' + splittedValue[0];
      if (
        this.allChips.includes(indexZero) &&
        value.includes(':') && !this.chips.includes(value.trim())
      ) {
        if (indexOne.length != 0 && this.checkPossibles(splittedValue)) {
          this.doValidationsOnAdd(splittedValue);
          // Add our chip
          if ((value || '').trim()) {
            this.chips.push(value.trim());
            this.queries.emit(this.chips);
          }

          // Reset the input value
          this.clearInput(input);
        } else {
          // this.clearInput(input);
        }
      } else {
        this.clearInput(input);
      }
    }
  }

  checkPossibles(splittedValue) {
    let returnValue: boolean = true;
    switch (splittedValue[0]) {
      case 'INCIDENT':
        returnValue = this.chipPosibilities['INCIDENT'].includes(splittedValue[1])
        if (returnValue) {
          this.chipPosibilities['INCIDENT'].splice(this.chipPosibilities['INCIDENT'].indexOf(splittedValue[1]), 1);
        }
        break;
      case 'SEVERITY':
        returnValue = this.chipPosibilities['SEVERITY'].includes(splittedValue[1])
        if (returnValue) {
          this.chipPosibilities['SEVERITY'].splice(this.chipPosibilities['SEVERITY'].indexOf(splittedValue[1]), 1);
        }
        break;
      case 'STATUS':
        returnValue = this.chipPosibilities['STATUS'].includes(splittedValue[1])
        if (returnValue) {
          this.chipPosibilities['STATUS'].splice(this.chipPosibilities['STATUS'].indexOf(splittedValue[1]), 1);
        }
        break;
      case 'ASSET TYPE':
        returnValue = this.chipPosibilities['ASSET TYPE'].includes(splittedValue[1])
        if (returnValue) {
          this.chipPosibilities['ASSET TYPE'].splice(this.chipPosibilities['ASSET TYPE'].indexOf(splittedValue[1]), 1);
        }
        break;
      default:
        returnValue = true;
        break;
    }

    return returnValue;
  }

  doValidationsOnAdd(splittedValue) {
    switch (splittedValue[0]) {
      case 'INCIDENT':
        splittedValue[1] == 'TRUE' ? this.allChips.splice(this.allChips.indexOf('INCIDENT'), 1, 'SEVERITY') : this.allChips.splice(this.allChips.indexOf('INCIDENT'), 1);
        break;
      case 'SEVERITY':
        if (this.chipPosibilities['SEVERITY'].length == 0) {
          this.allChips.splice(this.allChips.indexOf('SEVERITY'), 1);
        }
        break;
      case 'STATUS':
        this.allChips.splice(this.allChips.indexOf('STATUS'), 1);
        break;
      case 'ASSET TYPE':
        this.allChips.splice(this.allChips.indexOf('ASSET TYPE'), 1);
        break;
      default:
        // console.log('no operation');
        break;
    }
  }

  doValidationsOnRemove(splittedValue) {
    switch (splittedValue[0]) {
      case 'INCIDENT':
        this.chipPosibilities['INCIDENT'].push(splittedValue[1]);
        this.allChips.indexOf('SEVERITY') != -1 ? this.allChips.splice(this.allChips.indexOf('SEVERITY'), 1, 'INCIDENT') : this.allChips.splice(6, 0, 'INCIDENT');
        this.chipCtrl.setValue(null);
        break;
      case 'SEVERITY':
        this.chipPosibilities['SEVERITY'].push(splittedValue[1]);
        if (this.chipPosibilities['SEVERITY'].length != 0) {
          if (this.allChips.indexOf('SEVERITY') == -1) {
            this.allChips.splice(6, 0, 'SEVERITY');
          }
        }
        this.chipCtrl.setValue(null);
        break;
      case 'STATUS':
        this.chipPosibilities['STATUS'].push(splittedValue[1]);
        if (this.allChips.indexOf('STATUS') == -1) {
          this.allChips.splice(6, 0, 'STATUS');
        } else {
          this.allChips.splice(this.allChips.indexOf('STATUS'), 1, 'STATUS');
        }
        this.chipCtrl.setValue(null);
        break;
      case 'ASSET TYPE':
        this.chipPosibilities['ASSET TYPE'].push(splittedValue[1]);
        if (this.allChips.indexOf('ASSET TYPE') == -1) {
          this.allChips.splice(6, 0, 'ASSET TYPE');
        } else {
          this.allChips.splice(this.allChips.indexOf('ASSET TYPE'), 1, 'ASSET TYPE');
        }
        this.chipCtrl.setValue(null);
        break;
      default:
        // console.log('no operation');
        break;
    }
  }

  clearInput(input) {
    if (input) {
      input.value = '';
    }

    this.chipCtrl.setValue(null);
  }

  remove(chip: string): void {
    this.interComm.setChipRemovable(false);

    let splittedValue: any[] = [];

    splittedValue = chip.split(':');
    let indexOne = '' + splittedValue[1];
    let indexZero = '' + splittedValue[0];

    const index = this.chips.indexOf(chip);

    if (index >= 0) {
      if (indexZero == 'INCIDENT') {
        let newChips: any[] = [];
        let tempChips: any[] = this.chips;

        tempChips.map((chip, i) => {
          let splitted = chip.split(':');
          if (splitted[0] != 'SEVERITY') {
            newChips.push(chip);
          } else if (splitted[0] == 'SEVERITY') {
            this.doValidationsOnRemove(splitted);
          }
        });
        this.chips = newChips;
        this.chips.splice(this.chips.indexOf(chip), 1);
        this.doValidationsOnRemove(splittedValue);
      } else {
        this.chips.splice(index, 1);
        this.doValidationsOnRemove(splittedValue);
      }
    } else {
      this.chipCtrl.setValue(null);
    }

    if (this.chips.length == 0) {
      this.chipInput.nativeElement.focus();
      this.queries.emit([]);
    } else {
      this.queries.emit(this.chips);
    }
  }

  clearChips() {
    this.interComm.resetChip(true);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.chipInput.nativeElement.value = `${event.option.viewValue}:`

    // this.chips.push(event.option.viewValue);
    // this.fruitInput.nativeElement.value = '';
    // this.chipCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allChips.filter(chip => chip.toLowerCase().indexOf(filterValue) === 0);
  }

  public maskSpecialChar(event) {


    let keyCode = event.charCode;
    
    let currentChip = event.target.value.split(':');

    return (
      (keyCode > 64 && keyCode < 91) ||
      (keyCode > 96 && keyCode < 123) ||
      keyCode == 8 ||
      keyCode == 46 ||
      keyCode == 32 ||
      (keyCode >= 48 && keyCode <= 57) ||
      (currentChip[0] == 'MAC ADDRESS' && keyCode == 58) ||
      (((currentChip[0] == 'CVEID') || (currentChip[0] == 'OS')) && keyCode == 45)
    );
  }

  public maskSpaceAfterColon(e) {
    if (e.target.value.length != 0 && e.target.value.includes(':')) {
      if (e.target.value.split(':')[1].length == 0 && e.keyCode == 32) {
        return false;
      }
    }
  }

  public onFocusOut(event: MatChipInputEvent) {
    if (this.isTablet) {
      setTimeout(() => {
        this.autocomplete.closePanel();
      }, 1000);
    }
  }

  ngOnDestroy() {
    this.clearConnection.unsubscribe();
  }

}
