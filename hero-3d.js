// Three.js Hero Section - Rocket Launch from Earth
let scene, camera, renderer, earth, rocket, stars, moon;
let rocketLaunched = false;
let launchProgress = 0;

function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    const container = canvas.parentElement;

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 18);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(20, 5, 10);
    scene.add(sunLight);

    const moonLight = new THREE.PointLight(0xaaaaff, 0.3, 100);
    moonLight.position.set(-20, 5, -10);
    scene.add(moonLight);

    // Create scene elements
    createEnhancedStarfield();
    createDetailedEarth();
    createDetailedMoon();
    createRocket();
    createShootingStars();

    window.addEventListener('resize', onWindowResize);
    animate();

    setTimeout(() => { launchRocket(); }, 3000);
}

function createEnhancedStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    const starsSizes = [];
    const starsColors = [];

    for (let i = 0; i < 5000; i++) {
        starsVertices.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
        starsSizes.push(Math.random() * 2 + 0.5);
        const colorVar = Math.random();
        if (colorVar > 0.95) {
            starsColors.push(0.8, 0.9, 1.0); // Blue
        } else if (colorVar > 0.90) {
            starsColors.push(1.0, 0.9, 0.8); // Orange
        } else {
            starsColors.push(1.0, 1.0, 1.0); // White
        }
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
    });
    
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Nebula clouds
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaVerts = [];
    for (let i = 0; i < 300; i++) {
        nebulaVerts.push((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150);
    }
    nebulaGeo.setAttribute('position', new THREE.Float32BufferAttribute(nebulaVerts, 3));
    
    const nebulaMat = new THREE.PointsMaterial({
        size: 8,
        color: 0x6644ff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(nebulaGeo, nebulaMat));
    
    const nebulaMat2 = new THREE.PointsMaterial({
        size: 6,
        color: 0xff4488,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending
    });
    const nebula2 = new THREE.Points(nebulaGeo.clone(), nebulaMat2);
    nebula2.rotation.y = Math.PI / 3;
    scene.add(nebula2);
}

function createDetailedEarth() {
    const earthGeometry = new THREE.SphereGeometry(4, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x2244aa,
        emissive: 0x112244,
        shininess: 25,
        specular: 0x333333
    });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(0, -8, -5);
    scene.add(earth);

    // Add continents
    addContinent(0.5, 1.2, 1.0, 0.5, 0x00aa22); // N America
    addContinent(0.8, 0.3, 0.6, 0.6, 0x00aa22); // S America
    addContinent(2.5, 1.3, 0.4, 0.3, 0x00aa22); // Europe
    addContinent(2.8, 0.6, 0.6, 0.7, 0x00bb33); // Africa
    addContinent(3.5, 1.0, 1.2, 0.6, 0x00aa22); // Asia
    addContinent(4.2, -0.5, 0.5, 0.4, 0x00aa22); // Australia

    // Clouds
    const cloudsGeo = new THREE.SphereGeometry(4.08, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        shininess: 5
    });
    const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
    clouds.name = 'clouds';
    earth.add(clouds);

    // Atmosphere glow
    const glowGeo = new THREE.SphereGeometry(4.5, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    earth.add(new THREE.Mesh(glowGeo, glowMat));

    // Ice caps
    const northCapGeo = new THREE.SphereGeometry(4.02, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.15);
    const iceMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x333333, shininess: 30 });
    earth.add(new THREE.Mesh(northCapGeo, iceMat));
    
    const southCapGeo = new THREE.SphereGeometry(4.02, 32, 32, 0, Math.PI * 2, Math.PI * 0.85, Math.PI * 0.15);
    earth.add(new THREE.Mesh(southCapGeo, iceMat));
}

function addContinent(lonStart, latStart, lonSize, latSize, color) {
    const geo = new THREE.SphereGeometry(4.015, 32, 32, lonStart, lonSize, latStart, latSize);
    const mat = new THREE.MeshPhongMaterial({ color: color, emissive: 0x002211 });
    earth.add(new THREE.Mesh(geo, mat));
}

function createDetailedMoon() {
    const moonGeo = new THREE.SphereGeometry(1.2, 64, 64);
    const moonMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, emissive: 0x111111, shininess: 5 });
    moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(15, 8, -15);
    scene.add(moon);

    // Add craters
    for (let i = 0; i < 20; i++) {
        const craterGeo = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 16, 16);
        const craterMat = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x000000 });
        const crater = new THREE.Mesh(craterGeo, craterMat);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        crater.position.x = Math.sin(phi) * Math.cos(theta) * 1.15;
        crater.position.y = Math.sin(phi) * Math.sin(theta) * 1.15;
        crater.position.z = Math.cos(phi) * 1.15;
        
        moon.add(crater);
    }
}

function createShootingStars() {
    setInterval(() => {
        if (Math.random() > 0.7) {
            const geo = new THREE.BufferGeometry();
            const positions = [];
            const startX = (Math.random() - 0.5) * 100;
            const startY = (Math.random() - 0.5) * 100;
            const startZ = -50;
            
            for (let i = 0; i < 10; i++) {
                positions.push(startX + i * 2, startY - i * 0.5, startZ + i);
            }
            
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
            const shootingStar = new THREE.Line(geo, mat);
            scene.add(shootingStar);
            
            setTimeout(() => { scene.remove(shootingStar); }, 3000);
        }
    }, 5000);
}

function createRocket() {
    rocket = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 32);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x222222, shininess: 100 });
    rocket.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Red stripes
    for (let i = 0; i < 3; i++) {
        const stripeGeo = new THREE.CylinderGeometry(0.41, 0.41, 0.3, 32);
        const stripeMat = new THREE.MeshPhongMaterial({ color: 0xff3333, emissive: 0x330000 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = -0.6 + i * 0.6;
        rocket.add(stripe);
    }

    // Nose cone (pointing up)
    const noseGeo = new THREE.ConeGeometry(0.4, 1.2, 32);
    const noseMat = new THREE.MeshPhongMaterial({ color: 0xff3333, emissive: 0x330000, shininess: 100 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.y = 1.85;
    rocket.add(nose);

    // Fins
    for (let i = 0; i < 4; i++) {
        const finGeo = new THREE.BoxGeometry(0.15, 0.8, 0.6);
        const finMat = new THREE.MeshPhongMaterial({ color: 0x333333, emissive: 0x111111, shininess: 50 });
        const fin = new THREE.Mesh(finGeo, finMat);
        const angle = (i / 4) * Math.PI * 2;
        fin.position.x = Math.cos(angle) * 0.45;
        fin.position.z = Math.sin(angle) * 0.45;
        fin.position.y = -1;
        fin.rotation.y = angle;
        rocket.add(fin);
    }

    // Windows
    for (let i = 0; i < 3; i++) {
        const windowGeo = new THREE.CircleGeometry(0.18, 32);
        const windowMat = new THREE.MeshPhongMaterial({ color: 0x00ddff, emissive: 0x0088ff, shininess: 100 });
        const win = new THREE.Mesh(windowGeo, windowMat);
        win.position.set(0.41, 0.8 - i * 0.5, 0);
        win.rotation.y = Math.PI / 2;
        rocket.add(win);
    }

    // USA flag
    const flagGeo = new THREE.PlaneGeometry(0.4, 0.25);
    const flagMat = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x220000 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.41, 0, 0);
    flag.rotation.y = Math.PI / 2;
    rocket.add(flag);

    // Flames (pointing DOWN)
    const flameGeo = new THREE.ConeGeometry(0.5, 2, 32);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = -2.3;
    flame.rotation.x = Math.PI; // Point down!
    flame.name = 'flame';
    rocket.add(flame);

    const innerFlameGeo = new THREE.ConeGeometry(0.3, 1.5, 32);
    const innerFlameMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0 });
    const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    innerFlame.position.y = -2.1;
    innerFlame.rotation.x = Math.PI;
    innerFlame.name = 'innerFlame';
    rocket.add(innerFlame);

    const coreFlameGeo = new THREE.ConeGeometry(0.15, 1, 32);
    const coreFlameMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
    const coreFlame = new THREE.Mesh(coreFlameGeo, coreFlameMat);
    coreFlame.position.y = -1.9;
    coreFlame.rotation.x = Math.PI;
    coreFlame.name = 'coreFlame';
    rocket.add(coreFlame);

    // Position on Earth (standing UPRIGHT)
    rocket.position.set(2, -4.5, -3);
    rocket.rotation.x = 0; // UPRIGHT!
    scene.add(rocket);
}

function launchRocket() {
    rocketLaunched = true;
    const flame = rocket.getObjectByName('flame');
    const innerFlame = rocket.getObjectByName('innerFlame');
    const coreFlame = rocket.getObjectByName('coreFlame');
    if (flame) flame.material.opacity = 0.9;
    if (innerFlame) innerFlame.material.opacity = 0.95;
    if (coreFlame) coreFlame.material.opacity = 1.0;
}

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Rotate Earth
    if (earth) {
        earth.rotation.y += 0.001;
        const clouds = earth.getObjectByName('clouds');
        if (clouds) clouds.rotation.y += 0.0015;
    }

    // Rotate Moon
    if (moon) moon.rotation.y += 0.003;

    // Star movement
    if (stars) {
        stars.rotation.y += 0.0001;
        stars.rotation.x = Math.sin(time * 0.1) * 0.05;
    }

    // Rocket launch
    if (rocketLaunched && rocket && launchProgress < 1) {
        launchProgress += 0.002;
        
        rocket.position.y += 0.12 * (1 - launchProgress * 0.3);
        rocket.position.z += 0.05 * launchProgress;
        rocket.rotation.z = Math.sin(launchProgress * Math.PI * 2) * 0.05;
        
        const flame = rocket.getObjectByName('flame');
        const innerFlame = rocket.getObjectByName('innerFlame');
        const coreFlame = rocket.getObjectByName('coreFlame');
        
        const flicker = Math.sin(time * 20) * 0.3 + Math.sin(time * 13) * 0.2;
        
        if (flame) {
            flame.scale.y = 1 + flicker;
            flame.scale.x = 1 - flicker * 0.3;
            flame.scale.z = 1 - flicker * 0.3;
            flame.material.opacity = 0.9 + flicker * 0.1;
        }
        
        if (innerFlame) {
            innerFlame.scale.y = 1 + flicker * 1.5;
            innerFlame.scale.x = 1 - flicker * 0.4;
            innerFlame.scale.z = 1 - flicker * 0.4;
        }
        
        if (coreFlame) {
            coreFlame.scale.y = 1 + flicker * 2;
        }

        const scale = Math.max(0.3, 1 - launchProgress * 0.7);
        rocket.scale.set(scale, scale, scale);
    }

    // Camera movement
    camera.position.x = Math.sin(time * 0.2) * 0.5;
    camera.position.y = 3 + Math.cos(time * 0.15) * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.querySelector('.hero');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero3D);
} else {
    initHero3D();
}
