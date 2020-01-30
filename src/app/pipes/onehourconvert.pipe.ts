import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'onehourconvert'
})
export class OnehourconvertPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (args === undefined) {
      return value;
    }

    let fromhr = value.split("-")[0];
    let tohr = value.split("-")[1];
    let ff = this.epochToDateFn(fromhr);
    let tt = this.epochToDateFn(tohr);
    let frm = ff.slice(16, -3);
    let tim = tt.slice(16, -3);

    return frm + '  -  ' + tim;
  }


  epochToDateFn(eptime) {
    if (eptime !== null) {
      if (eptime < 10000000000)
        eptime *= 1000;
      let fulldate = new Date(eptime + (new Date().getTimezoneOffset() * -1));
      //  console.log(fulldate);
      return fulldate.toString().substr(0, fulldate.toString().length - 15);
    } else {
      return " -- "
    }

  }

}
