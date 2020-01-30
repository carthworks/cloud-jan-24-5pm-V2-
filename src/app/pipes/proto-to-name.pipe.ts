import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'protoToName'
})
export class ProtoToNamePipe implements PipeTransform {
  transform(value: any[], args?: any[]): any {
    let result_protocol;
    let ip_protocol = {
      '1': 'ICMP',
      '6': 'TCP',
      '17': 'UDP'
    };

    let app_protocol = {
      '1': 'ICMP',
      '6': 'TCP',
      '17': 'UDP',
      '1001': 'STP',
      '1002': 'ARP',
      '1003': 'HTTP',
      '1004': 'HTTP REQUEST',
      '1005': 'HTTP RESPONSE',
      '1006': 'SSL',
      '1007': 'DHCP',
      '1008': 'DNS',
      '1009': 'FTP',
      '1010': 'SSH',
      '1011': 'DICOM',
      '1012': 'HL7',
      '1013': 'SSDP',
      '1014': 'UPNP',
      '1015': 'SNMP',
      '1016': 'MDNS'
    };

    if (app_protocol[value[0]] != undefined) {
      if (value[0] == '6' || value[0] == '1002' || value[0] == '17' || value[0] == '1') {
        result_protocol = app_protocol[value[0]];
      } else {
        result_protocol = ip_protocol[value[1]] + '/' + app_protocol[value[0]];
      }
    }
    return result_protocol;
  }

}
