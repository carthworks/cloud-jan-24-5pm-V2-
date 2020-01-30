// import { Pipe, PipeTransform } from '@angular/core';
// @Pipe({
//   name: 'epochToDate'
// })
// export class EpochToDatePipe implements PipeTransform {
//   transform(value: any, args?: any): any {
//     let unix_seconds = value;
//     if (unix_seconds) {
//       //  if (unix_seconds !== null || unix_seconds !== "") {
//       if (unix_seconds < 10000000000)
//         unix_seconds *= 1000;
//       let fulldate = new Date(unix_seconds + (new Date().getTimezoneOffset() * -1));
//       return fulldate.toString().substr(0, fulldate.toString().length - 15);
//     } else {
//       return ' - ';
//     }
//
//   }
// }


import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'epochToDate'
})

export class EpochToDatePipe implements PipeTransform {
  transform(value: any, args?: any): any {



    //  && value !== '0'
    if (value !== null && value !== undefined) {
      value = JSON.parse(value);
      // console.log(typeof value +' ==> ' + value);

      if (value == 0) {
        // console.log('Date : ' + value);
        return '  -  ';
      } else {
        let fulldate = new Date(0);
        fulldate.setUTCSeconds(value);
        // const monthAndDate = fulldate.toString().substr(3, 8);
        // const timeinSec = fulldate.toString().substr(16, 8);
        if (fulldate.toString() =='Invalid Date') { return 'Invalid Date'} else{
          const monthAndDate = fulldate.toString().substr(3, 12);
          const timeinSec = fulldate.toString().substr(16, 8);
          return monthAndDate + ' | ' + timeinSec;
        }
       
      }

    } else { return '  -  '; }


  }




  //   transform(value: any, args?: any): any {
  //     if (value>0){
  //       let unix_seconds = value;
  //       if (unix_seconds) {

  //         if (unix_seconds < 10000000000) {
  //           unix_seconds *= 1000;
  //         }
  //         const fulldate = new Date(unix_seconds + (new Date().getTimezoneOffset() * -1));



  //         const monthAndDate = fulldate.toString().substr(3, 12);
  //         const timeinSec = fulldate.toString().substr(16, 8);



  //         return monthAndDate + ' | ' + timeinSec;
  //       }
  //     }
  // else {
  //       return ' - ';
  //     }

  //   }
}




