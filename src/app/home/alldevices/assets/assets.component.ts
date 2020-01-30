import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ConnectionHandler } from 'src/app/services/connectionHandler.service';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { Router } from '@angular/router';
import { Datasource } from 'ngx-ui-scroll';
import * as moment from 'moment';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  searchQueries: any[] = [];
  customerChangeEvent: Subscription = null;
  tableRefreshOnUpdate: Subscription = null;
  assetConnectionGet: Subscription = null;
  assetConnection: Subscription = null;

  hexIcons: any = {
    '#b7708c': '/assets/dashboard/hex-red.svg',//pink
    '#7dd35c': '/assets/dashboard/hex-green.svg',//green
    '#9b9c9d': '/assets/dashboard/hex-yellow.svg',// grey
    '#3ebce0': '/assets/dashboard/hex-blue.svg', // blue
    '#df5b53': '/assets/dashboard/hex-high.svg',//red
    '#d28c3c': '/assets/dashboard/hex-medium.svg',//org
    '#fdfe6b': '/assets/dashboard/hex-low.svg'// yellow
  };
  colorUncateg: string = '#9b9c9d';
  fixedChartColors: any[] = ['#b7708c', '#7dd35c', '#3ebce0', '#9b9c9d'];

  assetsLoading: boolean = false;
  assetTableLoading: boolean = false;
  assetDataNotAvail: boolean = false;

  assetSource: any;
  sortBy: any = {
    fieldname: 'host_name',
    order: -1
  };
  currentSortedField: string = 'host_name';

  startAndEndTstamps: any = {
    start: 0,
    end: 0,
    period: "",
    valid: false
  }
  reloadTable: boolean = true;
  assetPeriods: any[] = [
    { label: 'Day', value: '1 Day', active: false, momentValue: 1, momentString: 'days' },
    { label: '7 Days', value: '7 Days', active: false, momentValue: 7, momentString: 'days' },
    { label: '30 Days', value: '30 Days', active: false, momentValue: 30, momentString: 'days' },
    { label: '90 Days', value: '90 Days', active: false, momentValue: 90, momentString: 'days' },
    /** { label: '180 Days', value: '180 Days', active: false, momentValue: 180, momentString: 'days' } */];
  customAssetPeriod: any = { label: 'Custom', value: 5, active: false };
  currentAssetPeriod: any = { label: 'Current', active: false };
  currentAssetingPeriod: string = '';
  customRangeDates: Date[];
  maxDateValue: Date = new Date();
  chipOptions: any[] = [
    'HOST NAME',
    'DEVICE IP',
    'MAC ADDRESS',
    'DEVICE TYPE',
    'OS',
    'VENDOR',
    'INCIDENT',
    'STATUS',
    'ASSET TYPE',
    'APPLICATION',
    'ATTACK TYPE',
    'MODEL',
    'SSID'
  ];

  topDevice: any[] = [];
  topDeviceChart: any = {};
  topDeviceChartOptions: any = {};
  topDeviceAllOthers: any[] = [];

  topOS: any[] = [];
  topOSChart: any = {};
  topOSChartOptions: any = {};
  topOSAllOthers: any[] = [];

  topOnline: any[] = [];
  topOnlineChart: any = {};
  topOnlineChartOptions: any = {};
  topOnlineAllOthers: any[] = [];

  div6: any;
  div7: any;
  div8: any;

  levelTwoTiles: any[] = [];
  levelThreeTiles: any[] = [];
  breadCrumbs: any[] = [{ name: 'ASSETS' }];

  sortOptions: any[] = [
    { label: 'A-Z', value: 0 },
    { label: 'Z-A', value: 1 },
    // { label: 'Low to high', value: 2 },
    // { label: 'High to low', value: 3 }
  ];
  selectedSortOption: any = 0;

  totDevBool: boolean = true;
  onlineDevBool: boolean = true;
  osInfoBool: boolean = true;

  currentDevQuery: any[] = [];
  extraParam = {};
  onlineCount: number = 0;
  totalCount: number = 0;

  showSort: boolean = false;
  constructor(private connectionHandler: ConnectionHandler,
    private socketDataService: SocketdataService,
    private InterCommService: IntercommunicationService,
    public router: Router) {
  }

  ngOnInit() {
    localStorage.setItem('last_loaded_screen', '/alldevices/assets');
    document.getElementById('dashboard-height-fix').style.height = '100%';

    if (localStorage.getItem('threatChipFromDashboard') == "yes") {
      let chipConfig = JSON.parse(localStorage.getItem('threatChipConfig'));

      this.extraParam = {};
      this.extraParam['queryWithTime'] = localStorage.getItem('query_with_timstamps') == 'yes';

      if (this.extraParam['queryWithTime']) {
        let ts = JSON.parse(localStorage.getItem('timestamps_for_query'));
        this.extraParam['start_time'] = ts['start_time'];
        this.extraParam['end_time'] = ts['end_time'];
      }

      this.searchQueries = this.buildQueries(chipConfig);
      localStorage.removeItem('threatChipFromDashboard');

      if (chipConfig['chipType'] == 'DISCOVERED' && chipConfig['chipValue'] == 'ALL') {
        this.prepareBreadCrumb(2, null);
        this.totDevBool = true;
        this.osInfoBool = false;
        this.onlineDevBool = false;

        this.onCurrentAssetPeriod(null, false);
      } else if (chipConfig['chipType'] == 'DISCOVERED' && chipConfig['chipValue'] != 'ALL') {
        this.prepareBreadCrumb(3, chipConfig['chipValue']);
        this.currentDevQuery = [];
        if (chipConfig['isMultiple']) {
          this.currentDevQuery = chipConfig['ifMultiple'];
        } else {
          this.currentDevQuery.push(chipConfig['chipValue']);
        }

        this.totDevBool = false;
        this.osInfoBool = true;
        this.onlineDevBool = false;

        this.onCurrentAssetPeriod(null, false);
      } else {
        this.reqLevelOneInfo(false);
      }
    } else {
      this.reqLevelOneInfo(false);
    }

    this.customerChangeEvent = this.InterCommService.getheaderdropdownClicked().subscribe(change => {
      this.reqLevelOneInfo(false);
      this.InterCommService.resetChip(true);
    });

    this.tableRefreshOnUpdate = this.InterCommService.GetDeviceDetailsPopup().subscribe(isUpdated => {
      if (isUpdated) {
        if (localStorage.getItem('currentRow') != null) {
          if (this.assetSource.adapter.itemsCount > 0) {
            this.assetSource.adapter.reload(parseInt(localStorage.getItem('currentRow')));
          }
        }
      }
    });

    this.assetConnectionGet = this.socketDataService.getAllDeviceData().subscribe(res => {
      this.showSort = false;
      if (this.totDevBool && this.osInfoBool && this.onlineDevBool) {
        this.totalCount = res['totDevCnt'];
        this.onlineCount = res['onlineDevCnt'];
        this.prepareTopDevice(res['totDevInfo'], res['totDevCnt']);
        this.prepareTopOS(res['totDevOsInfo'], res['totDevOsCnt']);
        this.prepareTopOnline(res['onlineDevInfo'], res['onlineDevCnt']);
      } else if (this.totDevBool) {
        this.levelTwoTiles = [];

        for (let key in res['totDevInfo']) {
          if (res['totDevInfo'].hasOwnProperty(key)) {
            let name = key;
            let count = res['totDevInfo'][key];
            if (count > 0) {
              this.levelTwoTiles.push({ name: name, count: count });
            }
          }
        }

        this.showSort = this.levelTwoTiles.length != 0;

        this.sortTiles();
      } else if (this.osInfoBool) {
        this.levelThreeTiles = [];

        for (let key in res['totDevOsInfo']) {
          if (res['totDevOsInfo'].hasOwnProperty(key)) {
            let name = key;
            let count = res['totDevOsInfo'][key];
            if (count > 0) {
              this.levelThreeTiles.push({ name: name, count: count });
            }
          }
        }

        this.showSort = this.levelThreeTiles.length != 0;

        this.sortTiles();
      }

      this.assetsLoading = false;
    });

    this.assetSource = new Datasource({
      get: (index, count, success) => {
        let threatQT: boolean = localStorage.getItem('query_with_timstamps') == 'yes';
        let threatSpecial: boolean = localStorage.getItem('threatChipFromThreats') == 'yes';
        let param: any = {};

        if (threatSpecial) {
          let chipConfig = JSON.parse(localStorage.getItem('threatChipConfig'));
          param['device_id'] = chipConfig['device_id'];
        };

        param['start'] = index;
        param['length'] = count;
        param['sortby'] = this.sortBy;
        param['searchQuery'] = this.searchQueries;
        param['threatQT'] = threatQT;
        param['start_time'] = threatQT ? this.extraParam['start_time'] : this.startAndEndTstamps.start;
        param['end_time'] = threatQT ? this.extraParam['end_time'] : this.startAndEndTstamps.end;

        this.assetTableLoading = true;
        this.socketDataService.requestSearchResults(param);

        this.assetConnection = this.socketDataService.getSearchResults().subscribe(info => {

          this.assetConnection.unsubscribe();

          if (info['data'] === undefined || info['data'].length == 0) {
            if (this.assetSource.adapter.itemsCount === 0) {
              this.assetDataNotAvail = true;
            } else {
              success([]);
            }
            this.assetTableLoading = false;
          } else {
            const allIncInfo = info['data'];
            success(this.updateDataTableReports(allIncInfo));
            // success([]);
            this.assetDataNotAvail = false;
            this.assetTableLoading = false;
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

  clearSomeLogics() {
    localStorage.removeItem('query_with_timstamps');
    localStorage.removeItem('threatChipFromThreats');
  }

  buildQueries(chipConfig) {
    let chips = [];
    switch (chipConfig.chipType) {
      case 'INCIDENT':
        chips.push('INCIDENT:TRUE');
        chips.push('SEVERITY:' + chipConfig.chipValue);
        break;
      case 'OS':
        if (chipConfig.isMultiple) {
          chips.push('INCIDENT:TRUE');
          chipConfig.ifMultiple.map(chip => {
            chips.push('OS:' + chip.toUpperCase());
          });
        } else {
          chips.push('INCIDENT:TRUE');
          chips.push('OS:' + chipConfig.chipValue);
        }
        break;
      case 'APPLICATION':
        if (chipConfig.isMultiple) {
          chips.push('INCIDENT:TRUE');
          chipConfig.ifMultiple.map(chip => {
            chips.push('APPLICATION:' + chip.toUpperCase());
          });
        } else {
          chips.push('INCIDENT:TRUE');
          chips.push('APPLICATION:' + chipConfig.chipValue);
        }
        break;
      case 'ATTACK TYPE':
        if (chipConfig.chipValue == 'NETWORK SERVICE SCANNING') {
          chips.push('ATTACK TYPE:' + 'NSS');
        } else if (chipConfig.isMultiple) {
          chipConfig.ifMultiple.map(chip => {
            chips.push('ATTACK TYPE:' + chip.toUpperCase());
          });
        } else {
          chips.push('ATTACK TYPE:' + chipConfig.chipValue);
        }
        break;
      case 'MITRE TYPE':
        if (chipConfig.chipValue == 'USER TO ROOT') {
          chips.push('MITRE TYPE:' + 'U2R');
        } else if (chipConfig.chipValue == 'REMOTE TO LOCAL') {
          chips.push('MITRE TYPE:' + 'R2L');
        } else {
          chips.push('MITRE TYPE:' + chipConfig.chipValue);
        }
        break;
      case 'DEVICE TYPE':
        chips.push('INCIDENT:TRUE');
        chips.push('DEVICE TYPE:' + chipConfig.chipValue);
        break;
      case 'DISCOVERED':
        if (chipConfig.isMultiple) {
          chipConfig.ifMultiple.map(chip => {
            chips.push('DEVICE TYPE:' + chip);
          });
        } else {
          chips.push('DEVICE TYPE:' + chipConfig.chipValue);
        }
        break;
      case 'OPERATINGSYSTEM':
        if (chipConfig.isMultiple) {
          chipConfig.ifMultiple.map(chip => {
            chips.push('OS:' + chip);
          });
        } else {
          chips.push('OS:' + chipConfig.chipValue);
        }
        break;
      default:
        if (chipConfig.isMultiple) {
          chipConfig.ifMultiple.map(chip => {
            chips.push('DEVICE TYPE:' + chip);
          });
          if (chipConfig.chipType.toUpperCase() == 'ONLINE') {
            chips.push('STATUS:ONLINE');
          } else if (chipConfig.chipType.toUpperCase() == 'INCIDENT') {
            chips.push('INCIDENT:TRUE');
          }
        } else {
          chips.push('DEVICE TYPE:' + chipConfig.chipValue);
          if (chipConfig.chipType.toUpperCase() == 'ONLINE') {
            chips.push('STATUS:ONLINE');
          } else if (chipConfig.chipType.toUpperCase() == 'INCIDENT') {
            chips.push('INCIDENT:TRUE');
          }
        }
        break;
    }

    return chips;
  }

  sortTiles() {
    if (this.selectedSortOption == 0) {
      this.levelTwoTiles.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
      this.levelThreeTiles.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    } else if (this.selectedSortOption == 1) {
      this.levelTwoTiles.sort((a, b) => (a.name < b.name) ? 1 : ((b.name < a.name) ? -1 : 0));
      this.levelThreeTiles.sort((a, b) => (a.name < b.name) ? 1 : ((b.name < a.name) ? -1 : 0));
    } else if (this.selectedSortOption == 2) {
      this.levelTwoTiles.sort((a, b) => a.count - b.count);
      this.levelThreeTiles.sort((a, b) => a.count - b.count);
    } else if (this.selectedSortOption == 3) {
      this.levelTwoTiles.sort((a, b) => b.count - a.count);
      this.levelThreeTiles.sort((a, b) => b.count - a.count);
    }
  }

  prepareTopDevice(param, totalCnt) {
    this.topDevice = [];
    if (this.isEmpty(param)) {
      this.topDevice = [];
    } else {
      let temp: any[] = [];
      for (let key in param) {
        if (param.hasOwnProperty(key)) {
          let name = key;
          let count = param[key];
          if (count > 0) {
            temp.push({ name: name, count: count });
          }
        }
      }

      this.topDevice = temp;

      let consolidatedDiscovered: any[] = [];
      let colorIndex = 0;
      let names: any[] = [];
      let counts: any[] = [];
      let colors: any[] = [];
      let uncategorizedHolder: any = null;

      temp.sort(function (a, b) {
        return b.count - a.count;
      });

      temp.map((child, i) => {
        if (child.name.toLowerCase() == 'uncategorized') {
          uncategorizedHolder = {};
          uncategorizedHolder = temp.splice(i, 1)[0];
          uncategorizedHolder.color = this.colorUncateg;
        }
      });

      let dynaLen = temp.length == 3 ? 3 : 2;

      for (let i in temp) {
        if (parseInt(i) < dynaLen) {
          names.push(temp[i].name);
          counts.push(temp[i].count);
          consolidatedDiscovered.push(temp[i]);

          colors.push(this.fixedChartColors[colorIndex]);
          consolidatedDiscovered[i].color = this.fixedChartColors[colorIndex];
          colorIndex++;
        } else {
          if (parseInt(i) == dynaLen) {
            let forOthers: any = { others: [], tooltip: '' };
            names[i] = temp[i].name;
            counts.push(temp[i].count);
            consolidatedDiscovered.push({ ...forOthers, ...temp[i] });
            consolidatedDiscovered[i].name = `All Others (1)`;
            this.topDeviceAllOthers = consolidatedDiscovered[i].name;
            consolidatedDiscovered[i].tooltip = temp[i].name;
            consolidatedDiscovered[i].others.push(temp[i].name);

            colors.push(this.fixedChartColors[colorIndex]);
            consolidatedDiscovered[i].color = this.fixedChartColors[colorIndex];
          } else {
            counts[dynaLen] += temp[i].count;
            names[dynaLen] = `${names[dynaLen]}, ${temp[i].name}`;
            let allOthersCount = names[dynaLen].split(',').length;
            consolidatedDiscovered[dynaLen].name = `All Others (${allOthersCount})`;
            this.topDeviceAllOthers = consolidatedDiscovered[dynaLen].name;
            consolidatedDiscovered[dynaLen].count = consolidatedDiscovered[dynaLen].count + temp[i].count;
            consolidatedDiscovered[dynaLen].others.push(temp[i].name);
            consolidatedDiscovered[dynaLen].tooltip = names[dynaLen];
          }
        }
      }

      var index = consolidatedDiscovered.findIndex(obj => obj.name.toLowerCase() == 'uncategorized');

      if (index != -1) {
        consolidatedDiscovered.push(consolidatedDiscovered.splice(index, 1)[0]);
      } else if (uncategorizedHolder != null) {
        consolidatedDiscovered.push(uncategorizedHolder);
        colors.push(uncategorizedHolder.color);
        names.push(uncategorizedHolder.name);
        counts.push(uncategorizedHolder.count);
      }

      this.topDevice = consolidatedDiscovered;

      this.topDeviceChart = {
        labels: names,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            borderColor: '#0e1319',
            borderWidth: 3
          }
        ]
      };

      this.topDeviceChartOptions = {
        for_plugin: 'top-dev-chart',
        elements: {
          center: {
            text: totalCnt ? totalCnt : 0,
            color: '#FFFFFF',
            sidePadding: 25
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

      if (this.div6 == undefined) {
        this.div6 = document.getElementById('text6');
        this.div6.addEventListener('click', (e: Event) => this.reqLevelTwoInfo());
      }

      this.styleChartCenter(this.div6, 'top-dev-chart');
    }
  }

  prepareTopOS(param, totalCnt) {
    this.topOS = [];
    if (this.isEmpty(param)) {
      this.topOS = [];
    } else {
      param = this.consolidateGroupAssetOs(param);
      let temp: any[] = [];
      for (let key in param) {
        if (param.hasOwnProperty(key)) {
          let name = key;
          let count = param[key];
          if (count > 0) {
            temp.push({ name: name, count: count });
          }
        }
      }

      this.topOS = temp;

      let consolidatedDiscovered: any[] = [];
      let colorIndex = 0;
      let names: any[] = [];
      let counts: any[] = [];
      let colors: any[] = [];
      let uncategorizedHolder: any = null;

      temp.sort(function (a, b) {
        return b.count - a.count;
      });

      // temp.map((child, i) => {
      //   if (child.name.toLowerCase() == 'uncategorized') {
      //     uncategorizedHolder = {};
      //     uncategorizedHolder = temp.splice(i, 1)[0];
      //     uncategorizedHolder.color = this.colorUncateg;
      //   }
      // });

      let dynaLen = temp.length == 4 ? 4 : 3;

      for (let i in temp) {
        if (parseInt(i) < dynaLen) {
          names.push(temp[i].name);
          counts.push(temp[i].count);
          consolidatedDiscovered.push(temp[i]);

          colors.push(this.fixedChartColors[colorIndex]);
          consolidatedDiscovered[i].color = this.fixedChartColors[colorIndex];
          colorIndex++;
        } else {
          if (parseInt(i) == dynaLen) {
            let forOthers: any = { others: [], tooltip: '' };
            names[i] = temp[i].name;
            counts.push(temp[i].count);
            consolidatedDiscovered.push({ ...forOthers, ...temp[i] });
            consolidatedDiscovered[i].name = `All Others (1)`;
            this.topOSAllOthers = consolidatedDiscovered[i].name;
            consolidatedDiscovered[i].tooltip = temp[i].name;
            consolidatedDiscovered[i].others.push(temp[i].name);

            colors.push(this.fixedChartColors[colorIndex]);
            consolidatedDiscovered[i].color = this.fixedChartColors[colorIndex];
          } else {
            counts[dynaLen] += temp[i].count;
            names[dynaLen] = `${names[dynaLen]}, ${temp[i].name}`;
            let allOthersCount = names[dynaLen].split(',').length;
            consolidatedDiscovered[dynaLen].name = `All Others (${allOthersCount})`;
            this.topOSAllOthers = consolidatedDiscovered[dynaLen].name;
            consolidatedDiscovered[dynaLen].count = consolidatedDiscovered[dynaLen].count + temp[i].count;
            consolidatedDiscovered[dynaLen].others.push(temp[i].name);
            consolidatedDiscovered[dynaLen].tooltip = names[dynaLen];
          }
        }
      }

      // var index = consolidatedDiscovered.findIndex(obj => obj.name.toLowerCase() == 'uncategorized');

      // if (index != -1) {
      //   consolidatedDiscovered.push(consolidatedDiscovered.splice(index, 1)[0]);
      // } else if (uncategorizedHolder != null) {
      //   consolidatedDiscovered.push(uncategorizedHolder);
      //   colors.push(uncategorizedHolder.color);
      //   names.push(uncategorizedHolder.name);
      //   counts.push(uncategorizedHolder.count);
      // }

      this.topOS = consolidatedDiscovered;

      this.topOSChart = {
        labels: names,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            borderColor: '#0e1319',
            borderWidth: 3
          }
        ]
      };

      this.topOSChartOptions = {
        for_plugin: 'top-os-chart',
        elements: {
          center: {
            text: totalCnt ? totalCnt : 0,
            color: '#FFFFFF',
            sidePadding: 25
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

      if (this.div7 == undefined) {
        this.div7 = document.getElementById('text7');
        this.div7.addEventListener('click', (e: Event) => { });
      }

      this.styleChartCenter(this.div7, 'top-os-chart');
    }
  }

  prepareTopOnline(param, totalCnt) {
    this.topOnline = [];
    if (this.isEmpty(param)) {
      this.topOnline = [];
    } else {
      let temp: any[] = [];
      for (let key in param) {
        if (param.hasOwnProperty(key)) {
          let name = key;
          let count = param[key];
          if (count > 0) {
            temp.push({ name: name, count: count });
          }
        }
      }

      this.topOnline = temp;

      let consolidatedDiscovered: any[] = [];
      let colorIndex = 0;
      let names: any[] = [];
      let counts: any[] = [];
      let colors: any[] = [];
      let uncategorizedHolder: any = null;

      temp.sort(function (a, b) {
        return b.count - a.count;
      });

      temp.map((child, i) => {
        if (child.name.toLowerCase() == 'uncategorized') {
          uncategorizedHolder = {};
          uncategorizedHolder = temp.splice(i, 1)[0];
          uncategorizedHolder.color = this.colorUncateg;
        }
      });

      let dynaLen = temp.length == 3 ? 3 : 2;

      for (let i in temp) {
        if (parseInt(i) < dynaLen) {
          names.push(temp[i].name);
          counts.push(temp[i].count);
          consolidatedDiscovered.push(temp[i]);

          colors.push(this.fixedChartColors[colorIndex]);
          consolidatedDiscovered[i].color = this.fixedChartColors[colorIndex];
          colorIndex++;
        } else {
          if (parseInt(i) == dynaLen) {
            let forOthers: any = { others: [], tooltip: '' };
            names[i] = temp[i].name;
            counts.push(temp[i].count);
            consolidatedDiscovered.push({ ...forOthers, ...temp[i] });
            consolidatedDiscovered[i].name = `All Others (1)`;
            this.topOnlineAllOthers = consolidatedDiscovered[i].name;
            consolidatedDiscovered[i].tooltip = temp[i].name;
            consolidatedDiscovered[i].others.push(temp[i].name);

            colors.push(this.fixedChartColors[colorIndex]);
            consolidatedDiscovered[i].color = this.fixedChartColors[colorIndex];
          } else {
            counts[dynaLen] += temp[i].count;
            names[dynaLen] = `${names[dynaLen]}, ${temp[i].name}`;
            let allOthersCount = names[dynaLen].split(',').length;
            consolidatedDiscovered[dynaLen].name = `All Others (${allOthersCount})`;
            this.topOnlineAllOthers = consolidatedDiscovered[dynaLen].name;
            consolidatedDiscovered[dynaLen].count = consolidatedDiscovered[dynaLen].count + temp[i].count;
            consolidatedDiscovered[dynaLen].others.push(temp[i].name);
            consolidatedDiscovered[dynaLen].tooltip = names[dynaLen];
          }
        }
      }

      var index = consolidatedDiscovered.findIndex(obj => obj.name.toLowerCase() == 'uncategorized');

      if (index != -1) {
        consolidatedDiscovered.push(consolidatedDiscovered.splice(index, 1)[0]);
      } else if (uncategorizedHolder != null) {
        consolidatedDiscovered.push(uncategorizedHolder);
        colors.push(uncategorizedHolder.color);
        names.push(uncategorizedHolder.name);
        counts.push(uncategorizedHolder.count);
      }

      this.topOnline = consolidatedDiscovered;

      this.topOnlineChart = {
        labels: names,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            borderColor: '#0e1319',
            borderWidth: 3
          }
        ]
      };

      this.topOnlineChartOptions = {
        for_plugin: 'top-online-chart',
        elements: {
          center: {
            text: totalCnt ? totalCnt : 0,
            color: '#FFFFFF',
            sidePadding: 25
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

      if (this.div8 == undefined) {
        this.div8 = document.getElementById('text8');
        this.div8.addEventListener('click', (e: Event) => { });
      }

      this.styleChartCenter(this.div6, 'top-online-chart');
    }
  }

  consolidateGroupAssetOs(data) {
    let validOs = ['windows', 'linux', 'mac'];
    let tempData: any = {};
    let tempWindows = 0;
    let tempLinux = 0;
    let tempMac = 0;

    Object.entries(data).forEach(([key, value]) => {
      let tempVal: any = value;
      if (key.toLowerCase().includes(validOs[0])) {
        tempWindows += tempVal;
        tempData['Windows'] = tempWindows;
      } else if (key.toLowerCase().includes(validOs[1])) {
        tempLinux += tempVal;
        tempData['Linux'] = tempLinux;
      } else if (key.toLowerCase().includes(validOs[2])) {
        tempMac += tempVal;
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

  styleChartCenter(div, chartId) {
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        if (chart.config.options.for_plugin == chartId) {
          let ctx = chart.chart.ctx;
          let centerConfig = chart.config.options.elements.center;
          let txt = centerConfig.text;
          let color = centerConfig.color || '#000';
          let centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          let centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '35px gilroy-regular';
          ctx.fillStyle = color;
          ctx.fillText(txt, centerX, centerY);

          var width = chart.chart.width;
          var height = chart.chart.height;
          div.style.font = '35px gilroy-regular';
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

  prepareBreadCrumb(level, name) {
    switch (level) {
      case 1:
        this.breadCrumbs = [{ name: 'ASSETS' }];
        break;
      case 2:
        this.breadCrumbs = [{ name: 'ASSETS' }, { name: 'ASSET TYPES' }];
        break;
      case 3:
        this.breadCrumbs = [{ name: 'ASSETS' }, { name: 'ASSET TYPES' }, { name: name }];
        break;
      default:
        break;
    }
  }

  onBreadCrumbNav(index) {
    if (index == 0) {
      this.searchQueries = [];
      this.reqLevelOneInfo(true);
    } else if (index == 1) {
      this.searchQueries = [];
      this.reqLevelTwoInfo();
    }
  }

  reqLevelOneInfo(param) {
    this.prepareBreadCrumb(1, null);

    this.totDevBool = true;
    this.osInfoBool = true;
    this.onlineDevBool = true;

    this.onCurrentAssetPeriod(null, param);
  }

  reqLevelTwoInfo() {
    this.prepareBreadCrumb(2, null);
    this.totDevBool = true;
    this.osInfoBool = false;
    this.onlineDevBool = false;

    let req = {
      start_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.start == 0)) ? null : this.startAndEndTstamps.start,
      end_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.end == 0)) ? null : this.startAndEndTstamps.end,
      totalDevices: this.totDevBool,
      onlineDevices: this.onlineDevBool,
      osInfo: this.osInfoBool,
      dev_type: this.currentDevQuery
    };

    this.socketDataService.requestAllDeviceData(req);

    this.clearSomeLogics();
    this.assetSource.adapter.reload(0);
  }

  buildQueries2(param) {
    let chips: any[] = [];
    if (param['others']) {
      param['others'].map(chip => {
        chips.push('DEVICE TYPE:' + chip);
      })
    } else {
      chips.push('DEVICE TYPE:' + param['name']);
    }

    return chips;
  }

  reqLevelThreeInfo(param: any) {
    localStorage.setItem('isExactMatch', 'true');
    this.prepareBreadCrumb(3, param['name']);
    this.currentDevQuery = [];
    if (param['others']) {
      this.currentDevQuery = param['others'];
    } else {
      this.currentDevQuery.push(param['name']);
    }

    this.searchQueries = this.buildQueries2(param);

    this.totDevBool = false;
    this.osInfoBool = true;
    this.onlineDevBool = false;

    let req = {
      start_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.start == 0)) ? null : this.startAndEndTstamps.start,
      end_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.end == 0)) ? null : this.startAndEndTstamps.end,
      totalDevices: this.totDevBool,
      onlineDevices: this.onlineDevBool,
      osInfo: this.osInfoBool,
      dev_type: this.currentDevQuery
    };

    this.socketDataService.requestAllDeviceData(req);

    this.clearSomeLogics();
    this.assetSource.adapter.reload(0);
  }

  public updateDataTableReports(devData) {
    let arrayToReturn: any[] = [];
    for (var i in devData) {
      let obj: any = {};
      obj.id = i;
      obj.ipaddress = devData[i]['ipaddress'];
      obj.mac_address = devData[i]['mac_address'];
      obj.master_id = devData[i]['master_id'];
      obj.asset_type = devData[i]['asset_type'];
      obj.os_name = devData[i]['os_name'];
      obj.dev_type = devData[i]['dev_type'];
      obj.m_name = devData[i]['m_name'];
      obj.m_model = devData[i]['m_model'];
      obj.host_name = devData[i]['host_name'];
      obj.license_key = devData[i]['license_key'];
      obj.state = devData[i]['state'];
      obj.isVulnerable = devData[i].hasOwnProperty('isVulnerable')
        ? devData[i]['isVulnerable']
        : false;

      switch (obj.state) {
        case 1:
          obj.icon = '/assets/img/home/normal_Online.png';
          break;
        case 2:
          obj.icon = '/assets/img/home/normal_Offline.png';
          break;
        default:
          obj.icon = '/assets/img/home/normal_Offline.png';
          break;
      }

      if (obj.isVulnerable) {
        obj.icon = '/assets/img/home/Legend_Bot.png';
      }

      arrayToReturn.push(obj);
    }

    return arrayToReturn;
  }

  openDevicePopup(selectedRow) {
    let deviceObj = {};
    deviceObj['mac_address'] = selectedRow['mac_address'];
    deviceObj['ip_address'] = selectedRow['ipaddress'];
    deviceObj['master_id'] = selectedRow['master_id'];
    deviceObj['license_key'] = selectedRow['license_key'];
    deviceObj['param'] = 1;
    deviceObj['isIncidentTabFirst'] = selectedRow['isVulnerable'];
    localStorage.setItem('mData', JSON.stringify(deviceObj));
    localStorage.setItem('currentRow', selectedRow['id']);

    this.InterCommService.requestRowClickedState(deviceObj);
  }

  onQueries(event) {
    this.searchQueries = event;
    this.clearSomeLogics();
    this.assetSource.adapter.reload(0);
  }

  public isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  sortReports(field) {
    if (field == this.currentSortedField) {
      this.sortBy.order = this.sortBy.order == -1 ? 1 : -1;
    } else {
      this.sortBy.fieldname = field;
      this.sortBy.order = -1;
      this.currentSortedField = field;
    }

    this.assetSource.adapter.reload(0);
  }

  onAssetPeriodChange(event, index, eventByClick) {
    // this.searchQueries = [];
    this.reloadTable = eventByClick;
    this.clearReportData();
    this.assetPeriods.map((period, i) => {
      if (i == index) {
        period.active = true;
        this.calculateReportingPeriod(period);
      } else {
        period.active = false;
      }
    });

    this.customAssetPeriod.active = false;
    this.currentAssetPeriod.active = false;
  }

  clearReportData() {
    this.assetPeriods.map((period) => {
      period.active = false;
    });

    this.currentAssetingPeriod = "";

    this.startAndEndTstamps.valid = false;
    this.customRangeDates = undefined;
  }

  calculateReportingPeriod(period) {
    this.currentAssetingPeriod = ` : ${moment().subtract(period.momentValue, period.momentString).startOf('day').format('MMM DD, YYYY')} - ${moment().subtract(1, 'days').endOf('day').format('MMM DD, YYYY')}`
    this.calculateTimestamps(moment().subtract(period.momentValue, period.momentString).valueOf(), moment().subtract(1, 'days').valueOf(), period.value);
  }

  calculateTimestamps(start, end, period) {
    this.startAndEndTstamps.start = moment(start).startOf('day').valueOf() / 1000;
    this.startAndEndTstamps.end = moment(end).endOf('day').valueOf() / 1000;
    this.startAndEndTstamps.period = period;
    this.startAndEndTstamps.valid = true;

    let req = {
      start_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.start == 0)) ? null : this.startAndEndTstamps.start,
      end_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.end == 0)) ? null : this.startAndEndTstamps.end,
      totalDevices: this.totDevBool,
      onlineDevices: this.onlineDevBool,
      osInfo: this.osInfoBool,
      dev_type: this.currentDevQuery
    };


    this.socketDataService.requestAllDeviceData(req);
    if (this.reloadTable) {
      this.clearSomeLogics();
      this.assetSource.adapter.reload(0);
    }
    this.assetsLoading = true;
  }

  onCustomAssetPeriod(event, eventByClick) {
    // this.searchQueries = [];
    this.reloadTable = eventByClick;
    this.clearReportData();
    this.currentAssetPeriod.active = false;
    this.customAssetPeriod.active = true;

    if (this.customRangeDates != undefined) {
      this.onRangeSelect();
    }
  }

  onCurrentAssetPeriod(event, eventByClick) {
    this.reloadTable = eventByClick;
    this.clearReportData();
    this.customAssetPeriod.active = false;
    this.currentAssetPeriod.active = true;

    this.startAndEndTstamps.start = 0;
    this.startAndEndTstamps.end = 0;
    this.currentAssetingPeriod = ` : Till ${moment().format('MMM DD, YYYY')}`;

    let req = {
      start_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.start == 0)) ? null : this.startAndEndTstamps.start,
      end_time: (this.osInfoBool && !this.totDevBool && !this.onlineDevBool && (this.startAndEndTstamps.end == 0)) ? null : this.startAndEndTstamps.end,
      totalDevices: this.totDevBool,
      onlineDevices: this.onlineDevBool,
      osInfo: this.osInfoBool,
      dev_type: this.currentDevQuery
    };

    this.socketDataService.requestAllDeviceData(req);

    if (this.reloadTable) {
      this.clearSomeLogics();
      this.assetSource.adapter.reload(0);
    }
  }

  onRangeSelect() {
    if (this.customRangeDates[1] != null) {
      this.currentAssetingPeriod = ` : ${moment(this.customRangeDates[0]).startOf('day').format('MMM DD, YYYY')} - ${moment(this.customRangeDates[1]).endOf('day').format('MMM DD, YYYY')}`
      this.calculateTimestamps(this.customRangeDates[0], this.customRangeDates[1], 'Custom');
    }
  }

  onSortOptionChange() {
    this.sortTiles();
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    document.getElementById('dashboard-height-fix').style.height = '70%';
    this.assetConnectionGet.unsubscribe();
    this.customerChangeEvent.unsubscribe();
    this.tableRefreshOnUpdate.unsubscribe();

    this.clearSomeLogics();
  }

}
