//vars

let canvas
let ctx
let t = 0;

let destinedObjects = [] //contains all objects that can be affected by fate
let fate = [] //remembers the positions and data of all destined objects 20 times every second
let fateTPS = 50;
let mode = 0; //0 - record, 1 - replay
let timeSpeed = 1 //1 is forward, -1 is backward, 0 is stopped

let mouseX = 0
let mouseY = 0

class DestinedObject {
    constructor(i, x, y, w, h, color) {
        this.i = i;
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.dx=0;
        this.dy=0;
        this.color = color;
    }
    updatePhysics() {
        //apply velocity
        this.x += this.dx;
        this.y += this.dy;

        //bound collisions
        if(this.y >= 800-this.h) {
            this.y = 800-this.h
            if(Math.abs(this.dy) < 2) {
                this.dy = 0;
                this.dx = this.dx*0.8 //friction with ground
            } else {
                this.dy = -this.dy*0.5
                this.dx = this.dx*0.8 //friction with ground
            }
        }
        else if(this.y < 0) {
            this.y = 0
            if(Math.abs(this.dy) < 2) {
                this.dy = 0;
                this.dx = this.dx*0.8 //friction with ground
            } else {
                this.dy = -this.dy*0.5
                this.dx = this.dx*0.8 //friction with ground
            }
        } else {
            this.dy += 1;
        }
        if(this.x >= 1280-this.w) {
            this.x = 1280-this.w
            if(Math.abs(this.dx) < 2) {
                this.dx = 0;
            } else {
                this.dx = -this.dx*0.5
            }
        } else if(this.x < 0) {
            this.x = 0
            if(Math.abs(this.dx) < 2) {
                this.dx = 0;
            } else {
                this.dx = -this.dx*0.5
            }
        }

        //
    }
    renderObject() {
        ctx.fillStyle = this.color;
        drawRect(this.x, this.y, this.w, this.h)
    }
    explosion(x, y, power) {
        let distX = this.x-x
        let distY = this.y-y
        
        if(n_distance(this.x, this.y, x, y) < power) {
            let thing = 0;
            if(distX < 0) {
                thing = 1
            } else {
                thing = -1
            }
            this.dx = -(thing+distX/power)*power
            this.dy = -(thing+distY/power)*power
        }
    }
}

function init() {
    setInterval(update, 25);
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    render();
    //input
    window.addEventListener('keydown', (e) => {
        // console.log(e)
        
    })
    window.addEventListener('keyup', (e) => {
        if(e.code == "Space") {
            for(let obj of destinedObjects) {
                obj.explosion(mouseX, mouseY, 100)
            }
        }
        else if(e.code == "KeyS") {
            console.log('Za warudo')
            stopTime()
        }
        else if(e.code == "KeyR") {
            console.log('Reverse')
            reverse()
        }
        else if(e.code == "KeyA") {
            console.log('reset time to 2 seconds ago')
            restart()
        }
    })
    window.addEventListener('mouseup', (e) => {
        // console.log(e)
        addObjectToFate(new DestinedObject(0, e.clientX, e.clientY, 64, 64, "blue"))
    })
    window.addEventListener('mousemove', (e) => {
        mouseX = e.pageX
        mouseY = e.pageY
    })
    addObjectToFate(new DestinedObject(0, 1280/2, 0, 64, 64, "red"))
}

function update() {
    if(mode == 0) {
        t++;
        for(let object of destinedObjects) {
            object.updatePhysics();
        }
        //record fate
        if(t%(100/fateTPS)==0) {
            //remember fate
            let pseudoFate = []
            for(let obj of destinedObjects) {
                let _dest = {
                    i: obj.i,
                    x: obj.x,
                    y: obj.y,
                    w: obj.w,
                    h: obj.h,
                    dx: obj.dx,
                    dy: obj.dy,
                }
                pseudoFate.push(_dest)
            }
            fate.push({
                tick: t,
                objects: pseudoFate
            })
            if(fate.length > fateTPS*10) {
                fate.splice(0, 1);
            }
            // console.log(t, fate.length)
        }
    } else if(mode == 1) {
        t+=1*timeSpeed;
        //get fate at frame t
        let closestRememberedFrame = Math.round((t/(100/fateTPS))-1)*(100/fateTPS)
        // console.log(closestRememberedFrame)
        let fate_slice = fate.find((v) => v.tick == closestRememberedFrame)
        let pseudoObj = []
        if(fate_slice != undefined) {
            // console.log(t, closestRememberedFrame, fate_slice.tick, fate_slice.objects[0].x)
            for(let obj of destinedObjects) {
                let _dest = {
                    i: obj.i,
                    x: obj.x,
                    y: obj.y,
                    w: obj.w,
                    h: obj.h,
                    dx: obj.dx,
                    dy: obj.dy,
                }
                pseudoObj.push(_dest)
            }
            
            //get desired locations for lerping
            pseudoObj.forEach((obj, i) => {
                fate_slice.objects.forEach((slc_obj, j) => {
                    if(i==j) {
                        obj.x = slc_obj.x
                        obj.y = slc_obj.y
                        obj.dx = slc_obj.dx
                        obj.dy = slc_obj.dy
                    }
                })
            })
            let oldpseudoObj = []
            for(let obj of destinedObjects) {
                let _dest = {
                    i: obj.i,
                    x: obj.x,
                    y: obj.y,
                    w: obj.w,
                    h: obj.h,
                    dx: obj.dx,
                    dy: obj.dy,
                }
                oldpseudoObj.push(_dest)
            }
            console.log(t, closestRememberedFrame, closestRememberedFrame/t)
            //set real objects to a lerped locations
            pseudoObj.forEach((obj, i) => {
                oldpseudoObj.forEach((p_obj, j) => {
                    destinedObjects.forEach((r_obj, k) => {
                        if(i==j && j==k) {
                            let factor = (closestRememberedFrame/t)
                            factor = 0.5
                            r_obj.x = n_lerp(obj.x, p_obj.x, factor)
                            r_obj.y = n_lerp(obj.y, p_obj.y, factor)
                            r_obj.dx = p_obj.dx
                            r_obj.dy = p_obj.dy
                        }
                    })
                })
            })

        } else {
            mode = 0;
            timeSpeed = 1;
            fate = [];
            console.log("Encountered undefined fate. Resetting to record mode")
            console.log(t, closestRememberedFrame)
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawCircle(mouseX, mouseY, 100, 'green')
    destinedObjects.forEach((obj, i) => {
        obj.renderObject()
    })

    requestAnimationFrame(render)
}

function n_lerp(a, b ,t) {
  //smoothly lerps between a and b in t (value between 0 and 1. Lower value - longer interpolation)
  return (1 - t) * a + t * b;
}

function addObjectToFate(data) {
    data.i = destinedObjects.length
    destinedObjects.push(data)
}

function drawTexture(path, x, y, width, height) {
    //setup image
    let _img = new Image();

    //gather path
    _img.src = path;

    //render image
    ctx.drawImage(_img, x, y, width, height);
}

function drawRect(x, y, width, height) {
    ctx.fillRect(x, y, width, height);
}

function collision(x1, y1, w1, h1, x2, y2, w2, h2,) {
    if(x1+w1 >= x2 && x1 < x2+w2) {
        if(y1+h1 >= y2 && y1 < y2+h2) {
            return true
        }
    }
    return false;
}
function n_distance(x1, y1, x2, y2) {
    //returns distance between 2 positions. Doesn't use vectors
    let _a = x1 - x2, _b = y1 - y2;
    return Math.sqrt(Math.pow(_a, 2) + Math.pow(_b, 2));
}

function drawCircle(x, y, radius, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, false);
    ctx.fill();
}

function stopTime() {
    if(mode == 0) {
        mode = 1;
        timeSpeed = 0;
    } else {
        mode = 0;
        timeSpeed = 1;
    }
}

function reverse() {
    mode = 1;
    timeSpeed = -1;
}

function restart() {
    mode = 1;
    timeSpeed;
    t = t-fateTPS*2
}