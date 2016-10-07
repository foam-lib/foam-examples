import {CreateApp} from "../foam-app/App";

const glsl =
`#ifdef VERTEX_SHADER
 precision mediump float;
 attribute vec4 aPosition;
 void main() {
     gl_Position = aPosition;
 }
 #endif
 #ifdef FRAGMENT_SHADER
 precision mediump float;
 uniform vec3 uColor;
 void main(){
    gl_FragColor = vec4(uColor,1.0);
 }
 #endif`;

function setup(){
    this._ctx.setClearColor([0,0,1,1]);
    this._ctx.setProgram(this._ctx.createProgram(glsl));

    this._ctx.setVertexArray(this._ctx.createVertexArray([{
        location: this._ctx.ATTRIB_LOCATION_POSITION,
        buffer: this._ctx.createVertexBuffer(new Float32Array([
            -0.5,-0.5, -0.5,0.5, 0.5,0.5
        ])),
        size: this._ctx.SIZE_VEC2
    }]));

    const resize = ()=>{
        this.setWindowSize([window.innerWidth,window.innerHeight]);
        this._ctx.setViewport(this.getWindowBounds());
    };
    resize();
    window.addEventListener('resize',resize);
}

function update(){
    const time = this.getSecondsElapsed();

    this._ctx.clear(this._ctx.COLOR_BIT);
    this._ctx.setProgramUniform('uColor',
        0.5 + Math.sin(time * Math.PI * 1.0) * 0.5,
        0.5 + Math.sin(time * Math.PI * 2.0) * 0.5,
        0.5 + Math.sin(time * Math.PI * 4.0) * 0.5
    );
    this._ctx.drawArrays(this._ctx.TRIANGLES,0,3);
}

window.addEventListener('load', function(){
    CreateApp({setup,update});
});