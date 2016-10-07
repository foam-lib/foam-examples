import {CreateApp} from 'foam-app/App';

const glsl =
`#version 300 es
#ifdef VERTEX_SHADER
in vec4 aPosition;
in vec4 aColor;
out vec4 vColor;
layout(std140) uniform UniformBlock{
    vec4 offsetA;
    vec4 offsetB;
};
void main(){
    vColor = aColor;
    gl_Position = aPosition + offsetA + offsetB;
}
#endif
#ifdef FRAGMENT_SHADER
precision mediump float;
in vec4 vColor;
out vec4 outColor;
void main(){
    outColor = vColor;
}
#endif`;

function setup(){
    console.log('version',this._ctx.getGLVersion());
    console.log('capabilities',this._ctx.getGLCapabilities());

    //program
    const program = this._ctx.createProgram(glsl,[{name:'UniformBlock',binding:0}]);
    this._ctx.setProgram(program);

    //buffer position + color
    const buffer = this._ctx.createVertexBuffer(new Float32Array([
        -0.75,-0.75, -0.75,0.75, 0.75,0.75, 0.75,-0.75,
        1,0,0,1, 0,1,0,1, 0,0,0,1, 1,1,1,1
    ]));
    const vertexArray = this._ctx.createVertexArray([
        {location : this._ctx.ATTRIB_LOCATION_POSITION, buffer, size : 2, offset : 0},
        {location : this._ctx.ATTRIB_LOCATION_COLOR, buffer, size : 4, offset: 4 * 2 * 4}
    ]);
    this._ctx.setVertexArray(vertexArray);

    //uniform buffer
    const uniformBuffer = this._ctx.createUniformBuffer(new Float32Array(8),this._ctx.DYNAMIC_DRAW,true);
    this._ctx.setUniformBuffer(uniformBuffer);

    const resize = ()=>{
        this.setWindowSize2(window.innerWidth,window.innerHeight);
        this._ctx.setViewport(this.getWindowBounds());
    };
    resize();
    window.addEventListener('resize',resize);
}

function update(){
    const time = this.getSecondsElapsed();

    //fetch currently bound uniform buffer data + update
    const data = this._ctx.getUniformBufferData();
    data[0] = Math.sin(time * 0.25 * Math.PI) * 0.25;
    data[5] = Math.sin(time * 0.25 * Math.PI * 4.0) * 0.125;
    this._ctx.updateUniformBufferData();

    //draw
    this._ctx.clear(this._ctx.COLOR_BIT | this._ctx.DEPTH_BIT);
    this._ctx.drawArrays(this._ctx.TRIANGLE_FAN,0,4);
}

window.addEventListener('load',()=>{
    const config = {
        context : {
            version : 2, //force webgl2
            fallback : false //disallow fallback to webgl1
        }
    };
    CreateApp({config,setup,update});
});