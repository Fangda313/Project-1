// Three.js Hero Section - Rocket Launch from Earth
let scene, camera, renderer, earth, rocket, stars, moon;
let rocketLaunched = false;
let launchProgress = 0;

function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    const container = canvas.parentElement;

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 15;
    camera.position.y = 2;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-5, 5, 5);
    scene.add(directionalLight);

    // Create starfield
    createStarfield();

    // Create Earth
    createEarth();

    // Create Moon
    createMoon();

    // Create Rocket
    createRocket();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation
    animate();

    // Auto-launch rocket after 2 seconds
    setTimeout(() => {
        launchRocket();
    }, 2000);
}

function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function createEarth() {
    // Earth sphere
    const earthGeometry = new THREE.SphereGeometry(3, 32, 32);
    
    // Earth material with gradient blue/green colors
    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x2233ff,
        emissive: 0x112244,
        shininess: 30,
        flatShading: false
    });

    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(-5, -8, 0);
    scene.add(earth);

    // Add clouds layer
    const cloudsGeometry = new THREE.SphereGeometry(3.05, 32, 32);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        shininess: 10
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earth.add(clouds);

    // Add atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(3.3, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    earth.add(glow);

    // Add continents (simplified green patches)
    for (let i = 0; i < 8; i++) {
        const continentGeometry = new THREE.SphereGeometry(3.01, 16, 16, 
            Math.random() * Math.PI, Math.random() * 0.5,
            Math.random() * Math.PI, Math.random() * 0.5
        );
        const continentMaterial = new THREE.MeshPhongMaterial({
            color: 0x00aa44,
            emissive: 0x003311
        });
        const continent = new THREE.Mesh(continentGeometry, continentMaterial);
        earth.add(continent);
    }
}

function createMoon() {
    const moonGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        emissive: 0x222222,
        shininess: 5
    });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(8, 5, -10);
    scene.add(moon);
}

function createRocket() {
    rocket = new THREE.Group();

    // Rocket body (cone + cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        emissive: 0x444444,
        shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    rocket.add(body);

    // Rocket nose cone
    const noseGeometry = new THREE.ConeGeometry(0.3, 0.8, 32);
    const noseMaterial = new THREE.MeshPhongMaterial({
        color: 0xff4444,
        emissive: 0x440000,
        shininess: 100
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.y = 1.4;
    rocket.add(nose);

    // Rocket fins
    for (let i = 0; i < 4; i++) {
        const finGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.4);
        const finMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            emissive: 0x111111
        });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        const angle = (i / 4) * Math.PI * 2;
        fin.position.x = Math.cos(angle) * 0.35;
        fin.position.z = Math.sin(angle) * 0.35;
        fin.position.y = -0.7;
        fin.rotation.y = angle;
        rocket.add(fin);
    }

    // Rocket window
    const windowGeometry = new THREE.CircleGeometry(0.15, 32);
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x0088ff,
        shininess: 100
    });
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(0.31, 0.5, 0);
    window1.rotation.y = Math.PI / 2;
    rocket.add(window1);

    // Rocket flames (when launching)
    const flameGeometry = new THREE.ConeGeometry(0.4, 1.5, 32);
    const flameMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = -1.8;
    flame.name = 'flame';
    rocket.add(flame);

    // Add inner flame (brighter)
    const innerFlameGeometry = new THREE.ConeGeometry(0.25, 1.2, 32);
    const innerFlameMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0
    });
    const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial);
    innerFlame.position.y = -1.6;
    innerFlame.name = 'innerFlame';
    rocket.add(innerFlame);

    // Position rocket on Earth
    rocket.position.set(-5, -5, 0);
    rocket.rotation.z = Math.PI; // Point upward
    scene.add(rocket);
}

function launchRocket() {
    rocketLaunched = true;
    
    // Show flames
    const flame = rocket.getObjectByName('flame');
    const innerFlame = rocket.getObjectByName('innerFlame');
    if (flame) flame.material.opacity = 0.8;
    if (innerFlame) innerFlame.material.opacity = 0.9;
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate Earth
    if (earth) {
        earth.rotation.y += 0.002;
    }

    // Rotate Moon
    if (moon) {
        moon.rotation.y += 0.005;
    }

    // Animate stars
    if (stars) {
        stars.rotation.y += 0.0002;
    }

    // Rocket launch animation
    if (rocketLaunched && rocket && launchProgress < 1) {
        launchProgress += 0.003;
        
        // Move rocket up and away
        rocket.position.y += 0.08 * (1 - launchProgress * 0.5);
        rocket.position.z += 0.02;
        
        // Tilt rocket slightly
        rocket.rotation.x = Math.sin(launchProgress * Math.PI) * 0.2;
        
        // Animate flames
        const flame = rocket.getObjectByName('flame');
        const innerFlame = rocket.getObjectByName('innerFlame');
        
        if (flame) {
            flame.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.3;
            flame.material.opacity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        }
        
        if (innerFlame) {
            innerFlame.scale.y = 1 + Math.sin(Date.now() * 0.015) * 0.4;
            innerFlame.material.opacity = 0.9 + Math.sin(Date.now() * 0.015) * 0.1;
        }

        // Make rocket smaller as it goes far
        const scale = 1 - launchProgress * 0.5;
        rocket.scale.set(scale, scale, scale);
    }

    // Camera gentle movement
    camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
    camera.position.y = 2 + Math.cos(Date.now() * 0.0003) * 0.3;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.querySelector('.hero');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero3D);
} else {
    initHero3D();
}
