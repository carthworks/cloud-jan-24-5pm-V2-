import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abbrivateBits'
})
export class AbbrivateBitsPipe implements PipeTransform {
  public SI_POSTFIXES = ['', 'K', 'M', 'G', 'T', 'P', 'E'];

  transform(value: any, args?: any): any {

    var tier = Math.log10(Math.abs(value)) / 3 | 0;

    // if zero, we don't need a prefix
    if ( tier === 0) { return value; }

    // get postfix and determine scale
    let postfix = this.SI_POSTFIXES[tier];
    let scale = Math.pow(10, tier * 3);

    // scale the number
    let scaled = value / scale;

    // format number and add postfix as suffix
    let formatted = scaled.toFixed(1) + '';

    // remove '.0' case
    if (/\.0$/.test(formatted)) {
        formatted = formatted.substr(0, formatted.length - 2);
    }

    return formatted + postfix;

    // return null;
  }

}
