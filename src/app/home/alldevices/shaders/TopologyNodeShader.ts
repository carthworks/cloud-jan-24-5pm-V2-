import { Vector3 } from 'three-full/sources/math/Vector3.js';
import { Vector2 } from 'three-full/sources/math/Vector2.js';

var TopologyNodeShader = {

        uniforms: {

                "normalTexture": { type: "t", value: null },
                "delta": { type: "f", value: null },
                "nodePos": { type: "v3", value: null },
                "nodeSize": { type: "f", value: null },
                "color": { type: "v3", value: null },
        },

        vertexShader: [
                "uniform float delta;",
                "uniform float nodeSize;",
                "uniform vec3 nodePos;",
              
                "varying vec2 vUv;",
                "varying float time;",



                "void main() {",
               
                "time = delta;",
                "vUv = uv;",

                "vec4 mvPosition = modelViewMatrix * vec4( nodePos.xyz, 1.0 );",
                "gl_PointSize = nodeSize / length( mvPosition.xyz );",

                "gl_Position = projectionMatrix * mvPosition;",

                "}",
        ].join("\n"),

        fragmentShader: [

                "varying vec2 vUv;",
                "varying float time;",
                
                "uniform vec3 color;",
                "uniform sampler2D normalTexture;",

                "void main() {",
             
   
                "gl_FragColor = texture2D(normalTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(color , 1.0) ;",
                
                "}",
        ].join("\n")

};
export { TopologyNodeShader }
