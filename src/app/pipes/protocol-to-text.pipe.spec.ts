// import { ProtocolToTextPipe } from './protocol-to-text.pipe';
// import { Pipe, PipeTransform } from '@angular/core';
//
// describe('ProtocolToTextPipe', () => {
//   it('create an instance', () => {
//     const pipe = new ProtocolToTextPipe();
//     expect(pipe).toBeTruthy();
//   });
// });


import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'ProtocolToText'
})
export class ProtocolToTextPipe implements PipeTransform {
  transform(value: any, args?: any): any {
  let pktHistory:number[];
  let result_protocol;
  let  ip_protocol = {
    "1": "(ICMP)",
    "6": "(TCP)",
    "17": "(UDP)"
  };
  let app_protocol = {
    "1": "ICMP",
    "6": "TCP",
    "17": "UDP",
    "1001": "STP",
    "1002": "ARP",
    "1003": "HTTP",
    "1004": "HTTP REQUEST",
    "1005": "HTTP RESPONSE",
    "1006": "SSL",
    "1007": "DHCP",
    "1008": "DNS",
    "1009": "FTP",
    "1010": "SSH",
    "1011": "DICOM",
    "1012": "HL7",
    "1013": "SSDP",
    "1014": "UPNP",
    "1015": "SNMP"
  };
//  let result_protocol = (this.app_protocol[String(pktHistory[index].app_proto)]) ? //this.app_protocol[String(pktHistory[index].app_proto)] : pktHistory[index].app_proto;
//
//


    return result_protocol;
  }
}
