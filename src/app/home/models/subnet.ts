import { Node } from "./node";
import { List } from "linqts";
export class Subnet {
    node = {
        id: null,
        mask:null,
        subnet_class: null,
        ip: new List<Node>()
    }
}
