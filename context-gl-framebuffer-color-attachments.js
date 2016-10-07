import {CreateApp} from 'foam-app/App';
import * as Mat44 from 'foam-math/Mat44';

const glslCube =
`#extension GL_EXT_draw_buffers : require
 #ifdef VERTEX_SHADER
 precision highp float;
 attribute vec4 aPosition;
 uniform mat4 uProjectionMatrix;
 uniform mat4 uViewMatrix;
 uniform mat4 uModelMatrix;
 void main(){
     gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
 }
 #endif
 #ifdef FRAGMENT_SHADER
 precision highp float;
 void main(){
    gl_FragData[0] = vec4(1.0,0,0,1.0);
    gl_FragData[1] = vec4(0,1.0,0,1.0);
    gl_FragData[2] = vec4(0,0,1.0,1.0);
 }
 #endif`;

function setup(){
    console.log('version',this._ctx.getGLVersion());
    console.log('gl-capabilities',this._ctx.getGLCapabilities());

    //program
    const program = this._ctx.createProgram(glslCube);
    this._ctx.setProgram(program);

    //view matrix set
    this._ctx.setViewMatrix(Mat44.lookAt(Mat44.create(),[0,0,3],[0,0,0],[0,1,0]));

    //cube
    const vertexBuffer = this._ctx.createVertexBuffer(new Float32Array([
        -1.0,-1.0, 1.0,  1.0,-1.0, 1.0,  1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0,-1.0,-1.0, -1.0, 1.0,-1.0,  1.0, 1.0,-1.0,  1.0,-1.0,-1.0,
        -1.0, 1.0,-1.0, -1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0,-1.0,
        -1.0,-1.0,-1.0,  1.0,-1.0,-1.0,  1.0,-1.0, 1.0, -1.0,-1.0, 1.0,
         1.0,-1.0,-1.0,  1.0, 1.0,-1.0,  1.0, 1.0, 1.0,  1.0,-1.0, 1.0,
        -1.0,-1.0,-1.0, -1.0,-1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0,-1.0
    ]),this._ctx.STATIC_DRAW);
    const indexBuffer = this._ctx.createIndexBuffer(new Uint8Array([
        0,  1,  2,  0,  2,  3,
        4,  5,  6,  4,  6,  7,
        8,  9,  10, 8,  10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]),this._ctx.STATIC_DRAW);
    const vertexArray = this._ctx.createVertexArray([
        {location:this._ctx.ATTRIB_LOCATION_POSITION, buffer: vertexBuffer, size: 3}
    ],indexBuffer);
    this._ctx.setVertexArray(vertexArray);

    //framebuffer with 3 auto color-attachment, size equals drawing buffer size
    this._framebuffer = this._ctx.createFramebuffer({numColorAttachments : 3});

    //resize handler
    const resize = ()=>{
        this.setWindowSize([window.innerWidth,window.innerHeight]);
        this._ctx.setViewport(this.getWindowBounds());
        this._ctx.setProjectionMatrix(Mat44.perspective(Mat44.create(),90,this.getWindowAspectRatio(),0.1,5.0));

        //update bound framebuffer size
        this._ctx.setFramebuffer(this._framebuffer);
        this._ctx.setFramebufferSize(this.getWindowSize());
    };
    resize();
    window.addEventListener('resize',resize);
}

function update(){
    const time = this.getSecondsElapsed();
    const bounds = this.getWindowBounds();

    //set drawing buffer
    this._ctx.setFramebuffer(this._framebuffer);
    this._ctx.clear(this._ctx.COLOR_BIT | this._ctx.DEPTH_BIT);

    //draw cube
    const indexBufferDataLength = this._ctx.getIndexBufferDataLength();
    this._ctx.pushModelMatrix();
    this._ctx.translate3(Math.sin(time * Math.PI),0,0);
    this._ctx.translate3(-3,0,0);
    this._ctx.drawElements(this._ctx.TRIANGLES,indexBufferDataLength);
    this._ctx.translate3(3,0,0);
    this._ctx.drawElements(this._ctx.TRIANGLES,indexBufferDataLength);
    this._ctx.translate3(3,0,0);
    this._ctx.drawElements(this._ctx.TRIANGLES,indexBufferDataLength);
    this._ctx.popModelMatrix();

    //switch back to drawing buffer, convenience blit
    this._ctx.setFramebuffer(null);
    this._ctx.pushScissor();
    this._ctx.setScissorTest(true);
    this._ctx.setScissor4(0,0,bounds[2] / 3,bounds[3]);
    this._ctx.blitFramebufferToScreen(this._framebuffer,bounds,0);
    this._ctx.setScissor4(bounds[2] / 3,0,bounds[2] / 3 * 2,bounds[3]);
    this._ctx.blitFramebufferToScreen(this._framebuffer,bounds,1);
    this._ctx.setScissor4(bounds[2] / 3 * 2,0,bounds[2] / 3 * 2,bounds[3]);
    this._ctx.blitFramebufferToScreen(this._framebuffer,bounds,2);
    this._ctx.popScissor();
}

window.addEventListener('load',function(){
    CreateApp({setup, update});
});