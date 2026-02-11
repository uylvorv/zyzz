/* ===================================================================
   Three.js 3D Scene — Glowing Wireframe Silhouette
   Renders a rotating geometric human-like form with particles
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('three-canvas');
    if (!container || typeof THREE === 'undefined') return;
    if (window.ASCENSION_LITE) return; // Skip 3D in lite mode

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Colors
    const goldColor = new THREE.Color(0xd4a853);
    const cyanColor = new THREE.Color(0x00e5ff);

    // Create human-like wireframe figure using basic geometry
    const group = new THREE.Group();

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.2, 1.8, 0.6, 2, 3, 1);
    const wireMat = new THREE.MeshBasicMaterial({
        color: goldColor,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const torso = new THREE.Mesh(torsoGeo, wireMat);
    torso.position.y = 0.5;
    group.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 8, 6);
    const head = new THREE.Mesh(headGeo, wireMat.clone());
    head.position.y = 1.75;
    group.add(head);

    // Right arm
    const armGeo = new THREE.BoxGeometry(0.35, 1.4, 0.35, 1, 2, 1);
    const rightArm = new THREE.Mesh(armGeo, wireMat.clone());
    rightArm.position.set(0.9, 1.0, 0);
    rightArm.rotation.z = -Math.PI / 6;
    group.add(rightArm);

    // Left arm (flexing pose)
    const leftArm = new THREE.Mesh(armGeo.clone(), wireMat.clone());
    leftArm.position.set(-0.9, 1.2, 0);
    leftArm.rotation.z = Math.PI / 3;
    group.add(leftArm);

    // Forearm (flexed)
    const forearmGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3, 1, 2, 1);
    const leftForearm = new THREE.Mesh(forearmGeo, wireMat.clone());
    leftForearm.position.set(-1.1, 2.0, 0);
    leftForearm.rotation.z = -Math.PI / 6;
    group.add(leftForearm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.4, 1.6, 0.4, 1, 3, 1);
    const rightLeg = new THREE.Mesh(legGeo, wireMat.clone());
    rightLeg.position.set(0.3, -1.2, 0);
    group.add(rightLeg);

    const leftLeg = new THREE.Mesh(legGeo.clone(), wireMat.clone());
    leftLeg.position.set(-0.3, -1.2, 0);
    group.add(leftLeg);

    scene.add(group);

    // Particles
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = 3 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 0.5;
        positions[i3 + 2] = radius * Math.cos(phi);

        // Mix gold and cyan
        const mixFactor = Math.random();
        const color = goldColor.clone().lerp(cyanColor, mixFactor);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Ambient glow ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: goldColor,
        transparent: true,
        opacity: 0.2
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -2;
    scene.add(ring);

    // Animation
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.005;

        group.rotation.y = Math.sin(time * 0.5) * 0.3;
        group.position.y = Math.sin(time) * 0.1;

        particles.rotation.y = time * 0.1;
        particles.rotation.x = Math.sin(time * 0.3) * 0.05;

        ring.rotation.z = time * 0.2;

        // Pulse wireframe opacity
        group.children.forEach((child, i) => {
            if (child.material) {
                child.material.opacity = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.1;
            }
        });

        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
