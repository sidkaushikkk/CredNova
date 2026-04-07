window.RobotApp = {
    scene: null,
    camera: null,
    renderer: null,
    robotModel: null,
    clock: new THREE.Clock(),
    
    init: function() {
        const canvas = document.getElementById('robot-canvas');
        if (!canvas) return;

        // Setup Scene
        this.scene = new THREE.Scene();

        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 15);

        // Setup Renderer (Hardware Acceleration & Anti-Aliasing Enabled)
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High-dpi optimization
        this.renderer.shadowMap.enabled = true; // For soft shadows

        // Lights (Performance Optimized)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Ambient base light
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x66fcf1, 1.2, 50); // Futuristic blue glow
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Load GLTF model
        if (typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            loader.load(
                'models/document.glb', 
                (gltf) => {
                    this.robotModel = gltf.scene;
                    
                    // Traverse and set shadows & glow
                    this.robotModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    this.robotModel.scale.set(1.5, 1.5, 1.5);
                    this.robotModel.position.set(-10, 0, 0); // Start position (Left Side)
                    this.scene.add(this.robotModel);
                },
                undefined, // onProgress
                (error) => {
                    console.log('Error loading models/document.glb. Generating fallback 3D document.', error);
                    // Generate fallback primitive document if NO model exists
                    this.createFallbackDocument();
                }
            );
        } else {
            // GLTFLoader failed to load, fallback
            this.createFallbackDocument();
        }
    },

    createFallbackDocument: function() {
        const group = new THREE.Group();
        
        // Document Base (White paper-like minimal)
        const docGeo = new THREE.BoxGeometry(2, 2.8, 0.05);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.3 });
        const doc = new THREE.Mesh(docGeo, mat);
        group.add(doc);
        
        // Holographic Seal / Badge
        const sealGroup = new THREE.Group();
        const sealRingGeo = new THREE.TorusGeometry(0.35, 0.05, 16, 64);
        const sealMat = new THREE.MeshStandardMaterial({ color: 0x45a29e, metalness: 0.8, roughness: 0.2 });
        const sealRing = new THREE.Mesh(sealRingGeo, sealMat);
        
        const coreGeo = new THREE.CircleGeometry(0.28, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x66fcf1 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        
        sealGroup.add(sealRing);
        sealGroup.add(core);
        sealGroup.position.set(0, -0.7, 0.03);
        group.add(sealGroup);
        
        const backSealGroup = sealGroup.clone();
        backSealGroup.position.set(0, -0.7, -0.03);
        backSealGroup.rotation.y = Math.PI;
        group.add(backSealGroup);
        
        // Abstract Lines (Text representation)
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        for (let i = 0; i < 4; i++) {
            const lineGeo = new THREE.PlaneGeometry(1.2, 0.05);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.position.set(0, 0.8 - (i * 0.25), 0.03);
            group.add(line);
            
            const backLine = line.clone();
            backLine.position.set(0, 0.8 - (i * 0.25), -0.03);
            backLine.rotation.y = Math.PI;
            group.add(backLine);
        }

        // Title Line
        const titleGeo = new THREE.PlaneGeometry(0.8, 0.1);
        const titleMat = new THREE.MeshBasicMaterial({ color: 0x45a29e });
        const titleLine = new THREE.Mesh(titleGeo, titleMat);
        titleLine.position.set(0, 1.1, 0.03);
        group.add(titleLine);
        
        const backTitleLine = titleLine.clone();
        backTitleLine.position.set(0, 1.1, -0.03);
        backTitleLine.rotation.y = Math.PI;
        group.add(backTitleLine);

        this.robotModel = group;
        this.robotModel.scale.set(1.4, 1.4, 1.4);
        this.robotModel.position.set(-10, 0, 0); // Start Left
        // Give it a permanent slight tilt for realism
        this.robotModel.rotation.x = -0.1;
        this.robotModel.rotation.z = 0.05;
        this.scene.add(this.robotModel);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.RobotApp.init();
});
