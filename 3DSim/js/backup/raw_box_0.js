// expand THREE.js Sphere to support collision tests versus Box3
// we are creating a vector outside the method scope to avoid spawning a new
// instance of Vector3 in every check

function deg2rad(deg) {
    return deg * Math.PI /180;
}

Game.init = function () {
    this._moveOffset = {x:0, y:0}
    this._rot_dir = 0;

    this.debug = false;

    this.knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.5, 0.1), this.materials.solid);
    this.knot.position.set(-3, 2, 1);
    this.knotBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());


    // the object the user can control to check for collisions
    // this.cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.5),
    //     this.materials.solid);
    this.cube = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 1),
    this.materials.solid);
    this.cube.position.set(2, 0.3, 0);
    // this.cube.rotation.y = deg2rad(-45);
    this.cubeBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    this.cubeBBox.setFromObject(this.cube);
    this.cubeShadow = Utils.createShadow(this.cube, this.materials.shadow);
    Utils.updateShadow(this.cubeShadow, this.cube);
    
    this.cubeBoxHelper = new THREE.BoxHelper(this.cube, 0x00ff00);
    this.cubeBoxHelper.update();
    this.cubeBoxHelper.visible = true;

    // Sean Ki - new object.
    this.wall = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.1),
        this.materials.solid);
    this.wall.position.set(1, 1.2, -1);
    this.wallShadow = Utils.createShadow(this.wall, this.materials.shadow);
    this.wallBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

    this.wallBBox.setFromObject(this.wall);
    Utils.updateShadow(this.wallShadow, this.wall);

    const group = new THREE.Group()
    let geometry = new THREE.BoxGeometry(1, 0.1, 1);
    const material = new THREE.MeshPhongMaterial({color: 0x44a88});
    const materialg = new THREE.MeshPhongMaterial({color: 0x00ff00});

    const cube = new THREE.Mesh(geometry, material);
    const cubeCenter = new THREE.Mesh(geometry, materialg);
    cubeBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    cubeBBox.setFromObject(cube);
    cubeShadow = Utils.createShadow(cube, this.materials.shadow);
    Utils.updateShadow(cubeShadow, cube);

    group.add(cube);
    group.add(cubeCenter);
    cube.position.set(0.6 ,0.1 ,0);
    group.position.set(0, 0.5, 0);

    cubeBoxHelper = new THREE.BoxHelper(cube, 0x00ff00);
    cubeBoxHelper.update();
    cubeBoxHelper.visible = true;

    this._cubeBBox = cubeBBox;
    this._cube = cube;
    this._cubeShadow = cubeShadow;
    this._cubeBoxHelper = cubeBoxHelper;
    
    // add objects to the scene
    this.scene.add(this.cube);
    this.scene.add(this.cubeBoxHelper);
    this.scene.add(this.knot);
    this.scene.add(group);
    this._group = group;
    this.scene.add(cubeBoxHelper);
    
    this.scene.add(this.wall);

    // add fake shadows to the scene
    this.scene.add(Utils.createShadow(this.knot, this.materials.shadow));

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
            this_._moveOffset.x = -0.001;
        else if (event.key == 'd')
            this_._moveOffset.x = 0.001;
        if (event.key == 'w')
            this_._moveOffset.y = -0.001;
        else if (event.key == 's')
            this_._moveOffset.y = 0.001;
        // console.log("down this_._moveOffset.x" + this_._moveOffset.x );
        if (event.key == 'q')
            this_._rot_dir = -0.01;
        if (event.key == 'e')
            this_._rot_dir = 0.01;

    }
    document.onkeyup = function (event) {
        // console.log(event.key);
        this_._moveOffset = {x:0, y:0};
        this_._rot_dir = 0;
        // console.log("up this_._moveOffset.x" + this_._moveOffset.x );
    }
};


Game.update = function (delta) {
    this.timestamp += delta;

    this.controls.update();

    // this._group.rotation.y += this._rot_dir;
    this.cube.rotation.y += this._rot_dir;
    this.cubeBoxHelper.update();
    this._cubeBoxHelper.update();

    // rotate the knot
    this.knot.rotation.x += (Math.PI / 4) * delta;
    this.knotBBox.setFromObject(this.knot); // re-calculate AABB


    // update the cube AABB and shadow
    this.wallBBox.setFromObject(this.wall);
    Utils.updateShadow(this.wallShadow, this.wall);

    this.cubeBBox.setFromObject(this.cube);
    Utils.updateShadow(this.cubeShadow, this.cube);

    this._cubeBBox.setFromObject(this._cube);
    Utils.updateShadow(this._cubeShadow, this._cube);

    this.knot.material = this.knotBBox.intersectsBox(this.cubeBBox)
        ? this.materials.colliding
        : this.materials.solid;

    this.wall.material = (/*this.sphereBBox.intersectsBox(this.wallBBox)||  */  this.cubeBBox.intersectsBox(this.wallBBox
        || this._cubeBBox.intersectsBox(this.wallBBox) ))
    ? this.materials.colliding
    : this.materials.solid;

};

Game.toggleDebug = function () {
    this.debug = !this.debug;
    this.knotBBox.visible = !!this.debug;
    // this.sphereBBox.visible = !!this.debug;
};
