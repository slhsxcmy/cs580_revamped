const objects = [];
const faces = [];
firstLoop = true;


function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    noStroke();
    ambientMaterial(255);

    // console.log(materials);

    // TODO: create vertexList for Sphere
    objects.push(new Box(createVector(-100, 0, 0), createVector(0, 0, 0), 25));
    // objects[0].generateVertices();
    // objects.push(new Sphere(createVector(-100, 0, 0), createVector(1, 0, 0), 25));
    //objects.push(new Sphere(createVector(100, 0, 0), createVector(0, 0, 0), 25));

    //objects.push(new Box(createVector(100, 0, 100), createVector(0, 0, -1), 25));
    objects.push(new Box(createVector(-75, 0, 0), createVector(0, 0, 0), 50));

    // objects.push(new Torus(createVector(200, 0, 0), createVector(0, 0, 0), 30, 1));
    
    console.log(objects[0].constructor === Sphere);  // or instanceof
    console.log(objects[0].constructor === Box);
    console.log(objects[0].constructor === Obj);
}

const materials = {
    "NOCOL": [255, 0, 0],
    "BROAD": [0, 255, 0],
    "NARROW": [0, 0, 255],
}

function draw() {
    background(127);
    
    // ambientLight(255);
    directionalLight(127, 127, 127, 0.5774, 0.5774, -0.5774);
    
    // ambientMaterial(255, 0, 0);
    // specularMaterial(materials["BROAD"]);

    for (obj of objects) {
        // console.log(obj);
        obj.render();
        obj.move();
    }

    if (firstLoop)
    {
      narrowPhase(objects[0], objects[1]);
      firstLoop = false;
    }

  
    // broadPhase();
  
    //checkIfCollisionSphere();
    //checkIfCollisionBox();
    // checkIfCollisionSphereBox();
}

function broadPhase() {
    // Reset color
    for (let obj of objects) {
        obj.colorKey = "NOCOL";
    }

    // Naive method O(n^2)
    for (let i = 0; i < objects.length; ++i) {
        for (let j = i + 1; j < objects.length; ++j) {
            let o1 = objects[i];
            let o2 = objects[j];
            let dist = p5.Vector.sub(o1.position, o2.position).mag();
            if(dist <= o1.aabb + o2.aabb) {
                o1.colorKey = o2.colorKey = "BROAD";
                narrowPhase(o1, o2);
            }
        }
    }

    // // AABB Sort and Sweep O(nlogn)
    // let overlap = [];//[...Array(objects.length)];  // set of overlapping aabbs on 3 axis
    // for (let i = 0; i < objects.length; i++) {
    //     overlap.push([]);
    // }

    // for (let k = 0; k < 3; k++) { // for each axis
    //     let active = new Set();
    //     let values = [];  // AABB min and max values
        
    //     for (let i = 0; i < objects.length; i++) {
    //         let obj = objects[i];
    //         values.push([obj.position.array()[k] - obj.aabb, 'b', i]);  // min (begin)
    //         values.push([obj.position.array()[k] + obj.aabb, 'e', i]);  // max (end)
    //     }
    //     values.sort((a, b) => a[0] - b[0]);  // sort by values[0]


    //     for (let i = 0; i < objects.length; i++) {  // initialize sets in overlap
    //         overlap[i].push(new Set());
    //     }

    //     for (let l = 0; l < values.length; l++) {
    //         let i = values[l][2];
    //         if(values[l][1] == 'b') {
    //             for(let j of active) {  // only add small index -> large index
    //                 if(i < j) overlap[i][overlap[i].length - 1].add(j); 
    //                 else overlap[j][overlap[j].length - 1].add(i);
    //             }
    //             active.add(i);
    //         } else {
    //             active.delete(i);
    //         }
    //     }
    // }
    
    // for (let i = 0; i < objects.length; i++) {
    //     let intersection = new Set([...overlap[i][0]].filter(x => overlap[i][1].has(x) && overlap[i][2].has(x)))  // 3-set intersection
    //     console.log(i);
    //     console.log(intersection);
    //     for(let j in intersection) {  // i and j might collide
    //         objects[i].colorKey = objects[j].colorKey = "BROAD";
    //         narrowPhase(objects[i], objects[j]);
    //     }
    // }
}


function narrowPhase(o1, o2) {
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
   // Check if all vertices of object 2 are on the other side of a plane parallel to the faces of object 1
   for (let i=0;i<o1.faceList.length;i++)
   {
      let currentFace = o1.faceList[i];
    //   console.log(o1.vertexList);
      // // 2 edges of the square face
      let edge1 = p5.Vector.sub(currentFace[1], currentFace[0]);
      let edge2 = p5.Vector.sub(currentFace[2], currentFace[0]);
      let currentFaceNormal = createVector(((edge1.y * edge2.z) - (edge1.z * edge2.y)),
         ((edge1.z * edge2.x) - (edge1.x * edge2.z)),
         ((edge1.x * edge2.y) - (edge1.y * edge2.x)));

      // Normalize the vector
      p5.Vector.normalize(currentFaceNormal);
      o1FaceNormals.push(currentFaceNormal);
      o1FaceVertex.push(currentFace[0]);
   }

   // Check if all vertices of object 2 are on the other side of a plane parallel to edges (from center) of object 1
   for (let i=0;i<o1.faceList.length;i++)
   {
      let currentFace = o1.faceList[i];
      // 4 edges on each face
      // Find vector from center of object to center-point between edges

      // edge 1 = currentFace[0] - currentFace[1]
      let midEdge1 = p5.Vector.div(p5.Vector.add(currentFace[0], currentFace[1]), 2);
      o1EdgeVertex.push(currentFace[0]);
      // edge 2 = currentFace[2] - currentFace[3]
      let midEdge2 = p5.Vector.div(p5.Vector.add(currentFace[2], currentFace[3]), 2);
      o1EdgeVertex.push(currentFace[2]);
      // edge 3 = currentFace[1] - currentFace[3]
      let midEdge3 = p5.Vector.div(p5.Vector.add(currentFace[1], currentFace[3]), 2);
      o1EdgeVertex.push(currentFace[1]);
      // edge 4 = currentFace[0] - currentFace[2]
      let midEdge4 = p5.Vector.div(p5.Vector.add(currentFace[0], currentFace[2]), 2);
      o1EdgeVertex.push(currentFace[0]);

      // Vector from center of object 1 to center-point between edges
      let vector1 = p5.Vector.sub(midEdge1, o1.position);
      let vector2 = p5.Vector.sub(midEdge2, o1.position);
      let vector3 = p5.Vector.sub(midEdge3, o1.position);
      let vector4 = p5.Vector.sub(midEdge4, o1.position);

      // Normalize the vectors
      p5.Vector.normalize(vector1);
      p5.Vector.normalize(vector2);
      p5.Vector.normalize(vector3);
      p5.Vector.normalize(vector4);
      o1EdgeVectors.push(vector1);
      o1EdgeVectors.push(vector2);
      o1EdgeVectors.push(vector3);
      o1EdgeVectors.push(vector4);
   }

   // Check if all vertices of object 2 are on the other side of a plane parallel to vertices (from center) of object 1
   for (let i=0;i<o1.faceList.length;i++)
   {
      let currentFace = o1.faceList[i];
      // 4 vertices on each face
      // Find vector from center of object to each vertex

      let vector1 = p5.Vector.sub(currentFace[0], o1.position);
      let vector2 = p5.Vector.sub(currentFace[1], o1.position);
      let vector3 = p5.Vector.sub(currentFace[2], o1.position);
      let vector4 = p5.Vector.sub(currentFace[3], o1.position);

      // Normalize the vectors
      p5.Vector.normalize(vector1);
      p5.Vector.normalize(vector2);
      p5.Vector.normalize(vector3);
      p5.Vector.normalize(vector4);
      o1CornerVectors.push(vector1);
      o1CornerVectors.push(vector2);
      o1CornerVectors.push(vector3);
      o1CornerVectors.push(vector4);
      o1CornerVertex.push(currentFace[0]);
      o1CornerVertex.push(currentFace[1]);
      o1CornerVertex.push(currentFace[2]);
      o1CornerVertex.push(currentFace[3]);
   }

   // Check if all vertices of object 2 are in front of one of the face normals
   // (v - a) DOT N
   overlapping = true;
   // Loop over every face normal from object 1
   for (let i=0;i<o1FaceNormals.length;i++)
   {
      let allVerticesInFrontOfFace = true;
      for (let j=0;j<o2.vertexList.length;j++)
      {
         let currentVal = p5.Vector.dot(p5.Vector.sub(o2.vertexList[j], o1FaceVertex[i]), o1FaceNormals[i]);
         if (currentVal <= 0)
         {
            // Current o2 vertex is NOT in front of o1 face normal. Try another o1 Face
            allVerticesInFrontOfFace = false;
            break;
         }
      }
      if (allVerticesInFrontOfFace)
      {
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
            let currentVal = p5.Vector.dot(p5.Vector.sub(o2.vertexList[j], o1EdgeVertex[i]), o1EdgeVectors[i]);
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
            let currentVal = p5.Vector.dot(p5.Vector.sub(o2.vertexList[j], o1CornerVertex[i]), o1CornerVectors[i]);
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



class Obj {
    constructor(pos, vel, ...args) {
        // for display during collision
        this.colorKey = "NOCOL";

        // for collision detection
        this.vertices = [];  // each element is vertex location as p5.Vector(x, y, z) 
        this.faces = [];  // each element is 3 indeces in this.vertices as a 3-tuple 
        this.numVertices = 0;

        this.position = pos;  // p5.Vector
        this.velocity = vel;  // p5.Vector
        this.args     = args;     // arguments, size or radius, etc.
        let x, y, z, r, h;
      
        this.faceList = [];
        this.vertexList = [];
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
                // 8 unique vertices in Box
                this.vertexList.push(createVector(this.position.x+(x/2), this.position.y+(y/2), this.position.z+(z/2)));
                this.vertexList.push(createVector(this.position.x+(x/2), this.position.y+(y/2), this.position.z-(z/2)));
                this.vertexList.push(createVector(this.position.x+(x/2), this.position.y-(y/2), this.position.z+(z/2)));
                this.vertexList.push(createVector(this.position.x+(x/2), this.position.y-(y/2), this.position.z-(z/2)));
                this.vertexList.push(createVector(this.position.x-(x/2), this.position.y+(y/2), this.position.z+(z/2)));
                this.vertexList.push(createVector(this.position.x-(x/2), this.position.y+(y/2), this.position.z-(z/2)));
                this.vertexList.push(createVector(this.position.x-(x/2), this.position.y-(y/2), this.position.z+(z/2)));
                this.vertexList.push(createVector(this.position.x-(x/2), this.position.y-(y/2), this.position.z-(z/2)));
                console.log(this.vertexList);
                this.updateFaceList();
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

    updateFaceList()
    {
      this.faceList = [];
      let face1 = [this.vertexList[0], this.vertexList[2], this.vertexList[4], this.vertexList[6]];
      let face2 = [this.vertexList[5], this.vertexList[7], this.vertexList[1], this.vertexList[3]];
      let face3 = [this.vertexList[1], this.vertexList[0], this.vertexList[5], this.vertexList[4]];
      let face4 = [this.vertexList[7], this.vertexList[6], this.vertexList[3], this.vertexList[2]];
      let face5 = [this.vertexList[0], this.vertexList[2], this.vertexList[1], this.vertexList[3]];
      let face6 = [this.vertexList[5], this.vertexList[7], this.vertexList[4], this.vertexList[6]];
      this.faceList.push(face1);
      this.faceList.push(face2);
      this.faceList.push(face3);
      this.faceList.push(face4);
      this.faceList.push(face5);
      this.faceList.push(face6);
    }

    render() {
        // console.log(this.colorKey);
        specularMaterial(materials[this.colorKey]);
        push();  // save camera
        translate(this.position);  // move camera
        rotateY(90);
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
        this.position.add(this.velocity);
        for (let i=0;i<this.vertexList.size;i++)
        {
           this.vertexList[i].add(this.velocity);
        }
        this.updateFaceList();
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
        this.vertices.push(vertex);
        return this.numVertices++;
    }

     // return index of point in the middle of p1 and p2
     getMiddlePoint(p1, p2) { // two indeces
        // calculate it
        let point1 = this.vertices[p1];
        let point2 = this.vertices[p2];
        // console.log(point1);
        let middle = p5.Vector.add(point1, point2).div(2);  // FIXME

        // add vertex makes sure point is on unit sphere
        let i = this.addVertex(middle); 
        return i;
     }

    generateVertices(maxLevel = 1) {
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
        this.faces.push([0, 11, 5]);
        this.faces.push([0, 5, 1]);
        this.faces.push([0, 1, 7]);
        this.faces.push([0, 7, 10]);
        this.faces.push([0, 10, 11]);

        // 5 adjacent faces 
        this.faces.push([1, 5, 9]);
        this.faces.push([5, 11, 4]);
        this.faces.push([11, 10, 2]);
        this.faces.push([10, 7, 6]);
        this.faces.push([7, 1, 8]);

        // 5 faces around point 3
        this.faces.push([3, 9, 4]);
        this.faces.push([3, 4, 2]);
        this.faces.push([3, 2, 6]);
        this.faces.push([3, 6, 8]);
        this.faces.push([3, 8, 9]);

        // 5 adjacent faces 
        this.faces.push([4, 9, 5]);
        this.faces.push([2, 4, 11]);
        this.faces.push([6, 2, 10]);
        this.faces.push([8, 6, 7]);
        this.faces.push([9, 8, 1]);
    
        console.log(this.faces.length);
        // refine triangles
        for (let i = 0; i < maxLevel; i++) {
            var faces2 = [];
            for (let tri of this.faces) {
                // replace triangle by 4 triangles
                let a = this.getMiddlePoint(tri[0], tri[1]);
                let b = this.getMiddlePoint(tri[1], tri[2]);
                let c = this.getMiddlePoint(tri[2], tri[0]);

                faces2.push([tri[0], a, c]);
                faces2.push([tri[1], b, a]);
                faces2.push([tri[2], c, b]);
                faces2.push([a, b, c]);
            }
            this.faces = faces2;
            console.log(this.faces.length);
        }

        console.assert(this.faces.length == 20 * Math.pow(4, maxLevel));

        // scale and translate to real sphere  
        for (let vertex of this.vertices) {  
            vertex.setMag(this.args[0]);
            vertex.add(this.position);
        }

        // done, now add triangles to mesh
        for (let tri of this.faces) {
            // console.log(tri[0] + " " + tri[1] + " " + tri[2]);
            // console.log(this.vertices[tri[0]]);
            
        }
    }

    // *** Need to call generateVertices first
    getFaceNormals() {
        // returns AB x BC for every face
        let faceNormals = [];
        for (let tri of this.faces) {
            let A = this.vertices[tri[0]];
            let B = this.vertices[tri[1]];
            let C = this.vertices[tri[2]];
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
        for (let tri of this.faces) {
            let A = this.vertices[tri[0]];
            let B = this.vertices[tri[1]];
            let C = this.vertices[tri[2]];
            faceVertices.push(p5.Vector.add(p5.Vector.add(A, B), C).div(3));
        }
        return faceVertices;
    }
}
class Box       extends Obj {}
class Plane     extends Obj {}
class Cylinder  extends Obj {}
class Cone      extends Obj {}
class Torus     extends Obj {}
  
// http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html?m=1
const phi = (1.0 + Math.sqrt(5.0)) / 2.0;

// class IcosahedronSphereGenerator {
//     // create 12 vertices of a icosahedron
//     constructor(level) {
//         this.vertices = [];  // each element is vertex location as p5.Vector(x, y, z) 
//         this.faces = [];  // each element is 3 indeces in this.vertices as a 3-tuple 
//         this.index = 0;
//     }

//     // add vertex to mesh, fix position to be on unit sphere, return index
//     addVertex(vertex) {
//         vertex.normalize();
//         this.vertices.push(vertex);
//         return this.index++;
//     }

//      // return index of point in the middle of p1 and p2
//      getMiddlePoint(p1, p2) { // two indeces
//         // calculate it
//         let point1 = this.vertices[p1];
//         let point2 = this.vertices[p2];
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
//         this.faces.push([0, 11, 5]);
//         this.faces.push([0, 5, 1]);
//         this.faces.push([0, 1, 7]);
//         this.faces.push([0, 7, 10]);
//         this.faces.push([0, 10, 11]);

//         // 5 adjacent faces 
//         this.faces.push([1, 5, 9]);
//         this.faces.push([5, 11, 4]);
//         this.faces.push([11, 10, 2]);
//         this.faces.push([10, 7, 6]);
//         this.faces.push([7, 1, 8]);

//         // 5 faces around point 3
//         this.faces.push([3, 9, 4]);
//         this.faces.push([3, 4, 2]);
//         this.faces.push([3, 2, 6]);
//         this.faces.push([3, 6, 8]);
//         this.faces.push([3, 8, 9]);

//         // 5 adjacent faces 
//         this.faces.push([4, 9, 5]);
//         this.faces.push([2, 4, 11]);
//         this.faces.push([6, 2, 10]);
//         this.faces.push([8, 6, 7]);
//         this.faces.push([9, 8, 1]);
    
//         // refine triangles
//         for (let i = 0; i < maxLevel; i++) {
//             var faces2 = [];
//             for (let tri of this.faces) {
//                 // replace triangle by 4 triangles
//                 let a = this.getMiddlePoint(tri[0], tri[1]);
//                 let b = this.getMiddlePoint(tri[1], tri[2]);
//                 let c = this.getMiddlePoint(tri[2], tri[0]);

//                 faces2.push([tri[0], a, c]);
//                 faces2.push([tri[1], b, a]);
//                 faces2.push([tri[2], c, b]);
//                 faces2.push([a, b, c]);
//             }
//             this.faces = faces2;
//         }

//         for (let vertex of this.vertices) {
//             vertex.setMag(this.args[0]);
//         }
//         // done, now add triangles to mesh
//         for (let tri of this.faces) {
//             // console.log(tri[0] + " " + tri[1] + " " + tri[2]);
//             console.log(this.vertices[tri[0]]);
            
//         }
        

//     }
// }