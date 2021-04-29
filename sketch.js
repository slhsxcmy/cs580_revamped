const objects = [];
const faces = [];
firstLoop = true;


function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    
    noStroke();
    ambientMaterial(255);


    // // Demo 1 OK
    // objects.push(new Sphere(createVector(-100, 0, 0), createVector(1, 0, 0), 25));
    // objects.push(new Box(createVector(100, 50, 0), createVector(-1, 0, 0), 50));
    camera((width/2.0), (-height/2.0), (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
    // camera(200, 200, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);

    // // Demo 1: Box - Sphere Broad Phase
    // objects.push(new Box(createVector(100, 100, 0), createVector(-1, 0, 0), 50));
    // objects.push(new Sphere(createVector(-100, 50, 0), createVector(1, 0, 0), 25));

    // // Demo 2: Box - Sphere Narrow Phase
    // objects.push(new Box(createVector(100, 100, 0), createVector(-1, 0, 0), 50));
    // objects.push(new Sphere(createVector(-100, 55, 0), createVector(1, 0, 0), 25));

    // // Demo 2 OK
    // objects.push(new Sphere(createVector(-100, 0, 0), createVector(1, 0, 0), 25));
    // objects.push(new Box(createVector(100, 45, 0), createVector(-1, 0, 0), 50));

    // // Demo 3 OK
    // objects.push(new Sphere(createVector(-50, -100, 0), createVector(0.5, 0.5, 0), 50));
    // objects.push(new Sphere(createVector(100, 100, 0), createVector(-0.5, -0.5, 0), 50));

    // // Demo 4 OK
    // objects.push(new Box(createVector(-50, -20, 0), createVector(1, 0.3, 0), 50));
    // objects.push(new Box(createVector(150, 20, 0), createVector(-1, 0, 0), 100));

    // // Demo 5 OK
    // // objects.push(new Box(createVector(-0, 0, 0), createVector(1, 0, 0), 25));
    // // objects.push(new Box(createVector(-250, 0, 0), createVector(1, 0, 0), 25));
    // objects.push(new Box(createVector(-500, 0, 0), createVector(1, 0, 0), 25));
    // objects.push(new Box(createVector(150, 20, 0), createVector(-1, 0, 0), 50));

    // // Demo 6 
    // objects.push(new Sphere(createVector(-150, 0, 0), createVector(1, 0, 0), 25));
    // objects.push(new Sphere(createVector(150, 0, 0), createVector(-1, 0, 0), 25));
    // objects.push(new Sphere(createVector(0, 150, 0), createVector(0, -1, 0), 25));
    // objects.push(new Sphere(createVector(0, -150, 0), createVector(0, 1, 0), 25));

    

}

const materials = {
    "NOCOL": [255, 0, 0],
    "BROAD": [0, 255, 0],
    "NARROW": [0, 0, 255],
}

function draw() {
    background(127);


    ambientLight(255);
    directionalLight(127, 127, 127, 0.5774, 0.5774, -0.5774);

    specularMaterial(127, 0, 0);
    push();
    rotateX(PI/4);
    rotateY(PI/4);
    rotateZ(0.8);
    box(57.735026919);
    pop();

    // specularMaterial(127, 0, 0);
    // box(100);
    noStroke();
    let c = color(0, 126, 255, 102);
    fill(c);
    // rect(15, 15, 35, 70);
    // let value = alpha(c); // Sets 'value' to 102
    // fill(value);
    box(100);

    // specularMaterial(materials["BROAD"]);

    for (obj of objects) {
        // console.log(obj);
        obj.render();
        obj.move();
    }

    // if (firstLoop)
    // {
    //   narrowPhase(objects[0], objects[1]);
    //   firstLoop = false;
    // }


    broadPhase();

    //checkIfCollisionSphere();
    //checkIfCollisionBox();
    // checkIfCollisionSphereBox();
}

function broadPhase() {
    // Reset color
    for (let obj of objects) {
        obj.colorKey = "NOCOL";
    }

    // // Naive method O(n^2)
    // for (let i = 0; i < objects.length; ++i) {
    //     for (let j = i + 1; j < objects.length; ++j) {
    //         let o1 = objects[i];
    //         let o2 = objects[j];
    //         let dist = p5.Vector.sub(o1.position, o2.position).mag();
    //         if(dist <= o1.aabb + o2.aabb) {
    //             o1.colorKey = o2.colorKey = "BROAD";
    //             narrowPhase(o1, o2);
    //         }
    //     }
    // }

    // AABB Sort and Sweep O(nlogn)
    let overlap = [];//[...Array(objects.length)];  // set of overlapping aabbs on 3 axis
    for (let i = 0; i < objects.length; i++) {
        overlap.push([]);
    }

    for (let k = 0; k < 3; k++) { // for each axis
        let active = new Set();
        let values = [];  // AABB min and max values

        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];
            values.push([obj.position.array()[k] - obj.aabb, 'b', i]);  // min (begin)
            values.push([obj.position.array()[k] + obj.aabb, 'e', i]);  // max (end)
        }
        values.sort((a, b) => a[0] - b[0]);  // sort by values[0]


        for (let i = 0; i < objects.length; i++) {  // initialize sets in overlap
            overlap[i].push(new Set());
        }

        for (let l = 0; l < values.length; l++) {
            let i = values[l][2];
            if(values[l][1] == 'b') {
                for(let j of active) {  // only add small index -> large index
                    // if(i < j) 
                        overlap[i][overlap[i].length - 1].add(j);
                    // else 
                        overlap[j][overlap[j].length - 1].add(i);
                }
                active.add(i);
            } else {
                active.delete(i);
            }
        }
    }

    for (let i = 0; i < objects.length; i++) {
        let intersection = new Set([...overlap[i][0]].filter(x => overlap[i][1].has(x) && overlap[i][2].has(x)))  // 3-set intersection
        // console.log(i);
        // console.log(intersection);
        for(let j of intersection) {  // i and j might collide
            // console.log("objects[i].colorKey = objects[j].colorKey = \"BROAD\";");
            objects[i].colorKey = objects[j].colorKey = "BROAD";
            narrowPhase(objects[i], objects[j]);
        }
    }
}


function narrowPhase(o1, o2) {
    // let o1, o2;
    // if(obj1.faceList.length <= obj2.faceList.length) {  // FIXME: object with fewer faces should be o1
    //     o1 = obj1;
    //     o2 = obj2;
    // } else {
    //     o1 = obj2;
    //     o2 = obj1;
    // }
//    console.log("Called Narrow Phase")
   // Separating Axis Theorem
   // Calculate Surface Normals of each face on object 1
   let o1FaceNormals = [];
   let o1EdgeVectors = [];
   let o1CornerVectors = [];
   // one vertex on each face. Indeces match up with face normals object
   let o1FaceVertex = [];
   let o1EdgeVertex = [];
   let o1CornerVertex = [];

//    for (let i=0;i<o1.vertexList.length;i++){
//         console.log(o1.vertexList[i]);
//    }

   // Check if all vertices of object 2 are on the other side of a plane parallel to the faces of object 1
   for (let i=0;i<o1.faceList.length;i++)
   {
      let currentFace = o1.faceList[i];
    //   console.log(currentFace[0]);
      let v0 = p5.Vector.add(o1.position, o1.vertexList[currentFace[0]]);
      let v1 = p5.Vector.add(o1.position, o1.vertexList[currentFace[1]]);
      let v2 = p5.Vector.add(o1.position, o1.vertexList[currentFace[2]]);
    //   let v3 = p5.Vector.add(o1.position, o1.vertexList[currentFace[3]]);
    //   console.log(currentFace[3]);
    //   console.log(o1);
    //   console.log(v0);
    //   console.log(o1.vertexList);
      // // 2 edges of the square face
      let edge1 = p5.Vector.sub(v1, v0);
      let edge2 = p5.Vector.sub(v2, v0);
      let currentFaceNormal = createVector(((edge1.y * edge2.z) - (edge1.z * edge2.y)),
         ((edge1.z * edge2.x) - (edge1.x * edge2.z)),
         ((edge1.x * edge2.y) - (edge1.y * edge2.x)));

      // Normalize the vector
      currentFaceNormal.normalize();
      o1FaceNormals.push(currentFaceNormal);
      o1FaceVertex.push(v0);
   }

   // Check if all vertices of object 2 are on the other side of a plane parallel to edges (from center) of object 1
   for (let i=0;i<o1.faceList.length;i++)
   {
      let currentFace = o1.faceList[i];
      let v0 = p5.Vector.add(o1.position, o1.vertexList[currentFace[0]]);
      let v1 = p5.Vector.add(o1.position, o1.vertexList[currentFace[1]]);
      let v2 = p5.Vector.add(o1.position, o1.vertexList[currentFace[2]]);
    //   let v3 = p5.Vector.add(o1.position, o1.vertexList[currentFace[3]]);
      // 4 edges on each face
      // Find vector from center of object to center-point between edges

      // edge 1 = currentFace[0] - currentFace[1]
      let midEdge1 = p5.Vector.div(p5.Vector.add(v0, v1), 2);
      o1EdgeVertex.push(v0);
      // edge 2 = currentFace[2] - currentFace[3]
    //   let midEdge2 = p5.Vector.div(p5.Vector.add(v2, v3), 2);
    //   o1EdgeVertex.push(v2);
      // edge 3 = currentFace[1] - currentFace[3]
    //   let midEdge3 = p5.Vector.div(p5.Vector.add(v1, v3), 2);
    //   o1EdgeVertex.push(v1);
      // edge 4 = currentFace[0] - currentFace[2]
      let midEdge4 = p5.Vector.div(p5.Vector.add(v0, v2), 2);
      o1EdgeVertex.push(v0);

      // Vector from center of object 1 to center-point between edges
      let vector1 = p5.Vector.sub(midEdge1, o1.position);
    //   let vector2 = p5.Vector.sub(midEdge2, o1.position);
    //   let vector3 = p5.Vector.sub(midEdge3, o1.position);
      let vector4 = p5.Vector.sub(midEdge4, o1.position);

      // Normalize the vectors
      vector1.normalize();
    //   vector2.normalize();
    //   vector3.normalize();
      vector4.normalize();
      o1EdgeVectors.push(vector1);
    //   o1EdgeVectors.push(vector2);
    //   o1EdgeVectors.push(vector3);
      o1EdgeVectors.push(vector4);
   }

   // Check if all vertices of object 2 are on the other side of a plane parallel to vertices (from center) of object 1
   for (let i=0;i<o1.faceList.length;i++)
   {
      let currentFace = o1.faceList[i];
      let v0 = p5.Vector.add(o1.position, o1.vertexList[currentFace[0]]);
      let v1 = p5.Vector.add(o1.position, o1.vertexList[currentFace[1]]);
      let v2 = p5.Vector.add(o1.position, o1.vertexList[currentFace[2]]);
    //   let v3 = p5.Vector.add(o1.position, o1.vertexList[currentFace[3]]);
      // 4 vertices on each face
      // Find vector from center of object to each vertex

      let vector1 = p5.Vector.sub(v0, o1.position);
      let vector2 = p5.Vector.sub(v1, o1.position);
      let vector3 = p5.Vector.sub(v2, o1.position);
    //   let vector4 = p5.Vector.sub(v3, o1.position);

      // Normalize the vectors
      vector1.normalize();
      vector2.normalize();
      vector3.normalize();
    //   vector4.normalize();
      o1CornerVectors.push(vector1);
      o1CornerVectors.push(vector2);
      o1CornerVectors.push(vector3);
    //   o1CornerVectors.push(vector4);
      o1CornerVertex.push(v0);
      o1CornerVertex.push(v1);
      o1CornerVertex.push(v2);
    //   o1CornerVertex.push(v3);
   }

    console.log(o1FaceNormals);
    console.log(o1EdgeVectors);
    console.log(o1CornerVectors);
    console.log(o1FaceVertex);
    console.log(o1EdgeVertex);
    console.log(o1CornerVertex);
  

   let o2verticeCoords = [];
   for (let j=0;j<o2.vertexList.length;j++){
       o2verticeCoords.push(p5.Vector.add(o2.position, o2.vertexList[j]));
   }
   // Check if all vertices of object 2 are in front of one of the face normals
   // (v - a) DOT N
   overlapping = true;
   // Loop over every face normal from object 1
//    console.log(o1FaceNormals.length);
   for (let i=0;i<o1FaceNormals.length;i++)
   {
        console.log("i: " + i);
        let allVerticesInFrontOfFace = true;
        for (let j=0;j<o2.vertexList.length;j++)
        {
            let currentVal = p5.Vector.dot(p5.Vector.sub(o2verticeCoords[j], o1FaceVertex[i]), o1FaceNormals[i]);
            if (currentVal <= 0)
            {
                // Current o2 vertex is NOT in front of o1 face normal. Try another o1 Face
                allVerticesInFrontOfFace = false;
                break;
            }
            if (i==10)
            {
                console.log(p5.Vector.sub(o2verticeCoords[j]));
                console.log(p5.Vector.sub(o1FaceVertex[i]));
                console.log(p5.Vector.sub(o2verticeCoords[j], o1FaceVertex[i]));
                console.log(o1FaceNormals[i]);
                console.log("dot: " + currentVal);
            }
        }
        // console.log(allVerticesInFrontOfFace);
        if (allVerticesInFrontOfFace)
        {
            console.log("hit");
            overlapping = false;
            break;
        } 
   }

   // If haven't found a separating plane yet, check edge planes
   if (overlapping)
   {
      for (let i=0;i<o1EdgeVectors.length;i++)
      {
         let allVerticesInFrontOfEdge = true;
         for (let j=0;j<o2.vertexList.length;j++)
         {
            let currentVal = p5.Vector.dot(p5.Vector.sub(o2verticeCoords[j], o1EdgeVertex[i]), o1EdgeVectors[i]);
            if (currentVal <= 0)
            {
               // Current o2 vertex is NOT in front of o1 edge normal. Try another o1 Edge Normal
               allVerticesInFrontOfEdge = false;
               break;
            }
         }
         if (allVerticesInFrontOfEdge)
         {
            overlapping = false;
            break;
         }
      }
   }

   // If haven't found a separating plane yet, check corner planes
   if (overlapping)
   {
      for (let i=0;i<o1CornerVectors.length;i++)
      {
         let allVerticesInFrontOfCorner = true;
         for (let j=0;j<o2.vertexList.length;j++)
         {
            let currentVal = p5.Vector.dot(p5.Vector.sub(o2verticeCoords[j], o1CornerVertex[i]), o1CornerVectors[i]);
            if (currentVal <= 0)
            {
               // Current o2 vertex is NOT in front of o1 corner normal. Try another o1 Corner Normal
               allVerticesInFrontOfCorner = false;
               break;
            }
         }
         if (allVerticesInFrontOfCorner)
         {
            overlapping = false;
            break;
         }
      }
   }


   if (overlapping)
   {
      o1.colorKey = o2.colorKey = "NARROW";
      console.log("overlapping");
      return true;
   }
   else
   {
      console.log("not overlapping");
      return false;
   }
}

function checkIfCollisionSphere()
{
    if (Math.sqrt(Math.pow(objects[0].position.x - objects[1].position.x, 2) + Math.pow(objects[0].position.y - objects[1].position.y, 2) + Math.pow(objects[0].position.z - objects[1].position.z, 2)) <= (objects[0].size + objects[1].size))
    {
        console.log("Collision: bouncing back!");
        xRatio = (objects[0].position.x - objects[1].position.x) / (objects[0].size + objects[1].size);
        yRatio = (objects[0].position.y - objects[1].position.y) / (objects[0].size + objects[1].size);
        zRatio = (objects[0].position.z - objects[1].position.z) / (objects[0].size + objects[1].size);
        objects[0].bounceBack(xRatio, yRatio, zRatio);
        objects[1].bounceBack(xRatio * -1, yRatio * -1, zRatio * -1);
    }

}

function checkIfCollisionBox()
{
    // Check for overlap in x, y, and z directions
    if (objects[0].position.x + (objects[0].size/2) > objects[1].position.x - (objects[1].size/2) && objects[0].position.x - (objects[0].size/2) < objects[1].position.x + (objects[1].size/2)
        && objects[0].position.y + (objects[0].size/2) > objects[1].position.y - (objects[1].size/2) && objects[0].position.y - (objects[0].size/2) < objects[1].position.y + (objects[1].size/2)
        && objects[0].position.z + (objects[0].size/2) > objects[1].position.z - (objects[1].size/2) && objects[0].position.z - (objects[0].size/2) < objects[1].position.z + (objects[1].size/2))
    {

        console.log("Collision: bouncing back!");
        xRatio = (objects[0].position.x - objects[1].position.x) / (objects[0].size + objects[1].size);
        yRatio = (objects[0].position.y - objects[1].position.y) / (objects[0].size + objects[1].size);
        zRatio = (objects[0].position.z - objects[1].position.z) / (objects[0].size + objects[1].size);
        objects[0].velocity.x *= -1;
        objects[0].velocity.y *= -1;
        objects[0].velocity.z *= -1;

    }
}

function checkIfCollisionSphereBox()
{
    // Assuming Circle = 0 and Box = 1
    let x = Math.max(objects[1].position.x - (objects[1].size/2), Math.min(objects[0].position.x, objects[1].position.x + (objects[1].size/2)));
    let y = Math.max(objects[1].position.y - (objects[1].size/2), Math.min(objects[0].position.y, objects[1].position.y + (objects[1].size/2)));
    let z = Math.max(objects[1].position.z - (objects[1].size/2), Math.min(objects[0].position.z, objects[1].position.z + (objects[1].size/2)));

    let dist = Math.sqrt(Math.pow(x - objects[0].position.x, 2) + Math.pow(y - objects[0].position.y, 2) + Math.pow(z - objects[0].position.z, 2));
    if (dist < objects[0].size)
    {
        console.log("Collision: bouncing back!");
        xRatio = (objects[0].position.x - objects[1].position.x) / (objects[0].size + objects[1].size);
        yRatio = (objects[0].position.y - objects[1].position.y) / (objects[0].size + objects[1].size);
        zRatio = (objects[0].position.z - objects[1].position.z) / (objects[0].size + objects[1].size);
        objects[0].velocity.x *= -1;
        objects[0].velocity.y *= -1;
        objects[0].velocity.z *= -1;
    }
}

function multMatrix(A, B) {
    let T = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for(let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4.; k++) {
                T[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return T;
}
function multVector(A, b) {
	let t = [0,0,0,0];
	for (let i = 0; i < 4; ++i) {
		for (let j = 0; j < 4; ++j) {
			t[i] += A[i][j] * b[j];
		}
	}
    return t;
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web
function rotateAroundXAxis(a) {
    return [
            [1,       0,        0,     0],
            [0,  cos(a),  -sin(a),     0],
            [0,  sin(a),   cos(a),     0],
            [0,       0,        0,     1]
    ];
}

function rotateAroundYAxis(a) {
    return [
        [cos(a),   0, sin(a),   0],
            [0,   1,      0,   0],
        [-sin(a),   0, cos(a),   0],
            [0,   0,      0,   1]
    ];
}

function rotateAroundZAxis(a) {
    return [
        [cos(a), -sin(a),    0,    0],
        [sin(a),  cos(a),    0,    0],
            [0,       0,    1,    0],
            [0,       0,    0,    1]
    ];
}

class Obj {
    constructor(pos, vel, apos, avel, ...args) {
        // for display during collision
        this.colorKey = "NOCOL";

        // for collision detection
        this.vertexList = [];  // each element is vertex location as p5.Vector(x, y, z) 
        this.faceList = [];  // each element is 3 indeces in this.vertexList as a 3-tuple 
        this.numVertices = 0;

        this.position = pos;  // p5.Vector
        this.velocity = vel;  // p5.Vector
        this.angularPosition = apos;  // p5.Vector
        this.angularVelocity = avel;  // p5.Vector

        this.args     = args;     // arguments, size or radius, etc.
        let x, y, z, r, h;

        switch (this.constructor) {  // AABB size based on shape type
            case Sphere:
                r = args[0];
                this.aabb = r;  // bounding box range: position ± aabb
                break;
            case Box:
                x = args[0];
                y = args[1 % args.length];
                z = args[args.length - 1];
                this.aabb = createVector(x, y, z).mag();
                break;
            case Plane:
                x = args[0];
                y = args[1 % args.length];
                this.aabb = createVector(x, y).mag();
                break;
            case Cylinder:
            case Cone:
                r = args[0];
                h = args[1 % args.length];
                this.aabb = createVector(r, h / 2).mag();
                break;
            case Torus:
                r = args[0];
                h = args[1 % args.length];
                this.aabb = r + h;
                break;
            default: break;
        }
    }

    render() {
        // console.log(this.colorKey);
        specularMaterial(materials[this.colorKey]);
        push();  // save camera
        translate(this.position);  // move camera
        rotate(this.angularPosition);
        // rotateY(90);
        switch (this.constructor) {  // render based on type
            case Sphere:    sphere   (...this.args); break;
            case Box:       box      (...this.args); break;
            case Plane:     plane    (...this.args); break;
            case Cylinder:  cylinder (...this.args); break;
            case Cone:      cone     (...this.args); break;
            case Torus:     torus    (...this.args); break;
            default:                                 break;
        }
        pop();  // restore camera
    }

    move() {
        for(let vert of this.vertexList) {
            this.rot(vert);
        }
        this.angularPosition.add(this.angularVelocity);
        this.position.add(this.velocity);
    }

    rot(vert) {
        let rotationMatrix = multMatrix(multMatrix(rotateAroundXAxis(this.angularPosition), rotateAroundYAxis(this.angularPosition)), rotateAroundZAxis(this.angularPosition));
        let arr = vert.array();
        arr.push(1);
        arr = multVector(rotationMatrix, arr);
        arr.pop();
        this.vert = createVector(arr);
    }

    bounceBack(xRatio, yRatio, zRatio)
    {
        let summedSpeeds = Math.abs(this.velocity.x) + Math.abs(this.velocity.y) + Math.abs(this.velocity.z)
        this.velocity.x = summedSpeeds * xRatio;
        this.velocity.y = summedSpeeds * yRatio;
        this.velocity.z = summedSpeeds * zRatio;
    }
}

class Sphere extends Obj {
    // add vertex to mesh, fix position to be on unit sphere, return index
    addVertex(vertex) {
        vertex.normalize();
        this.vertexList.push(vertex);
        return this.numVertices++;
    }

     // return index of point in the middle of p1 and p2
     getMiddlePoint(p1, p2) { // two indeces
        // calculate it
        let point1 = this.vertexList[p1];
        let point2 = this.vertexList[p2];
        // console.log(point1);
        let middle = p5.Vector.add(point1, point2).div(2);  // FIXME

        // add vertex makes sure point is on unit sphere
        let i = this.addVertex(middle);
        return i;
     }

    generateVertices(maxLevel = 1) {
        console.log("maxLevel: " + maxLevel);
        // create 12 vertices of a icosahedron
        this.addVertex(createVector(-1,  phi,  0));
        this.addVertex(createVector( 1,  phi,  0));
        this.addVertex(createVector(-1, -phi,  0));
        this.addVertex(createVector( 1, -phi,  0));

        this.addVertex(createVector( 0, -1,  phi));
        this.addVertex(createVector( 0,  1,  phi));
        this.addVertex(createVector( 0, -1, -phi));
        this.addVertex(createVector( 0,  1, -phi));

        this.addVertex(createVector( phi,  0, -1));
        this.addVertex(createVector( phi,  0,  1));
        this.addVertex(createVector(-phi,  0, -1));
        this.addVertex(createVector(-phi,  0,  1));

        // create 20 triangles of the icosahedron
        // 5 faces around point 0
        this.faceList.push([0, 11, 5]);
        this.faceList.push([0, 5, 1]);
        this.faceList.push([0, 1, 7]);
        this.faceList.push([0, 7, 10]);
        this.faceList.push([0, 10, 11]);
      
        // 5 adjacent faces 
        this.faceList.push([1, 5, 9]);
        this.faceList.push([5, 11, 4]);
        this.faceList.push([11, 10, 2]);
        this.faceList.push([10, 7, 6]);
        this.faceList.push([7, 1, 8]);

        // 5 faces around point 3
        this.faceList.push([3, 9, 4]);
        this.faceList.push([3, 4, 2]);
        this.faceList.push([3, 2, 6]);
        this.faceList.push([3, 6, 8]);
        this.faceList.push([3, 8, 9]);

        // 5 adjacent faces 
        this.faceList.push([4, 9, 5]);
        this.faceList.push([2, 4, 11]);
        this.faceList.push([6, 2, 10]);
        this.faceList.push([8, 6, 7]);
        this.faceList.push([9, 8, 1]);
    
        console.log(this.faceList.length);

        // refine triangles
        for (let i = 0; i < maxLevel; i++) {
            var faces2 = [];
            for (let tri of this.faceList) {
                // replace triangle by 4 triangles
                let a = this.getMiddlePoint(tri[0], tri[1]);
                let b = this.getMiddlePoint(tri[1], tri[2]);
                let c = this.getMiddlePoint(tri[2], tri[0]);

                faces2.push([tri[0], a, c]);
                faces2.push([tri[1], b, a]);
                faces2.push([tri[2], c, b]);
                faces2.push([a, b, c]);
            }
            this.faceList = faces2;
            console.log(this.faceList.length);
        }

        console.assert(this.faceList.length == 20 * Math.pow(4, maxLevel));

        // scale and translate to real sphere  
        for (let vertex of this.vertexList) {  
            vertex.setMag(this.args[0]);
            // vertex.add(this.position);  // don't offset position, do it when detecting collision
        }

        // done, now add triangles to mesh
        for (let tri of this.faceList) {
            // console.log(tri[0] + " " + tri[1] + " " + tri[2]);
            // console.log(this.vertexList[tri[0]]);

        }
    }

    // *** Need to call generateVertices first
    getFaceNormals() {
        // returns AB x BC for every face
        let faceNormals = [];
        for (let tri of this.faceList) {
            let A = this.vertexList[tri[0]];
            let B = this.vertexList[tri[1]];
            let C = this.vertexList[tri[2]];
            let AB = p5.Vector.sub(B, A);
            let BC = p5.Vector.sub(C, B);
            faceNormals.push(p5.Vector.cross(AB, BC));
        }
        return faceNormals;
    }

    // *** Need to call generateVertices first
    getFaceVertices() {
        // returns (A + B + C) / 3 for every face
        let faceVertices = [];
        for (let tri of this.faceList) {
            let A = this.vertexList[tri[0]];
            let B = this.vertexList[tri[1]];
            let C = this.vertexList[tri[2]];
            faceVertices.push(p5.Vector.add(p5.Vector.add(A, B), C).div(3));
        }
        return faceVertices;
    }

    constructor(pos, vel, ...args) {
        super(pos, vel, ...args);
        this.faceList = [];
        this.vertexList = [];

        this.generateVertices(0);  // optional: recursion level  
    }

}
class Box extends Obj {
    constructor(pos, vel, ...args) {
        super(pos, vel, ...args);
        this.faceList = [];
        this.vertexList = [];

        // 8 unique vertices in Box
        // this.vertexList.push(createVector(this.position.x+(x/2), this.position.y+(y/2), this.position.z+(z/2)));
        // this.vertexList.push(createVector(this.position.x+(x/2), this.position.y+(y/2), this.position.z-(z/2)));
        // this.vertexList.push(createVector(this.position.x+(x/2), this.position.y-(y/2), this.position.z+(z/2)));
        // this.vertexList.push(createVector(this.position.x+(x/2), this.position.y-(y/2), this.position.z-(z/2)));
        // this.vertexList.push(createVector(this.position.x-(x/2), this.position.y+(y/2), this.position.z+(z/2)));
        // this.vertexList.push(createVector(this.position.x-(x/2), this.position.y+(y/2), this.position.z-(z/2)));
        // this.vertexList.push(createVector(this.position.x-(x/2), this.position.y-(y/2), this.position.z+(z/2)));
        // this.vertexList.push(createVector(this.position.x-(x/2), this.position.y-(y/2), this.position.z-(z/2)));
        let x = args[0];
        let y = args[1 % args.length];
        let z = args[args.length - 1];
        
        this.vertexList.push(createVector(-(x/2), -(y/2), +(z/2))); // 0
        this.vertexList.push(createVector(-(x/2), +(y/2), +(z/2))); // 1
        this.vertexList.push(createVector(+(x/2), +(y/2), +(z/2))); // 2
        this.vertexList.push(createVector(+(x/2), -(y/2), +(z/2))); // 3
        this.vertexList.push(createVector(+(x/2), -(y/2), -(z/2))); // 4
        this.vertexList.push(createVector(+(x/2), +(y/2), -(z/2))); // 5
        this.vertexList.push(createVector(-(x/2), +(y/2), -(z/2))); // 6
        this.vertexList.push(createVector(-(x/2), -(y/2), -(z/2))); // 7
        console.log(this.vertexList);
        this.updateFaceList();
    }

    updateFaceList()
    {    
    // http://ilkinulas.github.io/development/unity/2016/04/30/cube-mesh-in-unity3d.html flipped by x = y
      this.faceList.push([0, 2, 1]);
      this.faceList.push([0, 3, 2]);
      this.faceList.push([2, 3, 4]);
      this.faceList.push([2, 4, 5]);
      this.faceList.push([1, 2, 5]);
      this.faceList.push([1, 5, 6]);
      this.faceList.push([0, 7, 4]);
      this.faceList.push([0, 4, 3]);
      this.faceList.push([5, 4, 7]);
      this.faceList.push([5, 7, 6]);
      this.faceList.push([0, 6, 7]);
      this.faceList.push([0, 1, 6]);

    }
}
class Plane extends Obj {
    constructor(pos, vel, ...args) {
        super(pos, vel, ...args);
        this.faceList = [];
        this.vertexList = [];
        
        let x = args[0];
        let y = args[1 % args.length];
        
        this.vertexList.push(createVector(-(x/2), -(y/2), +(z/2))); // 0
        this.vertexList.push(createVector(-(x/2), +(y/2), +(z/2))); // 1
        this.vertexList.push(createVector(+(x/2), +(y/2), +(z/2))); // 2
        this.vertexList.push(createVector(+(x/2), -(y/2), +(z/2))); // 3
        this.vertexList.push(createVector(+(x/2), -(y/2), -(z/2))); // 4
        this.vertexList.push(createVector(+(x/2), +(y/2), -(z/2))); // 5
        this.vertexList.push(createVector(-(x/2), +(y/2), -(z/2))); // 6
        this.vertexList.push(createVector(-(x/2), -(y/2), -(z/2))); // 7
        console.log(this.vertexList);
        this.updateFaceList();
    }
}
class Cylinder  extends Obj {}
class Cone      extends Obj {}
class Torus     extends Obj {}

// http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html?m=1
const phi = (1.0 + Math.sqrt(5.0)) / 2.0;

// class IcosahedronSphereGenerator {
//     // create 12 vertices of a icosahedron
//     constructor(level) {
//         this.vertexList = [];  // each element is vertex location as p5.Vector(x, y, z) 
//         this.faceList = [];  // each element is 3 indeces in this.vertexList as a 3-tuple 
//         this.index = 0;
//     }

//     // add vertex to mesh, fix position to be on unit sphere, return index
//     addVertex(vertex) {
//         vertex.normalize();
//         this.vertexList.push(vertex);
//         return this.index++;
//     }

//      // return index of point in the middle of p1 and p2
//      getMiddlePoint(p1, p2) { // two indeces
//         // calculate it
//         let point1 = this.vertexList[p1];
//         let point2 = this.vertexList[p2];
//         console.log(point1);
//         let middle = p5.Vector.add(point1, point2).div(2);  // FIXME

//         // add vertex makes sure point is on unit sphere
//         let i = this.addVertex(middle);
//         return i;
//      }

//     generate(maxLevel) {
//         // create 12 vertices of a icosahedron
//         this.addVertex(createVector(-1,  phi,  0));
//         this.addVertex(createVector( 1,  phi,  0));
//         this.addVertex(createVector(-1, -phi,  0));
//         this.addVertex(createVector( 1, -phi,  0));

//         this.addVertex(createVector( 0, -1,  phi));
//         this.addVertex(createVector( 0,  1,  phi));
//         this.addVertex(createVector( 0, -1, -phi));
//         this.addVertex(createVector( 0,  1, -phi));

//         this.addVertex(createVector( phi,  0, -1));
//         this.addVertex(createVector( phi,  0,  1));
//         this.addVertex(createVector(-phi,  0, -1));
//         this.addVertex(createVector(-phi,  0,  1));

//         // create 20 triangles of the icosahedron
//         // 5 faces around point 0
//         this.faceList.push([0, 11, 5]);
//         this.faceList.push([0, 5, 1]);
//         this.faceList.push([0, 1, 7]);
//         this.faceList.push([0, 7, 10]);
//         this.faceList.push([0, 10, 11]);

//         // 5 adjacent faces 
//         this.faceList.push([1, 5, 9]);
//         this.faceList.push([5, 11, 4]);
//         this.faceList.push([11, 10, 2]);
//         this.faceList.push([10, 7, 6]);
//         this.faceList.push([7, 1, 8]);

//         // 5 faces around point 3
//         this.faceList.push([3, 9, 4]);
//         this.faceList.push([3, 4, 2]);
//         this.faceList.push([3, 2, 6]);
//         this.faceList.push([3, 6, 8]);
//         this.faceList.push([3, 8, 9]);

//         // 5 adjacent faces 
//         this.faceList.push([4, 9, 5]);
//         this.faceList.push([2, 4, 11]);
//         this.faceList.push([6, 2, 10]);
//         this.faceList.push([8, 6, 7]);
//         this.faceList.push([9, 8, 1]);
    
//         // refine triangles
//         for (let i = 0; i < maxLevel; i++) {
//             var faces2 = [];
//             for (let tri of this.faceList) {
//                 // replace triangle by 4 triangles
//                 let a = this.getMiddlePoint(tri[0], tri[1]);
//                 let b = this.getMiddlePoint(tri[1], tri[2]);
//                 let c = this.getMiddlePoint(tri[2], tri[0]);

//                 faces2.push([tri[0], a, c]);
//                 faces2.push([tri[1], b, a]);
//                 faces2.push([tri[2], c, b]);
//                 faces2.push([a, b, c]);
//             }
//             this.faceList = faces2;
//         }

//         for (let vertex of this.vertexList) {
//             vertex.setMag(this.args[0]);
//         }
//         // done, now add triangles to mesh
//         for (let tri of this.faceList) {
//             // console.log(tri[0] + " " + tri[1] + " " + tri[2]);
//             console.log(this.vertexList[tri[0]]);
            
//         }


//     }
// }
