import { Vector3 } from 'three-full/sources/math/Vector3.js';
import { Vector2 } from 'three-full/sources/math/Vector2.js';

var AnomalyEventShader = {

        uniforms: {

                "normalTexture": { type: "t", value: null },
                "delta": { type: "f", value: null },
                "nodePos": { type: "v3", value: null },
                "nodeSize": { type: "f", value: null },
                "stauts": { type: "f", value: 0.1 },
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
                
                "uniform float status;",
                "uniform sampler2D normalTexture;",

                "void main() {",
                "if(status == 0.0){",
                "gl_FragColor = texture2D(normalTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(0.0,0.0,0.0,0.0) ;",
                "}",
                "else if(status == 0.1 ){",
                "gl_FragColor = texture2D(normalTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(128.0/255.0,128.0/255.0,128.0/255.0,1.0) ;",
                "}",
                "else if(status == 0.2 ){",
                "gl_FragColor = texture2D(normalTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(1.0,1.0,1.0,1.0) ;",
                "}",
                "}",
        ].join("\n")

};
export { AnomalyEventShader }
