import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Chart } from 'chart.js';
import { Datasource } from 'ngx-ui-scroll';
import { ConnectionHandler } from 'src/app/services/connectionHandler.service';
import { Subscription } from 'rxjs';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { SelectItem } from 'primeng/api';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';

@Component({
  selector: 'app-threats',
  templateUrl: './threats.component.html',
  styleUrls: ['./threats.component.css']
})
export class ThreatsComponent implements OnInit {

  threatsLoading: boolean = false;
  threatTableLoading: boolean = false;
  threatPeriods: any[] = [
    { label: 'Day', value: '1 Day', active: false, momentValue: 1, momentString: 'days' },
    { label: '7 Days', value: '7 Days', active: false, momentValue: 7, momentString: 'days' },
    { label: '30 Days', value: '30 Days', active: false, momentValue: 30, momentString: 'days' },
    { label: '90 Days', value: '90 Days', active: false, momentValue: 90, momentString: 'days' },
    /** { label: '180 Days', value: '180 Days', active: false, momentValue: 180, momentString: 'days' } */];
  customThreatPeriod: any = { label: 'Custom', value: 5, active: false };
  currentThreatPeriod: any = { label: 'Current', active: false };
  customRangeDates: Date[];
  currentThreatingPeriod: string = '';
  maxDateValue: Date = new Date();

  startAndEndTstamps: any = {
    start: 0,
    end: 0,
    period: "",
    valid: false
  }

  colors: any = {
    high: '#df5b53',
    medium: '#d28c3c',
    low: '#fdfe6b'
  };

  donutChartOptions: any;
  donutChartData: any;

  hexIcons: any = {
    '#b7708c': '/assets/dashboard/hex-red.svg',//pink
    '#7dd35c': '/assets/dashboard/hex-green.svg',//green
    '#9b9c9d': '/assets/dashboard/hex-yellow.svg',// grey
    '#3ebce0': '/assets/dashboard/hex-blue.svg', // blue
    '#df5b53': '/assets/dashboard/hex-high.svg',//red
    '#d28c3c': '/assets/dashboard/hex-medium.svg',//org
    '#fdfe6b': '/assets/dashboard/hex-low.svg'// yellow
  }

  currentSortedField: string = 'timestamp';
  sortBy: any = {
    fieldname: 'timestamp',
    order: -1
  };

  threatSource: any;
  threatConnection: Subscription = null;
  threatDataNotAvail: boolean = false;

  statusOptions: SelectItem[] = [{
    label: "Open",
    value: 0
  },
  {
    label: "Closed",
    value: 0,
    disabled: true
  },
  {
    label: "Closed to IT",
    value: 0,
    disabled: true
  }];
  selectedStatus: number = 0;

  threatConnectionGet: Subscription = null;

  attackTechniques: any[] = [];
  vulnerableOs: any[] = [];
  vulnerableApp: any[] = [];
  totalIncidents: any[] = [];
  activeIncidents: number = 0;

  div5: any;
  customerChangeEvent: Subscription = null;

  chipOptions: any[] = ['THREAT NAME', 'METHOD', 'CVEID', 'SEVERITY'];
  searchQueries: any[] = [];

  reloadTable: boolean = true;
  isCurrentDate: boolean = false;

  attackTechniquesAllOthers: any[] = [];
  osAllOthers: any[] = [];
  applicationAllOthers: any[] = [];
  constructor(private connectionHandler: ConnectionHandler,
    private socketDataService: SocketdataService,
    private InterCommService: IntercommunicationService,
    public router: Router) { }

  ngOnInit() {
    localStorage.setItem('last_loaded_screen', '/alldevices/threats');
    document.getElementById('dashboard-height-fix').style.height = '100%';

    if (localStorage.getItem('threatChipFromDashboard') == "yes") {
      let chipConfig = JSON.parse(localStorage.getItem('threatChipConfig'));
      let chips = [];
      if (chipConfig.isMultiple) {
        chipConfig.ifMultiple.map(value => {
          let chip = (`THREAT NAME:${value}`).toUpperCase();
          chips.push(chip);
        });

        if (chipConfig.chipType == 'OS') {
          let methodChip = 'METHOD:OS';
          chips.push(methodChip);
        } else if (chipConfig.chipType == 'APPLICATION') {
          let methodChip = 'METHOD:APPLICATION';
          chips.push(methodChip);
        } else if (chipConfig.chipType == 'ATTACK TYPE') {
          let methodChip = 'METHOD:SIGNATURE';
          chips.push(methodChip);
        }
      } else {
        if (chipConfig.chipType == 'INCIDENT') {
          let chip = (`SEVERITY:${chipConfig.chipValue}`).toUpperCase()
          chips.push(chip);
        } else if (chipConfig.chipType == 'OS') {
          let chip = (`THREAT NAME:${chipConfig.chipValue}`).toUpperCase();
          let methodChip = 'METHOD:OS';
          chips.push(chip);
          chips.push(methodChip);
        } else if (chipConfig.chipType == 'APPLICATION') {
          let chip = (`THREAT NAME:${chipConfig.chipValue}`).toUpperCase();
          let methodChip = 'METHOD:APPLICATION';
          chips.push(chip);
          chips.push(methodChip);
        } else if (chipConfig.chipType == 'ATTACK TYPE') {
          let chip = (`THREAT NAME:${chipConfig.chipValue}`).toUpperCase();
          let methodChip = 'METHOD:SIGNATURE';
          chips.push(chip);
          chips.push(methodChip);
        }
      }

      this.searchQueries = chips;
      localStorage.removeItem('threatChipFromDashboard');

      this.onCurrentThreatPeriod(null, false);

    } else {
      this.onCurrentThreatPeriod(null, false);
      // this.onThreatPeriodChange(null, 0, false);
    }

    this.customerChangeEvent = this.InterCommService.getheaderdropdownClicked().subscribe(change => {
      this.onCurrentThreatPeriod(null, false);
      this.InterCommService.resetChip(true);
    });

    this.threatConnectionGet = this.socketDataService.onThreatInfo().subscribe(res => {
      this.attackTechniques = [];
      this.vulnerableOs = [];
      this.vulnerableApp = [];
      this.totalIncidents = [];
      this.activeIncidents = 0;
      this.attackTechniquesAllOthers = [];
      this.osAllOthers = [];
      this.applicationAllOthers = [];

      this.prepareAttackTechniques(res['attacktechniques']);
      this.prepareTotalIncidents(res['incidentTotCnt']);
      this.prepareOs(res['vulOsInfo']);
      this.prepareApp(res['vulAppInfo']);

      this.threatsLoading = false;
    });

    this.threatSource = new Datasource({
      get: (index, count, success) => {
        let param: any = {};
        param['start'] = index;
        param['length'] = count;
        param['sortby'] = this.sortBy;
        param['start_time'] = this.startAndEndTstamps.start;
        param['end_time'] = this.startAndEndTstamps.end;
        param['searchQuery'] = this.searchQueries;
        param['isCurrentDate'] = this.startAndEndTstamps.start == null;

        this.threatTableLoading = true;
        this.connectionHandler.subscribeConnection(
          'getThreatTableInfo',
          param
        );

        this.threatConnection = this.socketDataService.onThreatTableInfo().subscribe(info => {

          this.connectionHandler.unsubscribeConnection();
          this.threatConnection.unsubscribe();

          if (info['allIncInfo'] === undefined || info['allIncInfo'].length == 0) {
            if (this.threatSource.adapter.itemsCount === 0) {
              this.threatDataNotAvail = true;
            } else {
              success([]);
            }
            this.threatTableLoading = false;
          } else {
            const allIncInfo = info['allIncInfo'];
            success(this.updateDataTableReports(allIncInfo));
            this.threatDataNotAvail = false;
            this.threatTableLoading = false;
          }
          this.InterCommService.setChipRemovable(true);
        });
      },
      settings: {
        bufferSize: 20,
        minIndex: 0,
        startIndex: 0
      }
    });
  }

  public updateDataTableReports(allIncInfo) {
    let arrayToReturn: any[] = [];

    allIncInfo.map(record => {
      record.timestamp = moment.unix(record.timestamp).format('MMM D, YYYY | HH:mm A');
      switch (record.severity) {
        case 'high':
          record.icon = '/assets/dashboard/hex-high.svg';
          break;
        case 'medium':
          record.icon = '/assets/dashboard/hex-medium.svg';
          break;
        case 'low':
          record.icon = '/assets/dashboard/hex-low.svg';
          break;
        default:
          record.icon = '/assets/dashboard/hex-high.svg';
      }
      arrayToReturn.push(record);
    })

    return arrayToReturn;
  }

  onQueries(event) {
    this.searchQueries = event;
    this.threatSource.adapter.reload(0);
  }

  public isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  prepareAttackTechniques(data) {
    if (this.isEmpty(data) || data == undefined) {
      this.attackTechniques = [];
    } else {
      Object.entries(data).forEach(([masterKey, masterValue]) => {
        let total = 0;
        Object.entries(masterValue).forEach(([key, value]) => {
          total += value;
        });
        data[masterKey]['total'] = total;
      });

      let sorted = {};
      Object.keys(data).sort(function (a, b) {
        return data[b].total - data[a].total;
      }).forEach(function (key) {
        sorted[key] = data[key];
      });

      let count = 0;
      let allOthersCount = 0;
      let tempArray: any[] = [];

      Object.entries(sorted).forEach(([masterKey, masterValue]) => {
        let tempObj: any = {};

        if (count < 3) {
          tempObj['label'] = masterKey;
          tempObj['tooltip'] = masterKey;
          tempObj['value'] = masterValue['total'];
          delete masterValue['total'];
          tempObj['elementValues'] = masterValue;

          tempArray.push(tempObj);
          count++;
        } else if (count == 3) {
          tempObj['label'] = `All Others (${++allOthersCount})`;
          tempObj['value'] = masterValue['total'];
          tempObj['tooltip'] = masterKey;
          this.attackTechniquesAllOthers.push(masterKey);

          let forAllOthers = {
            high: 0,
            medium: 0,
            low: 0
          };
          forAllOthers['high'] = masterValue['high'];
          forAllOthers['medium'] = masterValue['medium'];
          forAllOthers['low'] = masterValue['low'];
          tempObj['elementValues'] = forAllOthers;

          tempArray.push(tempObj);
          count++;
        } else {
          tempArray[3]['label'] = `All Others (${++allOthersCount})`;
          tempArray[3]['value'] += masterValue['total'];
          tempArray[3]['tooltip'] = `${tempArray[3]['tooltip']}, ${masterKey}`;
          this.attackTechniquesAllOthers.push(masterKey);

          tempArray[3]['elementValues']['high'] += masterValue['high'];
          tempArray[3]['elementValues']['medium'] += masterValue['medium'];
          tempArray[3]['elementValues']['low'] += masterValue['low'];
        }
      });

      tempArray.map(array => {
        let forChart = [];
        Object.entries(array['elementValues']).forEach(([childKey, childValue]) => {
          let dividerOrValue: any = childValue;
          let onePercentage = 100 / array['value'];
          let element = {
            label: childKey,
            value: childValue,
            color: this.colors[childKey],
            width: `${dividerOrValue * onePercentage}%`
          };
          if (childValue != 0) {
            forChart.push(element);
          }
        });
        this.attackTechniques.push({ ...array, ...{ forChart: forChart } });
      });
    }
  }

  prepareOs(data) {
    if (this.isEmpty(data)) {
      this.vulnerableOs = [];
    } else {

      data = this.consolidateGroupOs(data);

      Object.entries(data).forEach(([masterKey, masterValue]) => {
        let total = 0;
        Object.entries(masterValue).forEach(([key, value]) => {
          total += value;
        });
        data[masterKey]['total'] = total;
      });

      let sorted = {};
      Object.keys(data).sort(function (a, b) {
        return data[b].total - data[a].total;
      }).forEach(function (key) {
        sorted[key] = data[key];
      });

      let count = 0;
      let allOthersCount = 0;
      let tempArray: any[] = [];

      Object.entries(sorted).forEach(([masterKey, masterValue]) => {
        let tempObj: any = {};

        if (count < 3) {
          tempObj['label'] = masterKey;
          tempObj['tooltip'] = masterKey;
          tempObj['value'] = masterValue['total'];
          delete masterValue['total'];
          tempObj['elementValues'] = masterValue;

          tempArray.push(tempObj);
          count++;
        } else if (count == 3) {
          tempObj['label'] = `All Others (${++allOthersCount})`;
          tempObj['value'] = masterValue['total'];
          tempObj['tooltip'] = masterKey;
          this.osAllOthers.push(masterKey);

          let forAllOthers = {
            high: 0,
            medium: 0,
            low: 0
          };
          forAllOthers['high'] = masterValue['high'];
          forAllOthers['medium'] = masterValue['medium'];
          forAllOthers['low'] = masterValue['low'];
          tempObj['elementValues'] = forAllOthers;

          tempArray.push(tempObj);
          count++;
        } else {
          tempArray[3]['label'] = `All Others (${++allOthersCount})`;
          tempArray[3]['value'] += masterValue['total'];
          tempArray[3]['tooltip'] = `${tempArray[3]['tooltip']}, ${masterKey}`;
          this.osAllOthers.push(masterKey);

          tempArray[3]['elementValues']['high'] += masterValue['high'];
          tempArray[3]['elementValues']['medium'] += masterValue['medium'];
          tempArray[3]['elementValues']['low'] += masterValue['low'];
        }
      });

      tempArray.map(array => {
        let forChart = [];
        Object.entries(array['elementValues']).forEach(([childKey, childValue]) => {
          let dividerOrValue: any = childValue;
          let onePercentage = 100 / array['value'];
          let element = {
            label: childKey,
            value: childValue,
            color: this.colors[childKey],
            width: `${dividerOrValue * onePercentage}%`
          };

          if (childValue != 0) {
            forChart.push(element);
          }

        });
        this.vulnerableOs.push({ ...array, ...{ forChart: forChart } });
      });
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  consolidateGroupOs(data) {
    let validOs = ['windows', 'linux', 'mac'];
    let tempData: any = {};
    let tempWindows = {
      high: 0,
      medium: 0,
      low: 0
    };
    let tempLinux = { ...tempWindows };
    let tempMac = { ...tempWindows };
    Object.entries(data).forEach(([key, value]) => {
      if (key.toLowerCase().includes(validOs[0])) {
        tempWindows['high'] += value['high'];
        tempWindows['medium'] += value['medium'];
        tempWindows['low'] += value['low'];

        tempData['Windows'] = tempWindows;
      } else if (key.toLowerCase().includes(validOs[1])) {
        tempLinux['high'] += value['high'];
        tempLinux['medium'] += value['medium'];
        tempLinux['low'] += value['low'];

        tempData['Linux'] = tempLinux;
      } else if (key.toLowerCase().includes(validOs[2])) {
        tempMac['high'] += value['high'];
        tempMac['medium'] += value['medium'];
        tempMac['low'] += value['low'];

        tempData['Mac'] = tempMac;
      } else if (key.toLowerCase() == 'ios') {
        tempData['iOS'] = value
      } else if (key.toLowerCase() == 'arubaos') {
        tempData['ArubaOS'] = value
      } else {
        let cappedKey = this.capitalizeFirstLetter(key);
        tempData[cappedKey] = value
      }
    });

    return tempData;
  }

  prepareApp(data) {
    if (this.isEmpty(data)) {
      this.vulnerableApp = [];
    } else {
      Object.entries(data).forEach(([masterKey, masterValue]) => {
        let total = 0;
        Object.entries(masterValue).forEach(([key, value]) => {
          total += value;
        });
        data[masterKey]['total'] = total;
      });

      let sorted = {};
      Object.keys(data).sort(function (a, b) {
        return data[b].total - data[a].total;
      }).forEach(function (key) {
        sorted[key] = data[key];
      });

      let count = 0;
      let allOthersCount = 0;
      let tempArray: any[] = [];

      Object.entries(sorted).forEach(([masterKey, masterValue]) => {
        let tempObj: any = {};

        if (count < 3) {
          tempObj['label'] = masterKey;
          tempObj['tooltip'] = masterKey;
          tempObj['value'] = masterValue['total'];
          delete masterValue['total'];
          tempObj['elementValues'] = masterValue;

          tempArray.push(tempObj);
          count++;
        } else if (count == 3) {
          tempObj['label'] = `All Others (${++allOthersCount})`;
          tempObj['value'] = masterValue['total'];
          tempObj['tooltip'] = masterKey;
          this.applicationAllOthers.push(masterKey);

          let forAllOthers = {
            high: 0,
            medium: 0,
            low: 0
          };
          forAllOthers['high'] = masterValue['high'];
          forAllOthers['medium'] = masterValue['medium'];
          forAllOthers['low'] = masterValue['low'];
          tempObj['elementValues'] = forAllOthers;

          tempArray.push(tempObj);
          count++;
        } else {
          tempArray[3]['label'] = `All Others (${++allOthersCount})`;
          tempArray[3]['value'] += masterValue['total'];
          tempArray[3]['tooltip'] = `${tempArray[3]['tooltip']}, ${masterKey}`;
          this.applicationAllOthers.push(masterKey);

          tempArray[3]['elementValues']['high'] += masterValue['high'];
          tempArray[3]['elementValues']['medium'] += masterValue['medium'];
          tempArray[3]['elementValues']['low'] += masterValue['low'];
        }
      });

      tempArray.map(array => {
        let forChart = [];
        Object.entries(array['elementValues']).forEach(([childKey, childValue]) => {
          let dividerOrValue: any = childValue;
          let onePercentage = 100 / array['value'];
          let element = {
            label: childKey,
            value: childValue,
            color: this.colors[childKey],
            width: `${dividerOrValue * onePercentage}%`
          };
          if (childValue != 0) {
            forChart.push(element);
          }
        });
        this.vulnerableApp.push({ ...array, ...{ forChart: forChart } });
      });
    }
  }

  prepareTotalIncidents(data) {

    if (data['total'] == 0 || data['total'] == undefined) {
      this.totalIncidents = [];
      this.activeIncidents = 0;
      this.donutChartData = {
        labels: ['No threats'],
        datasets: [
          {
            data: [100],
            backgroundColor: ['#222E3B'],
            hoverBackgroundColor: ['#222E3B'],
            borderColor: '#10141A',
            borderWidth: 3
          }]
      };

      this.donutChartOptions = {
        for_plugin: 'threat-chart',
        elements: {
          center: {
            text: '0',
            color: '#FFFFFF',
            sidePadding: 25,
            fontStyle: 'bold'
          }
        },
        legend: {
          display: false
        },
        cutoutPercentage: 85,
        tooltips: {
          enabled: false
        }
      };

      this.donutChartOptions['elements']['center']['text'] = "0";
      this.donutChartOptions['tooltips'] = { enabled: false };

      let high = { name: 'High', value: 0, color: this.colors['high'] };
      let medium = { name: 'Medium', value: 0, color: this.colors['medium'] };
      let low = { name: 'low', value: 0, color: this.colors['low'] };
      this.totalIncidents = [...[high], ...[medium], ...[low]];

      this.div5 = document.getElementById('text5');
      this.styleTheChart(this.div5);
    } else {
      this.activeIncidents = data['total'];
      this.donutChartOptions = {
        for_plugin: 'threat-chart',
        elements: {
          center: {
            text: data['total'],
            color: '#FFFFFF',
            sidePadding: 25,
            fontStyle: 'bold'
          }
        },
        legend: {
          display: false
        },
        cutoutPercentage: 85,
        tooltips: {
          enabled: false,
          custom: function (tooltipModel) {
            var tooltipEl = document.getElementById('chartjs-tooltip');

            if (!tooltipEl) {
              tooltipEl = document.createElement('div');
              tooltipEl.id = 'chartjs-tooltip';
              tooltipEl.innerHTML = '<table></table>';
              document.body.appendChild(tooltipEl);
            }

            if (tooltipModel.opacity === 0) {
              tooltipEl.style.opacity = '0';
              return;
            }

            tooltipEl.classList.remove('above', 'below', 'no-transform');
            if (tooltipModel.yAlign) {
              tooltipEl.classList.add(tooltipModel.yAlign);
            } else {
              tooltipEl.classList.add('no-transform');
            }

            function getBody(bodyItem) {
              return bodyItem.lines;
            }

            if (tooltipModel.body) {
              var titleLines = tooltipModel.title || [];
              var bodyLines = tooltipModel.body.map(getBody);
              var innerHtml = '<thead>';

              titleLines.forEach(function (title) {
                innerHtml += '<tr><th>' + title + '</th></tr>';
              });
              innerHtml += '</thead><tbody>';

              bodyLines.forEach(function (body, i) {
                var colors = tooltipModel.labelColors[i];
                var style = 'background:' + colors.backgroundColor;
                style += '; border-color:' + colors.borderColor;
                style += '; border-width: 2px';
                var span = '<span style="' + style + '"></span>';
                innerHtml += '<tr><td>' + span + body + '</td></tr>';
              });
              innerHtml += '</tbody>';

              var tableRoot = tooltipEl.querySelector('table');
              tableRoot.innerHTML = innerHtml;
            }

            var position = this._chart.canvas.getBoundingClientRect();

            tooltipEl.style.opacity = '1';
            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
            tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
            tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
            tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
            tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
          }
        }
      };

      delete data['total'];

      let labels = [];
      let values = [];
      let colors = [];
      Object.entries(data).forEach(([key, value]) => {
        labels.push(key.toUpperCase());
        values.push(value);
        colors.push(this.colors[key])
        this.totalIncidents.push({ name: key, value: value, color: this.colors[key] });
      });

      this.donutChartData = {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            borderColor: '#10141A',
            borderWidth: 3
          }]
      };

      this.div5 = document.getElementById('text5');
      this.styleTheChart(this.div5);

    }
  }

  goToAsset(record) {
    let chipType: string = "";
    if (record['detection_method'].toLowerCase() == 'os') {
      chipType = 'OS';
    } else if (record['detection_method'].toLowerCase() == 'application') {
      chipType = 'APPLICATION';
    } else if (record['detection_method'].toLowerCase() == 'signature') {
      chipType = 'ATTACK TYPE'
    };

    let chipConfig: any = {
      chipValue: record['threatname'].toUpperCase(),
      chipType: chipType,
      isMultiple: false,
      ifMultiple: [],
      device_id: record['device_id']
    }

    localStorage.setItem('threatChipConfig', JSON.stringify(chipConfig));
    localStorage.setItem('threatChipFromDashboard', "yes");
    localStorage.setItem('isExactMatch', 'true');
    localStorage.setItem('threatChipFromThreats', "yes");
    this.router.navigate(['/alldevices/assets']);
  }

  sortReports(field) {
    if (field == this.currentSortedField) {
      this.sortBy.order = this.sortBy.order == -1 ? 1 : -1;
    } else {
      this.sortBy.fieldname = field;
      this.sortBy.order = -1;
      this.currentSortedField = field;
    }

    this.threatSource.adapter.reload(0);
  }

  onThreatPeriodChange(event, index, eventByClick) {
    this.reloadTable = eventByClick;
    this.clearReportData();
    this.threatPeriods.map((period, i) => {
      if (i == index) {
        period.active = true;
        this.calculateReportingPeriod(period);
      } else {
        period.active = false;
      }
    });

    this.customThreatPeriod.active = false;
    this.currentThreatPeriod.active = false;
  }

  clearReportData() {
    this.threatPeriods.map((period) => {
      period.active = false;
    });

    this.currentThreatingPeriod = "";

    this.startAndEndTstamps.valid = false;
    this.customRangeDates = undefined;
  }

  calculateReportingPeriod(period) {
    this.currentThreatingPeriod = ` : ${moment().subtract(period.momentValue, period.momentString).startOf('day').format('MMM DD, YYYY')} - ${moment().subtract(1, 'days').endOf('day').format('MMM DD, YYYY')}`
    this.calculateTimestamps(moment().subtract(period.momentValue, period.momentString).valueOf(), moment().subtract(1, 'days').valueOf(), period.value);
  }

  calculateTimestamps(start, end, period) {
    this.startAndEndTstamps.start = moment(start).startOf('day').valueOf() / 1000;
    this.startAndEndTstamps.end = moment(end).endOf('day').valueOf() / 1000;
    this.startAndEndTstamps.period = period;
    this.startAndEndTstamps.valid = true;

    let req = {
      start_time: this.startAndEndTstamps.start,
      end_time: this.startAndEndTstamps.end,
      isCurrentDate: this.startAndEndTstamps.start == null
    };


    this.socketDataService.getThreatInfo(req);
    if (this.reloadTable) {
      this.threatSource.adapter.reload(0);
    }
    this.threatsLoading = true;
  }

  onCustomThreatPeriod(event, eventByClick) {
    this.reloadTable = eventByClick;
    this.clearReportData();
    this.currentThreatPeriod.active = false;
    this.customThreatPeriod.active = true;

    if (this.customRangeDates != undefined) {
      this.onRangeSelect();
    }
  }

  onCurrentThreatPeriod(event, eventByClick) {
    this.reloadTable = eventByClick;
    this.clearReportData();
    this.customThreatPeriod.active = false;
    this.currentThreatPeriod.active = true;

    this.startAndEndTstamps.start = null;
    this.startAndEndTstamps.end = moment().valueOf() / 1000;
    this.currentThreatingPeriod = ` : Till ${moment().format('MMM DD, YYYY')}`;


    let req = {
      start_time: this.startAndEndTstamps.start,
      end_time: this.startAndEndTstamps.end,
      isCurrentDate: this.startAndEndTstamps.start == null
    };

    this.socketDataService.getThreatInfo(req);
    if (this.reloadTable) {
      this.threatSource.adapter.reload(0);
    }
  }

  onRangeSelect() {
    if (this.customRangeDates[1] != null) {
      this.currentThreatingPeriod = ` : ${moment(this.customRangeDates[0]).startOf('day').format('MMM DD, YYYY')} - ${moment(this.customRangeDates[1]).endOf('day').format('MMM DD, YYYY')}`
      this.calculateTimestamps(this.customRangeDates[0], this.customRangeDates[1], 'Custom');
    }
  }

  styleTheChart(div) {
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        if (chart.config.options.for_plugin == 'threat-chart') {
          let ctx = chart.chart.ctx;
          let centerConfig = chart.config.options.elements.center;
          let txt = centerConfig.text == '0' ? 'No Threats' : centerConfig.text;
          let color = centerConfig.color || '#000';
          let centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          let centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = centerConfig.text == '0' ? '15px gilroy-regular' : '35px gilroy-regular';
          ctx.fillStyle = color;
          ctx.fillText(txt, centerX, centerY);

          var width = chart.chart.width;
          var height = chart.chart.height;
          div.style.font = centerConfig.text == '0' ? '15px gilroy-regular' : '35px gilroy-regular';
          div.style.color = 'rgba(0,0,0,0)';
          div.style.userSelect = 'none';
          div.style.cursor = 'pointer';
          div.innerText = chart.options.elements.center.text;
          var r = div.getBoundingClientRect();
          div.style.left = ((width - r.width) / 2) + 7 + "px";
          div.style.top = ((height - r.height) / 2) + 5 + "px";
        }
      }
    });
  }

  vulnerableSearch(chipValue, chipType) {

    localStorage.setItem('query_with_timstamps', 'yes');
    let timeStamps = {
      start_time: this.startAndEndTstamps.start,
      end_time: this.startAndEndTstamps.end
    };
    localStorage.setItem('timestamps_for_query', JSON.stringify(timeStamps));

    let chipConfig: any = {
      chipValue: chipValue.toUpperCase(),
      chipType: chipType,
      isMultiple: chipValue.toLowerCase().includes('all others')
    }

    if (chipConfig['isMultiple']) {
      switch (chipType) {
        case 'OS':
          chipConfig['ifMultiple'] = this.osAllOthers;
          break;
        case 'APPLICATION':
          chipConfig['ifMultiple'] = this.applicationAllOthers;
          break;
        case 'ATTACK TYPE':
          chipConfig['ifMultiple'] = this.attackTechniquesAllOthers;
          break;
        default:
          chipConfig['ifMultiple'] = [];
      }
    } else {
      chipConfig['ifMultiple'] = [];
    }

    localStorage.setItem('threatChipConfig', JSON.stringify(chipConfig));
    localStorage.setItem('threatChipFromDashboard', "yes");
    this.router.navigate(['/alldevices/assets']);
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    document.getElementById('dashboard-height-fix').style.height = '70%';
    this.threatConnectionGet.unsubscribe();
    this.customerChangeEvent.unsubscribe();
  }

}
