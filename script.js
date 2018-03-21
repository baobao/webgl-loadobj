window.onload = function ()
{
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4)
        {
            start(parse(req.responseText));
        }
    }
    req.open('GET', "unitychan.obj");
    req.send();
    
    function start(mesh)
    {
        var lightXRange = document.getElementById("lightX");
        var lightYRange = document.getElementById("lightY");
        var eyeYRange = document.getElementById("eyeY");
        var eyeZRange = document.getElementById("eyeZ");
        var centerY = document.getElementById("centerY");

        var canvas = document.getElementById('canvas');
        canvas.width = canvas.height = 300;
        var gl = canvas.getContext('webgl');
        var vs = gl.createShader(gl.VERTEX_SHADER);
        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vs, document.getElementById('vs').text);
        gl.shaderSource(fs, document.getElementById('fs').text);
        gl.compileShader(vs);
        gl.compileShader(fs);

        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS))
        {
            gl.useProgram(prog);
        }else{
            console.error(gl.getProgramInfoLog(prog));
            return;
        }
        
        var attrList = [];
        var strideList = [];
        var uniformList = [];
        attrList[0] = gl.getAttribLocation(prog, 'pos');
        strideList[0] = 3;

        attrList[1] = gl.getAttribLocation(prog, 'normal');
        strideList[1] = 3;

        uniformList[0] = gl.getUniformLocation(prog, 'mvpMatrix');
        uniformList[1] = gl.getUniformLocation(prog, 'lightPos');
        uniformList[2] = gl.getUniformLocation(prog, 'eyePos');
        uniformList[3] = gl.getUniformLocation(prog, 'invMMatrix');
        
        // position
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh['position']), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(attrList[0]);
        gl.vertexAttribPointer(attrList[0], strideList[0], gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // normal
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh['normal']), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(attrList[1]);
        gl.vertexAttribPointer(attrList[1], strideList[1], gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // ibo
        var ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(mesh['index']), gl.STATIC_DRAW);

        // matrix
        var m = new matIV();
        var mMatrix = m.identity(m.create());
        var vMatrix = m.identity(m.create());
        var pMatrix = m.identity(m.create());
        var vpMatrix = m.identity(m.create());
        var mvpMatrix = m.identity(m.create());
        var invMMatrix = m.identity(m.create());

        gl.enable(gl.DEPTH_TEST);

        var count = 0;
        draw();
        function draw()
        {
            var eyePos = [0, eyeYRange.value, eyeZRange.value];
            var lightPos = [lightXRange.value, lightYRange.value, 0];

            gl.clearColor(1,1,1,1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            m.lookAt(eyePos, [0, centerY.value, 0], [0, 1, 0], vMatrix);
            m.perspective(60, 1, 0.1, 1000, pMatrix);
            m.multiply(pMatrix, vMatrix, vpMatrix);
            m.identity(mMatrix);
            m.rotate(mMatrix, 2*count++*Math.PI/180, [0,1.0,0], mMatrix);

            m.multiply(vpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniformList[0], false, mvpMatrix);

            m.inverse(mMatrix, invMMatrix);
            gl.uniform3fv(uniformList[1], lightPos);
            gl.uniform3fv(uniformList[2], eyePos);
            gl.uniformMatrix4fv(uniformList[3], false, invMMatrix);

            gl.drawElements(gl.TRIANGLES, mesh['index'].length, gl.UNSIGNED_SHORT, false, 0);
            
            setTimeout(draw, 1000/30);
        }
    };
};