import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { SocketdataService } from '../../../services/socketdata.service';
import { IntercommunicationService } from '../../../services/intercommunication.service';

@Component({
  selector: 'app-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.css']
})
export class TimelineChartComponent implements OnInit, OnDestroy {

  public chartColors = {
    myc: 'rgb(31, 180, 223)',
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(231,233,237)'
  };
  devicecanvas: any;
  connection: any;
  resetChart: any;
  chart: any;


  iSGloadingTimeShow: boolean;
  timelineChartLoadingTxt: string;

  constructor(
    private socketdataservice: SocketdataService,
    private toastr: ToastrService,
    private intercommunication: IntercommunicationService
  ) { }

  ngOnInit() {

    this.iSGloadingTimeShow = true;
    this.timelineChartLoadingTxt = 'Loading...';

    this.devicecanvas = document.getElementById('timelinechart');
    this.devicecanvas.width = 300;
    this.devicecanvas.height = 58;
    this.resetChart = this.intercommunication
      .triggerResetTimeLineChart()
      .subscribe(info => {
        this.resetSessionChart();
      })

    this.connection = this.socketdataservice
      .getDetailedChart()
      .subscribe(info => {

        if (this.isEmpty(info)) {
          this.toastr.info('No data available', 'Error');
          this.timelineChartLoadingTxt = 'No data Available';
          this.resetSessionChart();
        } else {
          this.iSGloadingTimeShow = false;
          this.updateSessionChart(info);
        }

      });

    Chart.defaults.multicolorLine = Chart.defaults.line;
    Chart.controllers.multicolorLine = Chart.controllers.line.extend({
      draw: function (ease) {
        var
          startIndex = 0,
          meta = this.getMeta(),
          points = meta.data || [],
          colors = this.getDataset().colors,
          area = this.chart.chartArea,
          originalDatasets = meta.dataset._children
            .filter(function (data) {
              return !isNaN(data._view.y);
            });
        function _setColor(newColor, meta) {
          meta.dataset._view.borderColor = newColor;
        }

        if (!colors) {
          Chart.controllers.line.prototype.draw.call(this, ease);
          return;
        }

        for (var i = 2; i <= colors.length; i++) {
          if (colors[i - 1] !== colors[i]) {
            _setColor(colors[i - 1], meta);
            meta.dataset._children = originalDatasets.slice(startIndex, i);
            meta.dataset.draw();
            startIndex = i - 1;
          }
        }

        meta.dataset._children = originalDatasets.slice(startIndex);
        meta.dataset.draw();
        meta.dataset._children = originalDatasets;

        points.forEach(function (point) {
          point.draw(area);
        });
      }
    });

    if (this.chart) this.chart.destroy(); //destroy prev chart instance

    this.chart = new Chart(this.devicecanvas.getContext('2d'), {
      type: 'multicolorLine',
      responsive: true,
      maintainAspectRatio: false,

      data:
      {
        // labels: ["January", "February", "March", "April", "May", "June", "July"],
        label: [],
        datasets: [{
          label: ' live stream',
          data: [],
          tension: 0.0,
          // backgroundColor: this.chartColors.myc,

          fill: false,
          lineTension: 0.1,
          // backgroundColor: "rgba(75,192,192,0.4)",
          // borderColor: "rgba(75,192,192,1)",
          // borderCapStyle: 'butt',
          // borderDash: [],
          // borderDashOffset: 0.0,
          // borderJoinStyle: 'miter',
          // pointBorderColor: "rgba(75,192,192,1)",
          // pointBackgroundColor: "#fff",
          // pointBorderWidth: 1,
          // pointHoverRadius: 5,
          // pointHoverBackgroundColor: "rgba(75,192,192,1)",
          // pointHoverBorderColor: "rgba(220,220,220,1)",
          // pointHoverBorderWidth: 2,
          // pointRadius: 5,
          // pointHitRadius: 10,
          borderColor: this.chartColors.grey,
          colors: [],

          pointBackgroundColor: [],
          pointRadius: 3,
          borderWidth: 2
        }]
      },
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
          fontColor: "#92948f",
          labels: {
            fontColor: "#92948f",
            fontSize: 18
          }
        },
        scales: {
          pointLabels: {
            fontStyle: "bold",
          },
          xAxes: [{
            display: true,
            fontColor: "#92948f",
            scaleLabel: {
              display: true,
              labelString: 'TIME',
              color: '#FFFFFF'
            },
            gridLines: {
              // display: false,
              drawOnChartArea: false,
              color: '#92948f',
              zeroLineColor: '#ffcc33'
            },
            ticks: {
              fontColor: "#CCC", // this here
            }

          }],
          yAxes: [{
            display: true,
            fontColor: "#92948f",
            scaleLabel: {
              display: true,
              labelString: 'SESSION DATA',
              color: '#FFFFFF'
            },
            gridLines: {
              // display: false,
              drawOnChartArea: false,
              color: '#92948f',
              zeroLineColor: '#ffcc33'
            },
            ticks: {
              beginAtZero: true,
              fontColor: "#CCC", // this here
            }
          }]
        },

        tooltips: {
          backgroundColor: '#1e90ff',
          enabled: true,
          callbacks: {
            label: function (tooltipItem) {
              return Number(tooltipItem.yLabel);
            }
          }
        }
      },
    });
  }

  public requestStreamingChart(parameter) {
    var querySample = {};
    querySample['mac_address'] = "00:17:88:a3:4f:29";
    querySample["startTime"] = "1529578342.731043842";
    querySample["endTime"] = "1538545476.748900530";
    querySample["isVictim"] = false;
    this.socketdataservice.requestDetailedChart(querySample);
  }

  public updateSessionChart(chartData) {
    Chart.defaults.multicolorLine = Chart.defaults.line;
    Chart.controllers.multicolorLine = Chart.controllers.line.extend({
      draw: function (ease) {
        var
          startIndex = 0,
          meta = this.getMeta(),
          points = meta.data || [],
          colors = this.getDataset().colors,
          area = this.chart.chartArea,
          originalDatasets = meta.dataset._children
            .filter(function (data) {
              return !isNaN(data._view.y);
            });
        function _setColor(newColor, meta) {
          meta.dataset._view.borderColor = newColor;
        }

        if (!colors) {
          Chart.controllers.line.prototype.draw.call(this, ease);
          return;
        }

        for (var i = 2; i <= colors.length; i++) {
          if (colors[i - 1] !== colors[i]) {
            _setColor(colors[i - 1], meta);
            meta.dataset._children = originalDatasets.slice(startIndex, i);
            meta.dataset.draw();
            startIndex = i - 1;
          }
        }

        meta.dataset._children = originalDatasets.slice(startIndex);
        meta.dataset.draw();
        meta.dataset._children = originalDatasets;

        points.forEach(function (point) {
          point.draw(area);
        });
      }
    });
    if (this.chart) this.chart.destroy(); //destroy prev chart instance

    this.chart = new Chart(this.devicecanvas.getContext('2d'), {
      type: 'multicolorLine',
      responsive: true,
      maintainAspectRatio: false,

      data:
      {
        label: [],
        datasets: [{
          label: ' live stream',
          data: [],
          tension: 0.0,
          fill: false,
          lineTension: 0.1,
          borderColor: this.chartColors.grey,
          colors: [],
          pointBackgroundColor: [],
          pointRadius: 3,
          borderWidth: 2
        }]
      },
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
          fontColor: "#92948f",
          labels: {
            fontColor: "#92948f",
            fontSize: 18
          }
        },
        scales: {
          pointLabels: {
            fontStyle: "bold",
          },
          xAxes: [{
            display: true,
            fontColor: "#92948f",
            scaleLabel: {
              display: true,
              labelString: 'TIME',
              color: '#FFFFFF'
            },
            gridLines: {
              // display: false,
              drawOnChartArea: false,
              color: '#92948f',
              zeroLineColor: '#ffcc33'
            },
            ticks: {
              fontColor: "#CCC", // this here
            }

          }],
          yAxes: [{
            display: true,
            fontColor: "#92948f",
            scaleLabel: {
              display: true,
              labelString: 'SESSION DATA',
              color: '#FFFFFF'
            },
            gridLines: {
              // display: false,
              drawOnChartArea: false,
              color: '#92948f',
              zeroLineColor: '#ffcc33'
            },
            ticks: {
              beginAtZero: true,
              fontColor: "#CCC", // this here
            }
          }]
        },

        tooltips: {
          backgroundColor: '#1e90ff',
          enabled: true,
          callbacks: {
            label: function (tooltipItem) {
              return Number(tooltipItem.yLabel);
            }
          }
        }
      },
    });

    for (var id = 0; id < Object.values(chartData['vertices']).length-2; id++) {
      this.chart.data.labels[id] = this.jstime(chartData['vertices'][id])
    }

    this.chart.data.datasets[0].data = Object.values(chartData['edges']);
    this.chart.data.datasets[0].data.unshift(0);
    //this.chart.data.labels.unshift(0);
    for (var id = 0; id < Object.values(chartData['anomalyinfo']).length; id++) {
      if (!chartData['anomalyinfo'][id]) {
        this.chart.data.datasets[0].colors.push("green");
      } else {
        this.chart.data.datasets[0].colors.push("orange");
      }
    }
    if (!chartData['anomalyinfo'][0]) {
      this.chart.data.datasets[0].colors.unshift("green");
      this.chart.data.datasets[0].pointBackgroundColor.unshift("green");
    } else {
      this.chart.data.datasets[0].colors.unshift("orange");
      this.chart.data.datasets[0].pointBackgroundColor.unshift("orange");
    }
    this.chart.update();
    this.iSGloadingTimeShow = false;
  }
  public resetSessionChart() {
    this.chart.data.datasets[0].data = [];
    this.chart.data.labels = [];
    this.chart.update();
    this.iSGloadingTimeShow = false;
  }

  public isEmpty(obj: { hasOwnProperty?: any; }) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }



  jstime00(value) {


    // epoch to date string
    let unix_seconds = value;
    if (unix_seconds) {
      //  if (unix_seconds !== null || unix_seconds !== "") {
      if (unix_seconds < 10000000000) {
        unix_seconds *= 1000;
      }
      const fulldate = new Date(
        unix_seconds + new Date().getTimezoneOffset() * -1
      );
      //  console.log(fulldate.toString());
      // Wed Mar 14 2018 19:52:25 GMT+0530 (IST)
      const monthAndDate = fulldate.toString().substr(3, 8);
      const timeinSec = fulldate.toString().substr(16, 8);
      // console.warn(monthAndDate + '\n' + timeinSec);

      //  return fulldate.toString().substr(3, fulldate.toString().length - 17);
      return timeinSec;
    } else {
      return ' - ';
    }
  }


  jstime(value) {
    if (value) {
      var fulldate = new Date(0);
      fulldate.setUTCSeconds(value);
      const monthAndDate = fulldate.toString().substr(3, 8);
      const timeinSec = fulldate.toString().substr(16, 8);
      return timeinSec;

    }
    else { return ' - '; }
  }




  ngOnDestroy() {
    this.chart.destroy();
    this.connection.unsubscribe();
    this.resetChart.unsubscribe();
  }

}
