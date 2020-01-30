import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iszerolength'
})
export class IszerolengthPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (value.length !== 0) {
      return value;
    } else {
      return ' - ';
    }

  }

}
