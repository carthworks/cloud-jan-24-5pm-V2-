import { Vector3 } from 'three-full/sources/math/Vector3.js';
import { Vector2 } from 'three-full/sources/math/Vector2.js';

var NodeShader = {

        uniforms: {

                "normalTexture": { type: "t", value: null }, 
                "color": {type: "v3",value: null},
                "alpha": {type:"v4",value: null}
        },

        vertexShader: [              
                "varying vec2 vUv;",


                "void main() {",
                "vUv = uv;",
               
                "vec4 mvPosition = modelViewMatrix * vec4( position.xyz, 1.0 );",
                "gl_Position = projectionMatrix * mvPosition;",
                "}",
        ].join("\n"),

        fragmentShader: [

                "varying vec2 vUv;",
                "uniform vec3 color;",
                "uniform vec4 alpha;",
                "uniform sampler2D normalTexture;",
                
                "void main() {",
                "vec4 blend;",
                "vec4 alphaBlend = texture2D(normalTexture,vec2(vUv.x,vUv.y));",
                "gl_FragColor =   vec4(color + alphaBlend.a ,1.0)* vec4(alpha.r,alpha.g,alpha.b,alpha.a);",

                "}",
        ].join("\n")

};
export { NodeShader }
