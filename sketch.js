// // https://p5js.org/get-started/
// function setup() {
//     createCanvas(400, 400);
//     background(220);
// }

// function draw() {
//     if (mouseIsPressed) {
//         fill(0);
//     } else {
//         fill(255);
//     }
//     ellipse(mouseX, mouseY, 80, 80);
// }

// // https://github.com/processing/p5.js/wiki/Getting-started-with-WebGL-in-p5
// function setup() {
//     createCanvas(windowWidth, windowHeight, WEBGL);
// }
// function draw(){
//     background(127);
//     ambientLight(255,0,0); //even red light across our objects
//     let dirY = (mouseY / height - 0.5) *2;
//     let dirX = (mouseX / width - 0.5) *2;
//     directionalLight(250, 250, 250, dirX, -dirY, 0.25);
//     ambientMaterial(250);
//     sphere();
//     translate(100,100,-100);
//     // rotateX(radians(45));
//     sphere();
// }

// // https://p5js.org/examples/3d-multiple-lights.html
// function setup() {
//     createCanvas(710, 400, WEBGL);
// }
// function draw() {
//     background(127);
//     noStroke();  // no edges

//     let locX = mouseX - height / 2;
//     let locY = mouseY - width / 2;

//     ambientLight(50);
//     directionalLight(255, 0, 0, 0.25, 0.25, 0);
//     pointLight(0, 0, 255, locX, locY, 250);

//     push();
//     translate(-width / 4, 0, 0);
//     rotateZ(frameCount * 0.02);
//     rotateX(frameCount * 0.02);
//     specularMaterial(250);
//     box(100, 100, 100);
//     pop();

//     translate(width / 4, 0, 0);
//     ambientMaterial(250);
//     sphere(120, 64);
// }

// // https://p5js.org/examples/3d-ray-casting.html
// const objects = [];
// let eyeZ;

// function setup() {
//   createCanvas(710, 400, WEBGL);

//   eyeZ = height / 2 / tan((30 * PI) / 180); // The default distance the camera is away from the origin.

//   objects.push(new IntersectPlane(1, 0, 0, -100, 0, 0)); // Left wall
//   objects.push(new IntersectPlane(1, 0, 0, 100, 0, 0)); // Right wall
//   objects.push(new IntersectPlane(0, 1, 0, 0, -100, 0)); // Bottom wall
//   objects.push(new IntersectPlane(0, 1, 0, 0, 100, 0)); // Top wall
//   objects.push(new IntersectPlane(0, 0, 1, 0, 0, 0)); // Back wall

//   noStroke();
//   ambientMaterial(250);
// }

// function draw() {
//   background(0);

//   // Lights
//   pointLight(255, 255, 255, 0, 0, 400);
//   ambientLight(244, 122, 158);

//   // Left wall
//   push();
//   translate(-100, 0, 200);
//   rotateY((90 * PI) / 180);
//   plane(400, 200);
//   pop();

//   // Right wall
//   push();
//   translate(100, 0, 200);
//   rotateY((90 * PI) / 180);
//   plane(400, 200);
//   pop();

//   // Bottom wall
//   push();
//   translate(0, 100, 200);
//   rotateX((90 * PI) / 180);
//   plane(200, 400);
//   pop();

//   // Top wall
//   push();
//   translate(0, -100, 200);
//   rotateX((90 * PI) / 180);
//   plane(200, 400);
//   pop();

//   plane(200, 200); // Back wall

//   const x = mouseX - width / 2;
//   const y = mouseY - height / 2;

//   const Q = createVector(0, 0, eyeZ); // A point on the ray and the default position of the camera.
//   const v = createVector(x, y, -eyeZ); // The direction vector of the ray.

//   let intersect; // The point of intersection between the ray and a plane.
//   let closestLambda = eyeZ * 10; // The draw distance.

//   for (let x = 0; x < objects.length; x += 1) {
//     let object = objects[x];
//     let lambda = object.getLambda(Q, v); // The value of lambda where the ray intersects the object

//     if (lambda < closestLambda && lambda > 0) {
//       // Find the position of the intersection of the ray and the object.
//       intersect = p5.Vector.add(Q, p5.Vector.mult(v, lambda));
//       closestLambda = lambda;
//     }
//   }

//   // Cursor
//   push();
//   translate(intersect);
//   fill(237, 34, 93);
//   sphere(10);
//   pop();
// }

// // Class for a plane that extends to infinity.
// class IntersectPlane {
//   constructor(n1, n2, n3, p1, p2, p3) {
//     this.normal = createVector(n1, n2, n3); // The normal vector of the plane
//     this.point = createVector(p1, p2, p3); // A point on the plane
//     this.d = this.point.dot(this.normal);
//   }

//   getLambda(Q, v) {
//     return (-this.d - this.normal.dot(Q)) / this.normal.dot(v);
//   }
// }
  
const objects = [];

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    noStroke();
    ambientMaterial(255);

    objects.push(new Sphere(createVector(-100, 0, 0), createVector(0, 1, 1), 50));
    objects.push(new Sphere(createVector(100, 0, 0), createVector(0, -1, -1), 25));
    console.log(objects[0].constructor === Sphere);  // or instanceof
    console.log(objects[0].constructor === Box);
    console.log(objects[0].constructor === Obj);
}

function draw() {
    background(127);
    
    ambientLight(50);
    directionalLight(255, 0, 0, 0.25, 0.25, 0);

    for (obj of objects) {
        obj.render();
        obj.move();
    }

    for (let i = 0; i < objects.length; ++i) {
        for (let j = i + 1; j < objects.length; ++j) {
            let o1 = objects[i];
            let o2 = objects[j];
            checkCollision(o1, o2);
        }
    }
}

function checkCollision(o1, o2) {
    // TODO
}

class Obj {
    constructor(pos, vel, ...args) {
        this.position = pos;  // p5.Vector
        this.velocity = vel;  // p5.Vector
        this.args     = args;     // arguments, size or radius, etc.
    }

    render() {
        push();  // save camera
        translate(this.position);  // move camera
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
    }
}

class Sphere    extends Obj {}
class Box       extends Obj {}
class Plane     extends Obj {}
class Cylinder  extends Obj {}
class Cone      extends Obj {}
class Torus     extends Obj {}
  