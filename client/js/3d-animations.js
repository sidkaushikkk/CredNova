// js/3d-animations.js
document.addEventListener("DOMContentLoaded", () => {
    // Basic Three.js setup
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    // Background clear is transparent since we set alpha: true
    // but a fog helps blend elements off into the distance
    scene.fog = new THREE.Fog(0x0b0c10, 10, 45);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize performance

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const blueLight1 = new THREE.PointLight(0x66fcf1, 1.5, 30);
    blueLight1.position.set(10, 10, 10);
    scene.add(blueLight1);

    const blueLight2 = new THREE.PointLight(0x45a29e, 1.5, 30);
    blueLight2.position.set(-10, -10, 10);
    scene.add(blueLight2);

    // Objects Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // Common Materials
    const hologenMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0x112233,
        transparent: true,
        opacity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide
    });

    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x66fcf1,
        transparent: true,
        opacity: 0.5
    });

    // 1. Floating Certificates (Planes)
    const certGeometry = new THREE.PlaneGeometry(3, 4.2);
    for (let i = 0; i < 3; i++) {
        const cert = new THREE.Mesh(certGeometry, hologenMaterial.clone());
        cert.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10 - 5
        );
        cert.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
        );
        
        cert.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: Math.random() * 0.02 + 0.01,
            originalY: cert.position.y
        };
        objectsGroup.add(cert);
    }

    // 2. Blockchain Cubes with Wireframes
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const edges = new THREE.EdgesGeometry(cubeGeometry);
    for (let i = 0; i < 5; i++) {
        const line = new THREE.LineSegments(edges, wireframeMaterial.clone());
        const cube = new THREE.Mesh(cubeGeometry, new THREE.MeshPhysicalMaterial({
            color: 0x1f2833,
            transparent: true,
            opacity: 0.4,
            wireframe: false
        }));
        
        const group = new THREE.Group();
        group.add(cube);
        group.add(line);
        
        group.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 15 - 5
        );
        
        group.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            cubeMesh: cube,
            baseEmissive: new THREE.Color(0x000000),
            hoverEmissive: new THREE.Color(0x66fcf1)
        };
        objectsGroup.add(group);
    }

    // 3. Holographic Verification Badge (Torus Rings)
    const torusGeometry = new THREE.TorusGeometry(1.5, 0.2, 16, 100);
    const badgeGroup = new THREE.Group();
    
    const ring1 = new THREE.Mesh(torusGeometry, hologenMaterial.clone());
    ring1.material.emissive = new THREE.Color(0x45a29e);
    
    // Add glowing core
    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const core = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0x66fcf1, transparent: true, opacity: 0.6 }));
    
    badgeGroup.add(ring1);
    badgeGroup.add(core);
    badgeGroup.position.set(-8, 3, -4);
    badgeGroup.userData = {
        rotationSpeed: { x: 0.01, y: 0.02, z: 0.005 }
    };
    objectsGroup.add(badgeGroup);

    // 4. Floating Shield Icon (Custom Shape)
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 2);
    shieldShape.lineTo(1.5, 1.5);
    shieldShape.lineTo(1.5, 0);
    shieldShape.quadraticCurveTo(1.5, -1.5, 0, -2.5);
    shieldShape.quadraticCurveTo(-1.5, -1.5, -1.5, 0);
    shieldShape.lineTo(-1.5, 1.5);
    shieldShape.lineTo(0, 2);

    const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
    const shieldGeom = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    // Center the geometry
    shieldGeom.computeBoundingBox();
    const bBox = shieldGeom.boundingBox;
    shieldGeom.translate(-(bBox.max.x + bBox.min.x)/2, -(bBox.max.y + bBox.min.y)/2, -(bBox.max.z + bBox.min.z)/2); 

    const shieldMesh = new THREE.Mesh(shieldGeom, hologenMaterial.clone());
    shieldMesh.position.set(8, -4, -6);
    shieldMesh.userData = {
        rotationSpeed: { x: 0, y: 0.01, z: 0 },
        floatSpeed: 0.015,
        originalY: shieldMesh.position.y,
        baseEmissive: new THREE.Color(0x112233),
        hoverEmissive: new THREE.Color(0x66fcf1)
    };
    objectsGroup.add(shieldMesh);

    // 5. Particle Network Lines
    const particleCount = 150; // Limit for performance
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 40;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
        
        particleVelocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
        color: 0x66fcf1,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x66fcf1,
        transparent: true,
        opacity: 0.15
    });
    // We will update line segments dynamically in render loop
    const activeLinesGeo = new THREE.BufferGeometry();
    const networkLines = new THREE.LineSegments(activeLinesGeo, lineMaterial);
    scene.add(networkLines);

    // Interaction Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    let scrollY = 0;

    // Raycaster for Hover Glow
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Event Listeners
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    // Render Loop
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Parallax update
        targetX = mouseX * 0.005;
        targetY = mouseY * 0.005;

        // Apply Parallax to Camera
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        // Apply Scroll Parallax
        camera.position.y -= scrollY * 0.01; // subtle scroll effect
        camera.lookAt(scene.position);

        // Object Animations
        objectsGroup.children.forEach(obj => {
            if (obj.userData.rotationSpeed) {
                if(obj.userData.rotationSpeed.x) obj.rotation.x += obj.userData.rotationSpeed.x;
                if(obj.userData.rotationSpeed.y) obj.rotation.y += obj.userData.rotationSpeed.y;
                if(obj.userData.rotationSpeed.z) obj.rotation.z += obj.userData.rotationSpeed.z;
            }
            if (obj.userData.floatSpeed) {
                // Bobbing up and down
                obj.position.y = obj.userData.originalY + Math.sin(elapsedTime * 2 + obj.position.x) * obj.userData.floatSpeed * 20;
            }
        });

        // Network Particles Movement & Lines
        const positions = particleSystem.geometry.attributes.position.array;
        let linePositions = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Move particles
            positions[i * 3] += particleVelocities[i].x;
            positions[i * 3 + 1] += particleVelocities[i].y;
            positions[i * 3 + 2] += particleVelocities[i].z;

            // Simple boundaries wrap
            if (positions[i * 3] > 20 || positions[i * 3] < -20) particleVelocities[i].x *= -1;
            if (positions[i * 3 + 1] > 20 || positions[i * 3 + 1] < -20) particleVelocities[i].y *= -1;
            if (positions[i * 3 + 2] > 10 || positions[i * 3 + 2] < -30) particleVelocities[i].z *= -1;

            // Connect nearby points
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distSq = dx*dx + dy*dy + dz*dz;

                if (distSq < 15) { // Threshold for connection
                    linePositions.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                }
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Update lines
        if (linePositions.length > 0) {
            networkLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        } else {
            networkLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
        }

        // Raycasting for Hover Highlights
        raycaster.setFromCamera(mouse, camera);
        
        // Extract meshes to test
        const meshesToTest = [];
        objectsGroup.children.forEach(child => {
            if (child.isMesh && child.geometry.type !== 'PlaneGeometry') { // don't hover certs if we want
                meshesToTest.push(child);
            }
            if (child.isGroup) {
                if (child.userData.cubeMesh) meshesToTest.push(child.userData.cubeMesh);
            }
        });

        const intersects = raycaster.intersectObjects(meshesToTest, false);
        
        // Reset emissive
        meshesToTest.forEach(mesh => {
            if (mesh.material && mesh.material.emissive) {
                // If it's part of a group with userData (e.g., cube)
                let targetColor;
                if (mesh.parent && mesh.parent.userData && mesh.parent.userData.baseEmissive) {
                    targetColor = mesh.parent.userData.baseEmissive;
                } else if (mesh.userData && mesh.userData.baseEmissive) {
                    targetColor = mesh.userData.baseEmissive;
                } else {
                    targetColor = new THREE.Color(0x1f2833);
                }
                mesh.material.emissive.lerp(targetColor, 0.1);
            }
        });

        // Highlight intersected
        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            if (intersectedMesh.material && intersectedMesh.material.emissive) {
                let targetGlow = new THREE.Color(0x66fcf1);
                intersectedMesh.material.emissive.lerp(targetGlow, 0.2);
            }
        }

        renderer.render(scene, camera);
    }

    animate();
});
