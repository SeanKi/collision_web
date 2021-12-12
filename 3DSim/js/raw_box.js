// expand THREE.js Sphere to support collision tests versus Box3
// we are creating a vector outside the method scope to avoid spawning a new
// instance of Vector3 in every check

function deg2rad(deg) {
    return deg * Math.PI /180;
}

Game.init = function () {
    this._moveOffset = {a:0, b:0}
    this._rot_dir = 0;

    this.debug = false;

    // the object the user can control to check for collisions
    // this.cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.5),
    //     this.materials.solid);
    this.cube = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 1),
    this.materials.solid);
    this.cube.position.set(0, 0.3, 0);
    // this.cube.rotation.y = deg2rad(-45);
    this.cubeBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    this.cubeBBox.setFromObject(this.cube);
    this.cubeShadow = Utils.createShadow(this.cube, this.materials.shadow);
    Utils.updateShadow(this.cubeShadow, this.cube);
    
    this.cubeCenter = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2),
    this.materials.solid);
    this.cubeCenter.position.set(0, 0.5, 0);

    this.cubeBoxHelper = new THREE.BoxHelper(this.cube, 0x00ff00);
    this.cubeBoxHelper.update();
    this.cubeBoxHelper.visible = true;

    // Sean Ki - new object.
    this.wall = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.1),
        this.materials.solid);
    this.wall.position.set(0, 1.2, -1);
    this.wallShadow = Utils.createShadow(this.wall, this.materials.shadow);
    this.wallBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

    this.wallBBox.setFromObject(this.wall);
    Utils.updateShadow(this.wallShadow, this.wall);
    
    const group = new THREE.Group()
    group.add(this.cube);
    group.add(this.cubeCenter);
    group.position.set(0, 0.5, 0);

    // add objects to the scene
    // this.scene.add(this.cube);
    this.scene.add(group);
    this._group = group;
    this.scene.add(this.cubeBoxHelper);
    
    this.scene.add(this.wall);

    // this.scene.add(this.cubeCenter);

    this.scene.add(this.cubeShadow);
    this.scene.add(this.wallShadow);

    this.controls = new THREE.TransformControls(
        this.camera, this.renderer.domElement);
    this.controls.space = 'world';
    this.controls.attach(this.cube);
    this.controls.attach(this.wall);
    this.scene.add(this.controls);

    this.timestamp = 0;
    this._setupKeycontrol();
};

Game._setupKeycontrol = function() {
    let this_ = this;
    document.onkeydown = function (event) {
        // console.log(event.key);
        if (event.key == 'a')
            this_._moveOffset.a = -0.002;
        else if (event.key == 'd')
            this_._moveOffset.a = 0.002;
        if (event.key == 'w')
            this_._moveOffset.b = -0.002;
        else if (event.key == 's')
            this_._moveOffset.b = 0.002;
        // console.log("down this_._moveOffset.x" + this_._moveOffset.x );
        if (event.key == 'q')
            this_._rot_dir = -0.01;
        if (event.key == 'e')
            this_._rot_dir = 0.01;

    }
    document.onkeyup = function (event) {
        // console.log(event.key);
        this_._moveOffset = {a:0, b:0};
        this_._rot_dir = 0;
        // console.log("up this_._moveOffset.x" + this_._moveOffset.x );
    }
};


Game.update = function (delta) {
    this.timestamp += delta;

    this.controls.update();

    this.cube.position.x += this._moveOffset.a;
    this.cube.position.z += this._moveOffset.b;
    this._group.rotation.y += this._rot_dir;
    // this.cube.rotation.y += this._rot_dir;
    this.cubeBoxHelper.update();

    // update the cube AABB and shadow
    this.wallBBox.setFromObject(this.wall);
    Utils.updateShadow(this.wallShadow, this.wall);

    this.cubeBBox.setFromObject(this.cube);
    Utils.updateShadow(this.cubeShadow, this.cube);

    this.wall.material = (/*this.sphereBBox.intersectsBox(this.wallBBox)||  */  this.cubeBBox.intersectsBox(this.wallBBox
        /*|| this._cubeBBox.intersectsBox(this.wallBBox)*/
        ))
    ? this.materials.colliding
    : this.materials.solid;

};

Game.toggleDebug = function () {
    this.debug = !this.debug;
    this.knotBBox.visible = !!this.debug;
    // this.sphereBBox.visible = !!this.debug;
};
