// import { Vector3 } from 'three-full/sources/math/Vector3.js';
// import { Vector2 } from 'three-full/sources/math/Vector2.js';

// var BotShader = {

//         uniforms: {
//                 "threatType": { type: "f", value: null },
//                 "botTexture": { type: "t", value: null },
//                 "botStatus": { type:"f",value: null },
//                 "delta": { type: "f", value: null },
//                 "nodePos": { type: "v3", value: null },
//                 "nodeSize": { type:"f", value:null },
//         },

//         vertexShader: [
//                 "uniform float threatType;",
//                 "uniform float delta;",
//                 "uniform float botStatus;",
//                 "uniform vec3 nodePos;",
//                 "uniform float nodeSize;",

//                 "varying float vbotStatus;",
//                 "varying float vthreatType;",
//                 "varying vec2 vUv;",
//                 "varying float vTime;",
//                 "varying float vnodeSize;",

//                 "void main() {",

//                 "vTime = delta;",
//                 "vUv = uv;",
//                 "vthreatType = threatType;",
//                 "vbotStatus = botStatus;",
//                 "vnodeSize = nodeSize;",
       
//                 "vec4 mvPosition = modelViewMatrix * vec4( nodePos.xyz, 1.0 );",
//                 "gl_PointSize = vnodeSize / length( mvPosition.xyz );",

//                 "gl_Position = projectionMatrix * mvPosition;",

//                 "}",
//         ].join("\n"),

//         fragmentShader: [


//                 "varying float vthreatType;",
//                 "varying vec2 vUv;",
//                 "varying float vTime;",
//                 "varying float vnodeSize;",

//                 "uniform sampler2D botTexture;",

//                 "void main() {",
                
            
//                 "gl_FragColor = texture2D(botTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(200.0/255.0, 100.0/255.0, 90.0/255.0, 1.0);",
//                 "}",
//         ].join("\n")

// };

// export { BotShader }
import { Vector3 } from 'three-full/sources/math/Vector3.js';
import { Vector2 } from 'three-full/sources/math/Vector2.js';

var BotShader = {

        uniforms: {

                "botTexture": { type: "t", value: null },
                "delta":{type:"f", value: null},
                "nodePos":{type:"v3",value: null},
                "nodeSize":{type:"f", value: null},
                "threatType":{type:"f", value: 0.3},
        },

        vertexShader: [
                "uniform float delta;",
                "uniform float nodeSize;",
                "uniform vec3 nodePos;",
              
                "varying vec2 vUv;",
                "varying float vtime;",



                "void main() {",
               
                "vtime = delta;",
                "vUv = uv;",

                "vec4 mvPosition = modelViewMatrix * vec4( nodePos.xyz, 1.0 );",
                
                "gl_PointSize = 15.0 / length( mvPosition.xyz );",

                "gl_Position = projectionMatrix * mvPosition;",

                "}",
        ].join("\n"),

        fragmentShader: [

                "varying vec2 vUv;",
                "varying float vtime;",

                "uniform float threatType;",
                "uniform sampler2D botTexture;",

                "void main() {",
                "float blink = sin(vtime);",

                "if(threatType == 0.3){",
                        "gl_FragColor = texture2D(botTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(200.0/255.0, 100.0/255.0, 90.0/255.0, blink) ;",          
                        "}",
                "else if(threatType == 0.6){",
                        "gl_FragColor = texture2D(botTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(120.0/255.0, 90.0/255.0, 110.0/255.0, blink) ;",          
                        "}",
                "else if(threatType == 0.9){",
                        "gl_FragColor = texture2D(botTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(51.0/255.0, 51.0/255.0, 51.0/255.0, blink) ;",          
                        "}",
                "else if(threatType == 0.1){",
                        "gl_FragColor = texture2D(botTexture,vec2(gl_PointCoord.x,gl_PointCoord.y))*vec4(0.0, 0.0, 0.0, 0.0) ;",          
                        "}",
                "}",
        ].join("\n")

};
export { BotShader }
