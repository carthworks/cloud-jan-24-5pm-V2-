import { Device_State} from "./device-State";
import { Anomaly_Nature } from "./anomaly-nature";
import { Anomaly_Status } from "./anomaly-status";
import { Link } from "./link";
import { List } from 'linqts';

export class Node {
        id: any;
        node_index:any;
        level:any;
        size:any;
        type:any;
        name:any;
        subnet:any;
        vulnerable: any;
        ipaddress: any;
        license_key: any;
        mac_address: any;
        host_name: any;
        device_state: any;
        anomaly_status: any;
        anomaly_nature: any;
        texture_type:any;
        link: List<Link>;
        bytesTransfered = [];
        createdTimestamp:any;
        endTimestamp:any;
        nodetype: any;
}
export class bytesTransfered {
        bytes = {

        }
}
