const objects = [];

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    noStroke();
    ambientMaterial(255);

  
    // objects.push(new Sphere(createVector(-100, 0, 0), createVector(1, 0, 0), 25));
    //objects.push(new Sphere(createVector(100, 0, 0), createVector(0, 0, 0), 25));

    //objects.push(new Box(createVector(100, 0, 100), createVector(0, 0, -1), 25));
    objects.push(new Box(createVector(50, 0, 0), createVector(0, 0, 0), 50));

    objects.push(new Torus(createVector(100, 0, 0), createVector(0, 0, 0), 30, 1));
    
    // objects.push(new Sphere(createVector(-100, 0, 0), createVector(1, 0, 0), 25));
    
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
  
    broadPhase();

    //checkIfCollisionSphere();
    //checkIfCollisionBox();
    // checkIfCollisionSphereBox();
}

function broadPhase() {
    // console.log(objects[0].position.x);
    // console.log(objects[0].aabb);
    // console.log(objects[0].position.x - objects[0].aabb);
    
    // Naive method
    // for (let i = 0; i < objects.length; ++i) {
    //     for (let j = i + 1; j < objects.length; ++j) {
    //         let o1 = objects[i];
    //         let o2 = objects[j];
    //         narrowPhase(o1, o2);
    //     }
    // }

    // AABB Sort and Sweep
    let overlap = [];//[...Array(objects.length)];  // set of overlapping aabbs on 3 axis
    for (let i = 0; i < objects.length; i++) {
        overlap.push([]);
    }
    // console.log(overlap);

    for (let k = 0; k < 3; k++) { // for each axis
        let active = new Set();
        let values = [];  // AABB min and max values
        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];
            // console.log(k + " " + i + " " + (obj.position.array()[k] - obj.aabb) + " " + (obj.position.array()[k] + obj.aabb));
            values.push([obj.position.array()[k] - obj.aabb, 'b', i]);  // min (begin)
            values.push([obj.position.array()[k] + obj.aabb, 'e', i]);  // max (end)
        }
        values.sort((a, b) => a[0] - b[0]);  // TODO?: sort values then 'b' 'e'
        // console.log(values);
        for (let i = 0; i < values.length; i++) {
            if(values[i][1] == 'b') {
                // console.log(i + " " + values[i][2]);
                overlap[values[i][2]].push(new Set(active));
                active.add(values[i][2]);
            } else {
                active.delete(values[i][2]);
            }
        }
    }

    // TODO: make overlap symmetric
    for (let k = 0; k < 3; k++) { // for each axis
        // TODO: intersection
    }

    // console.log(overlap.length);
    // console.log(overlap[0]);
    // console.log(overlap[1]);
    console.log(overlap);
    
}
 

function narrowPhase(o1, o2) {
    // TODO
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
        this.position = pos;  // p5.Vector
        this.velocity = vel;  // p5.Vector
        this.args     = args;     // arguments, size or radius, etc.
        let x, y, z, r, h;
        switch (this.constructor) {  // render based on type
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

    bounceBack(xRatio, yRatio, zRatio)
    {
        let summedSpeeds = Math.abs(this.velocity.x) + Math.abs(this.velocity.y) + Math.abs(this.velocity.z)
        this.velocity.x 
          
          
          = summedSpeeds * xRatio;
        this.velocity.y = summedSpeeds * yRatio;
        this.velocity.z = summedSpeeds * zRatio;
    }
}

class Sphere    extends Obj {}
class Box       extends Obj {}
class Plane     extends Obj {}
class Cylinder  extends Obj {}
class Cone      extends Obj {}
class Torus     extends Obj {}
  