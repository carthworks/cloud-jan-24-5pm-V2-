import { Vector3 } from 'three-full/sources/math/Vector3.js';
import { Vector2 } from 'three-full/sources/math/Vector2.js';

var LineConnectionShader = {

uniforms: {

"normalTexture": { type: "t", value: null },
"delta":{type:"f", value: null},
"packetSource":{type:"f", value: 0.3},
},

vertexShader: [
"uniform float delta;",

"attribute float size;",

"varying vec2 vUv;",
"varying float time;",



"void main() {",
"time = delta;",
"vUv = uv;",

"vec4 mvPosition = modelViewMatrix * vec4( position.xyz, 1.0 );",
"gl_PointSize = size / length( mvPosition.xyz );",

"gl_Position = projectionMatrix * mvPosition;",

"}",
].join("\n"),

fragmentShader: [

"varying vec2 vUv;",
"varying float time;",

"uniform float packetSource;",
"uniform sampler2D normalTexture;",

"void main() {",
"if( packetSource == 0.3){",
    "gl_FragColor = texture2D(normalTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(221.0/255.0, 110.0/255.0, 31.0/255.0, 1.0) ;",
    "}",
"else if(packetSource == 0.9){",
    "gl_FragColor = texture2D(normalTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(255.0/255.0, 255.0/255.0, 255.0/255.0, 1.0) ;",
    "}",
"}",
].join("\n")

};

export { LineConnectionShader }
