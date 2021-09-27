import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


class Website3DDemo {
    constructor() {
        this._Initialize();
    }

    _Initialize = () => {
        // canvas
        const canvas = document.querySelector('canvas.webgl');

        // canvas size
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // renderer
        this._threejs = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
        });
        this._threejs.setSize(sizes.width, sizes.height);

        // shadow map
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.physicallyCorrectLights = true;
        this._threejs.toneMapping = THREE.ACESFilmicToneMapping;
        this._threejs.outputEncoding = THREE.sRGBEncoding;

        // scene
        this._scene = new THREE.Scene();

        // camera
        const fov = 60;
        const aspect = sizes.width / sizes.height;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(15, 15, 20);

        // light
        let light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this._scene.add(light);
        light = new THREE.AmbientLight(0xFFFFFF);
        this._scene.add(light);

        // plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0x808080,
            }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);

        // controls
        this._controls = new OrbitControls(this._camera, canvas);
        this._controls.enableDamping = true;
        this._controls.target.set(0, 10, 0);
        this._controls.update();

        // load character and play
        this._LoadAnimatedModelAndPlay(
            './resources/zombie/', 'zombie.fbx',
            'walk.fbx', new THREE.Vector3(0, 0, 0)
        );

        this._mixers = [];
        this._previousRAF = null;

        this._RAF();

        // TODO: resize function
        // TODO: full screen function
    };

    // load model and play with animation
    _LoadAnimatedModelAndPlay = (path, modelFile, animFile, offset) => {
        const loader = new FBXLoader();
        loader.setPath(path);
        loader.load(modelFile, (fbx) => {
            fbx.scale.setScalar(0.1);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            fbx.position.copy(offset);

            const anim = new FBXLoader();
            anim.setPath(path);
            anim.load(animFile, (anim) => {
                const m = new THREE.AnimationMixer(fbx);
                this._mixers.push(m);
                const idle = m.clipAction(anim.animations[0]);
                idle.play();
            });
            this._scene.add(fbx);
        });
    };

    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }
    }

    _RAF() {
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
            }

            this._RAF();

            this._threejs.render(this._scene, this._camera);
            this._Step(t - this._previousRAF);
            this._previousRAF = t;
        });
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new Website3DDemo();
});

