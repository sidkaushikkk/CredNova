document.addEventListener("DOMContentLoaded", () => {
    let scrollY = window.scrollY;
    let mouseX = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;

    // Track Scroll
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Track Mouse for subtle Parallax
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetParallaxX = mouseX * 0.3; // Limit the max subtle tilt
        targetParallaxY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function animate() {
        requestAnimationFrame(animate);

        const app = window.RobotApp;
        if (!app || !app.robotModel || !app.renderer) return;

        const time = app.clock.getElapsedTime();

        // Calculate Scroll Percentage (0 to 1)
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const scrollPercent = Math.min(1, Math.max(0, scrollY / maxScroll));
        
        // --- 1. Horizontal Scroll Movement ---
        // Scene bounds for camera depth=15
        const startX = -8; // Left 
        const endX = 8;    // Right
        const targetX = startX + (endX - startX) * scrollPercent;
        
        // Smoothly interpolate X position (easing)
        app.robotModel.position.x += (targetX - app.robotModel.position.x) * 0.02;

        // --- 2. Anti-gravity Floating Effect ---
        // Range: roughly 5-12px mapped to 3D space, meaning 0.2 to 0.4 units height oscillation
        // Add a base Y height (e.g. 0) and bob around it smoothly
        const floatY = Math.sin(time * 1.5) * 0.3; // ~0.3 units range, 4s cycle
        
        // Y moves smoothly based on float + slight scroll parallax depth
        const targetY = floatY - (scrollPercent * 0.5); // Also drifts slightly down as you scroll
        app.robotModel.position.y += (targetY - app.robotModel.position.y) * 0.05;

        // --- 3. Parallax Rotation & Depth ---
        // 1-3 degrees base rotation from scroll
        const scrollRotationY = scrollPercent * Math.PI; // Full slow half-spin from top to bottom
        const depthRotation = Math.sin(time) * 0.05; // Natural subtle breathing spin
        
        // Interpolate rotation 
        const targetRotY = scrollRotationY + targetParallaxX + depthRotation;
        const targetRotX = targetParallaxY * 0.1; // Small nod from mouse

        app.robotModel.rotation.y += (targetRotY - app.robotModel.rotation.y) * 0.05;
        app.robotModel.rotation.x += (targetRotX - app.robotModel.rotation.x) * 0.05;

        // --- 4. Dynamic Scaling ---
        if (app.robotModel.userData.baseScale === undefined) {
            app.robotModel.userData.baseScale = app.robotModel.scale.x;
        }
        // Increase the size of the document as the user scrolls (up to 80% larger)
        const targetScale = app.robotModel.userData.baseScale * (1.0 + scrollPercent * 0.8);
        app.robotModel.scale.x += (targetScale - app.robotModel.scale.x) * 0.05;
        app.robotModel.scale.y += (targetScale - app.robotModel.scale.y) * 0.05;
        app.robotModel.scale.z += (targetScale - app.robotModel.scale.z) * 0.05;

        // Render Frame
        app.renderer.render(app.scene, app.camera);
    }

    // Start 60fps Loop
    animate();
});
