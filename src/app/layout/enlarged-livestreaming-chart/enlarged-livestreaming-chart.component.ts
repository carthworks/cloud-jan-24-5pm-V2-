import { Component, OnInit, ViewChild } from '@angular/core';
import { SocketdataService } from '../../services/socketdata.service';
import { IntercommunicationService } from '../../services/intercommunication.service'
import { Chart } from 'chart.js';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-enlarged-livestreaming-chart',
  templateUrl: './enlarged-livestreaming-chart.component.html',
  styleUrls: ['./enlarged-livestreaming-chart.component.css']
})

export class EnlargedLivestreamingChartComponent implements OnInit {
  isalive: boolean = true;
  public severTime: string;
  connection;
  resetConnection;
  para = {
    noOfRecs: 2,
    startTime: '',
    id: null
  };
  chart = undefined;
  canvas1: any;
  ctx: HTMLElement;
  cpuLoadGraphData = {
    datasets: [{
      label: 'Streaming Data',
      data: [],
      backgroundColor: 'rgba(128, 255, 0, 0)',
      borderColor: 'rgba(75,192,192,1)'
    }],
    labels: [],
  };
  @ViewChild('liveStreamingChart')
  canvas: HTMLElement;
  ff: any;
  constructor(private intercommunication: IntercommunicationService, private socketdataService: SocketdataService, private toaster: ToastrService) { }

  requestStreamingData() {
    this.updateTime();
    if (!localStorage.getItem('streamingStartTime')) {
      this.para.startTime = localStorage.getItem('loginTime');
    } else {
      this.para.id = localStorage.getItem('streamingStartTime');
    }
    //this.socketdataService.requestStreamingData(this.para);
    this.socketdataService.requestDeviceInfo();
  }

  ngOnInit() {
    this.canvas1 = document.getElementById('liveStreamingChart');
    this.canvas1.width = 300;
    this.canvas1.height = 50;



    this.chart = new Chart(this.canvas1.getContext('2d'), {
      type: 'line',
      responsive: true,
      maintainAspectRatio: true,
      options: {
        scaleShowLabels: false,
        layout: {
          padding: {
            left: 8,
            right: 8,
            top: 8,
            bottom: 8
          }
        },
        title: {
          display: false,
          text: ''
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
              color: "#FFFFFF"
            },
            scaleLabel: {
              display: false,
              labelString: 'Time'
            },
            ticks: {
              fontSize: 12,
              fontColor: 'lightgrey',
              reverse: false,
              stepSize: 6,
              unitStepSize: 5,
              autoSkip: false,
              maxRotation: 90,
              minRotation: 90,
              display: false
            }
          }],
          yAxes: [{

            gridLines: {
              drawBorder: false,
              display: false
            },
            scaleLabel: {
              display: false,
              labelString: 'Packet Length in Bytes'
            },
            ticks: {
              beginAtZero: true,
              fontSize: 12,
              fontColor: 'white',
              maxTicksLimit: 5,
              padding: 25,
              display: false
            }
          }]
        },
        tooltips: {
          backgroundColor: '#1e90ff',
          enabled: false
        }
      },
      data:
      {
        labels: [],
        datasets: [{
          label: ' live stream',
          data: [this.cpuLoadGraphData],
          tension: 0.0,
          // borderColor: 'rgba(159,166,173,1)',
          backgroundColor: 'rgba(0,255,0,0.0)',
          pointBackgroundColor: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
          pointRadius: 3,
          borderWidth: 2
        }]
      }
    });

    this.resetConnection = this.intercommunication.checkResetChartRequest().subscribe(infostreaming => {
      //  this.resetTrafficChart(status);
    });

    this.connection = this.socketdataService.getStreamingData().subscribe(infostreaming => {
      this.chart.data.datasets.forEach((dataset) => {
        if (dataset.data.length > 9) {
          dataset.data.shift();
          this.chart.data.labels.shift();
        }
        if (Object.keys(infostreaming).length) {
          dataset.data.push(infostreaming[0].ip_total_len);
          const tmpDate = new Date(0);
          this.chart.data.labels.push(this.jstime((infostreaming[0].time_stamp_raw)));
        }
      });
      this.chart.update(0);
    });

    this.requestStreamingData();
    setInterval(() => {
      this.requestStreamingData()
    }, 15000);
  }


  jstime(epouch) {
    let tmpDate = new Date(0);
    const now = new Date(tmpDate.setUTCSeconds(epouch));
    let hour = '' + now.getHours(); if (hour.length === 1) { hour = '0' + hour; }
    let minute = '' + now.getMinutes(); if (minute.length === 1) { minute = '0' + minute; }
    let second = '' + now.getSeconds(); if (second.length === 1) { second = '0' + second; }
    let msecond = '' + now.getMilliseconds(); if (msecond.length === 1) { msecond = '0' + msecond; }
    return hour + ':' + minute + ':' + second;

  }

  resetTrafficChart(status) {
    // update the login Time in local localStorage
    localStorage.setItem('loginTime', String(new Date().getTime() / 1000));
    // Clear local storage   streamingStartTime
    localStorage.removeItem('streamingStartTime');
    // reset chart
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.update(0);
  }

  randomScalingFactor() {
    return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
  }
  updateTime() {
    var str = '';
    var months = new Array('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC');
    var now = new Date();
    // tslint:disable-next-line:max-line-length
    str += months[now.getMonth()] + ' ' + ('0' + now.getDate()).slice(-2) + ' ' + now.getFullYear() + ' | ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2);
    this.severTime = str;
  }

  ngOnDestory() {
    if (this.connection) {
      this.connection.unsubscribe();
    }
    if (this.resetConnection) {
      this.resetConnection.unsubscribe();
    }
    this.isalive = false;
  }
}
