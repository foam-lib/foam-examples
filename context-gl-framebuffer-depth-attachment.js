import {CreateApp} from 'foam-app/App';
import * as Mat44 from 'foam-math/Mat44';

const glslCube =
`#ifdef VERTEX_SHADER
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
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
 }
 #endif`;

const glslQuad=
`#ifdef VERTEX_SHADER
 attribute vec4 aPosition;
 varying vec2 vTexCoord;
 void main(){
    vTexCoord = aPosition.xy;
    gl_Position = -0.5 + aPosition;
 }
 #endif
 #ifdef FRAGMENT_SHADER
 precision highp float;
 uniform sampler2D uTexture;
 varying vec2 vTexCoord;
 void main(){
    vec4 tt = texture2D(uTexture,vTexCoord);
    gl_FragColor = texture2D(uTexture,vTexCoord);
 }
 #endif`;

function setup(){
    console.log('version',this._ctx.getGLVersion());
    console.log('gl-capabilities',this._ctx.getGLCapabilities());

    this._ctx.setDepthTest(true);

    //program
    this._programCube = this._ctx.createProgram(glslCube);
    this._programQuad = this._ctx.createProgram(glslQuad);

    //view matrix set
    this._ctx.setViewMatrix(Mat44.lookAt(Mat44.create(),[1,0.95,1],[0,0,0],[0,1,0]));

    //cube
    const vertexBufferCube = this._ctx.createVertexBuffer(new Float32Array([
        -1.0,-1.0, 1.0,  1.0,-1.0, 1.0,  1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0,-1.0,-1.0, -1.0, 1.0,-1.0,  1.0, 1.0,-1.0,  1.0,-1.0,-1.0,
        -1.0, 1.0,-1.0, -1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0,-1.0,
        -1.0,-1.0,-1.0,  1.0,-1.0,-1.0,  1.0,-1.0, 1.0, -1.0,-1.0, 1.0,
        1.0,-1.0,-1.0,  1.0, 1.0,-1.0,  1.0, 1.0, 1.0,  1.0,-1.0, 1.0,
        -1.0,-1.0,-1.0, -1.0,-1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0,-1.0
    ]));
    const indexBufferCube = this._ctx.createIndexBuffer(new Uint8Array([
        0,  1,  2,  0,  2,  3,
        4,  5,  6,  4,  6,  7,
        8,  9,  10, 8,  10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]));
    this._vertexArrayCube = this._ctx.createVertexArray([
        {location:this._ctx.ATTRIB_LOCATION_POSITION, buffer: vertexBufferCube, size: 3}
    ],indexBufferCube);
    this._ctx.setVertexArray(this._vertexArrayCube);

    //quad
    const vertexBufferQuad = this._ctx.createVertexBuffer(new Float32Array([
        0,0, 1,0, 0,1, 1,1
    ]));
    this._vertexArrayQuad = this._ctx.createVertexArray([
        {location:this._ctx.ATTRIB_LOCATION_POSITION, buffer: vertexBufferQuad, size: 2}
    ]);

    //framebuffer with depth-attachment
    this._framebuffer = this._ctx.createFramebuffer({depthAttachment : true});

    //resize handler
    const resize = ()=>{
        this.setWindowSize([window.innerWidth,window.innerHeight]);
        this._ctx.setViewport(this.getWindowBounds());
        this._ctx.setProjectionMatrix(Mat44.perspective(Mat44.create(),90,this.getWindowAspectRatio(),0.1,10.0));

        //update bound framebuffer size
        this._ctx.setFramebuffer(this._framebuffer);
        this._ctx.setFramebufferSize(this.getWindowSize());
    };
    resize();
    window.addEventListener('resize',resize);
}

function update(){
    const time = this.getSecondsElapsed();

    //set drawing buffer
    this._ctx.setFramebuffer(this._framebuffer);
    this._ctx.clear(this._ctx.COLOR_BIT | this._ctx.DEPTH_BIT);

    //draw cube
    this._ctx.setProgram(this._programCube);
    this._ctx.setVertexArray(this._vertexArrayCube);
    const num = 30;
    const scalePos = 10.0;
    const indexBufferDataLength = this._ctx.getIndexBufferDataLength();
    for(let y = 0; y < num; ++y){
        const yn = y / num;
        for(let x = 0; x < num; ++x){
            const xn = x / num;
            const scale = (0.5 + (Math.sin(xn * yn * Math.PI * 4.0 + time * Math.PI * 0.5) * 0.5)) * 0.5;
            this._ctx.pushModelMatrix();
            this._ctx.translate3(
                (-0.5 + xn) * scalePos,
                Math.sin(xn * yn * Math.PI * 4.0 + time * 4.0) * 0.25,
                (-0.5 + yn) * scalePos
            );
            this._ctx.scale1(scale);
            this._ctx.drawElements(this._ctx.TRIANGLES,indexBufferDataLength);
            this._ctx.popModelMatrix();
        }
    }

    //draw depth attachment
    this._ctx.setFramebuffer(null);
    this._ctx.clear(this._ctx.COLOR_BIT | this._ctx.DEPTH_BIT);
    this._ctx.setProgram(this._programQuad);
    this._ctx.setVertexArray(this._vertexArrayQuad);
    this._ctx.setTexture2d(this._ctx.getFramebufferDepthAttachment(this._framebuffer),0);
    this._ctx.setProgramUniform('uTexture',0);
    this._ctx.drawArrays(this._ctx.TRIANGLE_STRIP,0,4);
}

window.addEventListener('load',function(){
    CreateApp({setup, update});
});