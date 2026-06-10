(function () {
    "use strict";

    const container = document.getElementById("physicsStage");
    const loader = document.getElementById("stageLoader");

    if (!container) return;

    if (!window.THREE || !window.Physijs) {
        loader?.classList.add("is-error");
        if (loader) loader.querySelector("p").textContent = "3D CONTENT COULD NOT LOAD";
        return;
    }

    Physijs.scripts.worker = new URL("./ref/script/vendor/physijs_worker.js", window.location.href).href;
    Physijs.scripts.ammo = new URL("./ref/script/vendor/ammo.js", window.location.href).href;

    const scene = new Physijs.Scene({ fixedTimeStep: 1 / 60 });
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const spheres = [];
    const sphereLabels = [];
    const cameraDirection = new THREE.Vector3();
    const localCameraPosition = new THREE.Vector3();
    const worldGravity = new THREE.Vector3(0, -5.5, 0);
    const localGravity = new THREE.Vector3();
    const inverseBoxRotation = new THREE.Quaternion();
    const activePointers = new Map();
    const orbit = { theta: 0.58, phi: 1.18, radius: 17 };
    const boxRotation = { x: 0, y: 0 };
    const drag = { moved: false, selected: null, startX: 0, startY: 0, rotationX: 0, rotationY: 0 };
    let pinchDistance = 0;
    let simulationRunning = true;
    let hasSimulated = false;
    let compactView = false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-label", "PROFILE、TOOL、LINK、CONTACTの4つの球");
    renderer.domElement.setAttribute("role", "img");
    container.appendChild(renderer.domElement);

    scene.setGravity(worldGravity);
    scene.add(new THREE.AmbientLight(0xffffff, 0.62));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(-5, 9, 8);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.9, 22);
    rimLight.position.set(6, -1, 4);
    scene.add(rimLight);

    const boxSize = { x: 7.36, y: 7.36, z: 7.36 };
    const wallThickness = 0.2;
    const wallMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
        0.72,
        0.82
    );

    function createWall(size, position) {
        const wall = new Physijs.BoxMesh(new THREE.BoxGeometry(size.x, size.y, size.z), wallMaterial, 0);
        wall.position.copy(position);
        scene.add(wall);
    }

    createWall(
        { x: boxSize.x, y: wallThickness, z: boxSize.z },
        new THREE.Vector3(0, -boxSize.y / 2, 0)
    );
    createWall(
        { x: boxSize.x, y: wallThickness, z: boxSize.z },
        new THREE.Vector3(0, boxSize.y / 2, 0)
    );
    createWall(
        { x: wallThickness, y: boxSize.y, z: boxSize.z },
        new THREE.Vector3(-boxSize.x / 2, 0, 0)
    );
    createWall(
        { x: wallThickness, y: boxSize.y, z: boxSize.z },
        new THREE.Vector3(boxSize.x / 2, 0, 0)
    );
    createWall(
        { x: boxSize.x, y: boxSize.y, z: wallThickness },
        new THREE.Vector3(0, 0, -boxSize.z / 2)
    );
    createWall(
        { x: boxSize.x, y: boxSize.y, z: wallThickness },
        new THREE.Vector3(0, 0, boxSize.z / 2)
    );

    const enclosure = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.035,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    enclosure.renderOrder = -2;
    scene.add(enclosure);

    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(enclosure.geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
    );
    edges.renderOrder = -1;
    scene.add(edges);

    function createSphereLabel(label, radius) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 512;
        canvas.height = 128;
        context.fillStyle = "#080808";
        context.font = "700 52px Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(label, canvas.width / 2, canvas.height / 2 - 5);
        context.font = "16px monospace";
        context.fillText("AK / 2302", canvas.width / 2, canvas.height / 2 + 38);

        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(canvas),
            transparent: true,
            depthTest: false,
            depthWrite: false
        }));
        sprite.scale.set(radius * 2.55, radius * 0.64, 1);
        sprite.renderOrder = 2;
        return sprite;
    }

    const sphereData = [
        { label: "PROFILE", position: [-2, 2.24, 0.64], radius: 1.25 },
        { label: "TOOL", position: [1.92, 1.68, -1.12], radius: 1.15 },
        { label: "LINK", position: [-0.96, -0.96, -1.04], radius: 1.1 },
        { label: "CONTACT", position: [1.84, -1.2, 0.96], radius: 1.3 }
    ];

    sphereData.forEach((item, index) => {
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.78,
            shininess: 90,
            specular: 0xffffff,
            depthWrite: false
        });
        const material = Physijs.createMaterial(baseMaterial, 0.6, 0.88);
        const sphere = new Physijs.SphereMesh(
            new THREE.SphereGeometry(item.radius, 40, 32),
            material,
            item.radius * 1.8
        );

        sphere.position.set(item.position[0], item.position[1], item.position[2]);
        sphere.rotation.set(index * 0.45, index * 0.72, -0.12);
        sphere.userData.label = item.label;
        sphere.renderOrder = 0;
        sphere.setDamping(0.16, 0.25);
        scene.add(sphere);
        spheres.push(sphere);

        const label = createSphereLabel(item.label, item.radius);
        scene.add(label);
        sphereLabels.push({ sprite: label, sphere, radius: item.radius });

        window.setTimeout(() => {
            sphere.applyCentralImpulse(new THREE.Vector3(
                (index % 2 ? -1 : 1) * 1.8,
                0.4 + index * 0.15,
                (index < 2 ? 1 : -1) * 1.3
            ));
            sphere.applyTorque(new THREE.Vector3(0.8 + index, 1.2, -0.6));
        }, 150 + index * 90);
    });

    function updateCamera() {
        const sinPhi = Math.sin(orbit.phi);
        camera.position.set(
            orbit.radius * sinPhi * Math.sin(orbit.theta),
            orbit.radius * Math.cos(orbit.phi),
            orbit.radius * sinPhi * Math.cos(orbit.theta)
        );
        camera.lookAt(scene.position);
    }

    function updateBoxRotation() {
        scene.rotation.set(boxRotation.x, boxRotation.y, 0, "YXZ");
        scene.updateMatrixWorld(true);
        inverseBoxRotation.copy(scene.quaternion).inverse();
        localGravity.copy(worldGravity).applyQuaternion(inverseBoxRotation);
        scene.setGravity(localGravity);
    }

    function resize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        const nextCompactView = window.innerWidth <= 760;
        if (nextCompactView !== compactView) {
            compactView = nextCompactView;
            orbit.radius = compactView ? 22 : 17;
            updateCamera();
        }
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    }

    function sphereAt(clientX, clientY) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObjects(spheres, false)[0]?.object || null;
    }

    function pointerDistance() {
        const values = Array.from(activePointers.values());
        if (values.length < 2) return 0;
        return Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
    }

    renderer.domElement.addEventListener("pointerdown", (event) => {
        renderer.domElement.setPointerCapture(event.pointerId);
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        drag.startX = event.clientX;
        drag.startY = event.clientY;
        drag.rotationX = boxRotation.x;
        drag.rotationY = boxRotation.y;
        drag.moved = false;
        drag.selected = sphereAt(event.clientX, event.clientY);
        container.classList.add("is-dragging");

        if (activePointers.size === 2) pinchDistance = pointerDistance();
    });

    renderer.domElement.addEventListener("pointermove", (event) => {
        if (!activePointers.has(event.pointerId)) return;
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (activePointers.size === 2) {
            const distance = pointerDistance();
            if (pinchDistance) {
                orbit.radius = THREE.Math.clamp(orbit.radius - (distance - pinchDistance) * 0.025, 12, 24);
                updateCamera();
            }
            pinchDistance = distance;
            drag.moved = true;
            return;
        }

        const deltaX = event.clientX - drag.startX;
        const deltaY = event.clientY - drag.startY;
        if (Math.hypot(deltaX, deltaY) > 5) drag.moved = true;

        if (drag.moved && !drag.selected) {
            boxRotation.x = THREE.Math.clamp(drag.rotationX + deltaY * 0.006, -1.15, 1.15);
            boxRotation.y = drag.rotationY + deltaX * 0.007;
            updateBoxRotation();
        }
    });

    function finishPointer(event) {
        const wasSelected = drag.selected;
        const shouldOpen = activePointers.size === 1 && !drag.moved && wasSelected;
        activePointers.delete(event.pointerId);
        if (!activePointers.size) container.classList.remove("is-dragging");
        if (activePointers.size < 2) pinchDistance = 0;

        if (shouldOpen) {
            window.dispatchEvent(new CustomEvent("sphere-select", {
                detail: { label: wasSelected.userData.label }
            }));
        }
    }

    renderer.domElement.addEventListener("pointerup", finishPointer);
    renderer.domElement.addEventListener("pointercancel", finishPointer);
    renderer.domElement.addEventListener("wheel", (event) => {
        event.preventDefault();
        orbit.radius = THREE.Math.clamp(orbit.radius + event.deltaY * 0.012, 12, 24);
        updateCamera();
    }, { passive: false });

    scene.addEventListener("update", () => {
        if (!hasSimulated) {
            hasSimulated = true;
            loader?.classList.add("is-hidden");
        }
        if (simulationRunning) scene.simulate(undefined, 1);
    });

    document.addEventListener("visibilitychange", () => {
        simulationRunning = !document.hidden;
        if (simulationRunning) scene.simulate(undefined, 1);
    });

    function render() {
        requestAnimationFrame(render);
        scene.updateMatrixWorld(true);
        localCameraPosition.copy(camera.position);
        scene.worldToLocal(localCameraPosition);
        sphereLabels.forEach((item) => {
            cameraDirection.subVectors(localCameraPosition, item.sphere.position).normalize();
            item.sprite.position.copy(item.sphere.position).add(
                cameraDirection.multiplyScalar(item.radius * 1.015)
            );
        });
        renderer.render(scene, camera);
    }

    updateCamera();
    resize();
    window.addEventListener("resize", resize);
    scene.simulate();
    render();
}());
