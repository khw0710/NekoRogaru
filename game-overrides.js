/* Neko Rogaru art/input/world integration layer.
 * Keeps the Gemini Three.js skeleton while replacing its procedural placeholders.
 */

var NEKO_ASSETS = {
    atlases: {
        character: 'assets/generated/atlases/cat-atlas.png',
        props: 'assets/generated/atlases/props-atlas.png',
        environment: 'assets/generated/atlases/environment-atlas.png',
        ui: 'assets/generated/atlases/ui-atlas.png',
        seasonWeather: 'assets/generated/atlases/season-weather-atlas.png',
        endings: 'assets/generated/atlases/endings-atlas.png'
    },
    replayFrame: 'assets/generated/share/replay-frame.png',
    backgrounds: {
        'sunlit-fern-run': 'assets/generated/backgrounds/sunlit-fern-run.png',
        'rainy-creek-run': 'assets/generated/backgrounds/rainy-creek-run.png',
        'glowroot-hollow': 'assets/generated/backgrounds/glowroot-hollow.png',
        'koi-river-rush': 'assets/generated/backgrounds/koi-river-rush.png',
        'torii-maple-descent': 'assets/generated/backgrounds/torii-maple-descent.png'
    },
    props: {
        'tuna-can': 'assets/generated/sprites/props/tuna-can.png',
        'premium-can': 'assets/generated/sprites/props/premium-can.png',
        'mystery-can': 'assets/generated/sprites/props/mystery-can.png',
        'catnip': 'assets/generated/sprites/props/catnip.png',
        'yarn-shield': 'assets/generated/sprites/props/yarn-shield.png',
        'rock': 'assets/generated/sprites/props/rock.png',
        'fallen-log': 'assets/generated/sprites/props/fallen-log.png',
        'bramble': 'assets/generated/sprites/props/bramble.png',
        'cool-cucumber': 'assets/generated/sprites/props/cool-cucumber.png',
        'cardboard-box': 'assets/generated/sprites/props/cardboard-box.png',
        'frog': 'assets/generated/sprites/props/frog.png',
        'ufo': 'assets/generated/sprites/props/ufo.png'
    },
    endings: {
        'ending-cardboard-box': 'assets/generated/sprites/endings/ending-cardboard-box.png',
        'ending-mud-splat': 'assets/generated/sprites/endings/ending-mud-splat.png',
        'ending-ufo': 'assets/generated/sprites/endings/ending-ufo.png',
        'ending-koi-ride': 'assets/generated/sprites/endings/ending-koi-ride.png',
        'ending-leaf-pile': 'assets/generated/sprites/endings/ending-leaf-pile.png'
    }
};

var NEKO_IMAGES = { backgrounds: {}, props: {}, endings: {} };
var NEKO_TEXTURES = new Map();

function nekoImage(src) {
    var image = new Image();
    image.decoding = 'async';
    image.src = src;
    return image;
}

function nekoTexture(src, nearest) {
    if (NEKO_TEXTURES.has(src)) return NEKO_TEXTURES.get(src);
    var texture = new THREE.TextureLoader().load(src);
    texture.minFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
    texture.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
    texture.generateMipmaps = false;
    if (THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
    NEKO_TEXTURES.set(src, texture);
    return texture;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/* Replace generated placeholder canvases with the real production atlases. */
PixelArtEngine.init = function () {
    ATL_CANVASES.character = nekoImage(NEKO_ASSETS.atlases.character);
    ATL_CANVASES.props = nekoImage(NEKO_ASSETS.atlases.props);
    ATL_CANVASES.environment = nekoImage(NEKO_ASSETS.atlases.environment);
    ATL_CANVASES.ui = nekoImage(NEKO_ASSETS.atlases.ui);
    ATL_CANVASES.seasonWeather = nekoImage(NEKO_ASSETS.atlases.seasonWeather);
    ATL_CANVASES.endings = nekoImage(NEKO_ASSETS.atlases.endings);
    ATL_CANVASES.replayFrame = nekoImage(NEKO_ASSETS.replayFrame);

    Object.keys(NEKO_ASSETS.backgrounds).forEach(function (id) {
        NEKO_IMAGES.backgrounds[id] = nekoImage(NEKO_ASSETS.backgrounds[id]);
    });
    Object.keys(NEKO_ASSETS.props).forEach(function (id) {
        NEKO_IMAGES.props[id] = nekoImage(NEKO_ASSETS.props[id]);
    });
    Object.keys(NEKO_ASSETS.endings).forEach(function (id) {
        NEKO_IMAGES.endings[id] = nekoImage(NEKO_ASSETS.endings[id]);
    });

    this.renderToDOMViewer();
};

var NEKO_BIOME_ORDER = [
    BIOMES.SUNLIT_FERN,
    BIOMES.RAINY_CREEK,
    BIOMES.GLOWROOT_HOLLOW,
    BIOMES.KOI_RIVER,
    BIOMES.TORII_MAPLE
];

var NEKO_CONDITIONS = [
    { name: 'SPRING DAWN', sprite: 'spring-petal-swirl.png', tint: 'rgba(255,185,190,.16)' },
    { name: 'CLEAR NOON', sprite: 'time-noon-rays.png', tint: 'rgba(255,225,130,.11)' },
    { name: 'SUMMER FIREFLIES', sprite: 'summer-fireflies.png', tint: 'rgba(80,150,80,.12)' },
    { name: 'FINE RAIN', sprite: 'weather-rain.png', tint: 'rgba(65,120,150,.25)' },
    { name: 'AUTUMN WIND', sprite: 'autumn-leaf-vortex.png', tint: 'rgba(190,75,35,.16)' },
    { name: 'MOONLIT FOG', sprite: 'weather-fog.png', tint: 'rgba(45,80,130,.27)' },
    { name: 'WINTER SNOW', sprite: 'weather-snow.png', tint: 'rgba(150,195,230,.22)' }
];

var originalResetGame = GameEngine.prototype.resetGame;

GameEngine.prototype.initThree = function () {
    var width = Math.max(1, this.canvas.clientWidth);
    var height = Math.max(1, this.canvas.clientHeight);
    this.hudCanvas.width = width;
    this.hudCanvas.height = height;

    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: false,
        alpha: false,
        preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x15120f, 1);

    this.scene = new THREE.Scene();
    this.viewHeight = 16;
    this.resizeCamera(width, height);
    this.clock = new THREE.Clock();
    this.historyCaptureTimer = 0;
    this.boostParticleTimer = 0;
    this.conditionIndex = -1;
    this.conditionName = 'SPRING DAWN';
    this.discoveries = 0;

    this.createScrollingChute();
    this.createCatMesh();
};

GameEngine.prototype.resizeCamera = function (width, height) {
    var aspect = width / height;
    var halfHeight = this.viewHeight / 2;
    var halfWidth = halfHeight * aspect;
    if (!this.camera) {
        this.camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 0.1, 30);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
    } else {
        this.camera.left = -halfWidth;
        this.camera.right = halfWidth;
        this.camera.top = halfHeight;
        this.camera.bottom = -halfHeight;
        this.camera.updateProjectionMatrix();
    }
    this.viewWidth = halfWidth * 2;
};

GameEngine.prototype.createScrollingChute = function () {
    this.backgroundHeight = 16;
    var geometry = new THREE.PlaneGeometry(9.2, this.backgroundHeight + 0.08);
    var texture = nekoTexture(NEKO_ASSETS.backgrounds[BIOMES.SUNLIT_FERN.id], false);
    var materialA = new THREE.MeshBasicMaterial({ map: texture, depthTest: false, depthWrite: false });
    var materialB = new THREE.MeshBasicMaterial({ map: texture, depthTest: false, depthWrite: false });

    var first = new THREE.Mesh(geometry, materialA);
    var second = new THREE.Mesh(geometry, materialB);
    first.position.set(0, 0, -4);
    second.position.set(0, -this.backgroundHeight, -4);
    first.renderOrder = -10;
    second.renderOrder = -10;
    this.scene.add(first, second);
    this.bgPlanes = [first, second];
    this.walls = [];
};

GameEngine.prototype.applyBiomeTexture = function (plane, biome) {
    plane.material.map = nekoTexture(NEKO_ASSETS.backgrounds[biome.id], false);
    plane.material.needsUpdate = true;
};

GameEngine.prototype.createCatMesh = function () {
    this.catTexture = nekoTexture(NEKO_ASSETS.atlases.character, true);
    this.catTexture.repeat.set(0.25, 0.25);
    this.catTexture.offset.set(0, 0.75);

    var geometry = new THREE.PlaneGeometry(2.9, 2.9);
    var material = new THREE.MeshBasicMaterial({
        map: this.catTexture,
        transparent: true,
        alphaTest: 0.04,
        depthTest: false,
        depthWrite: false
    });
    this.catMesh = new THREE.Mesh(geometry, material);
    this.catMesh.position.set(0, -2.25, 2);
    this.catMesh.renderOrder = 20;
    this.scene.add(this.catMesh);
};

GameEngine.prototype.setCatTextureSprite = function (row, col) {
    this.catTexture.offset.set(col * 0.25, (3 - row) * 0.25);
};

GameEngine.prototype.setupInput = function () {
    var self = this;
    var playArea = document.getElementById('screen-area');
    var dragging = false;
    var lastLeanSound = 0;

    function updateFromPointer(event) {
        var rect = playArea.getBoundingClientRect();
        var normalized = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        self.catTargetX = (normalized - 0.5) * 5.8;
        var now = performance.now();
        if (now - lastLeanSound > 220) {
            SOUND.playSFX('lean');
            self.logAudioEvent('lean');
            lastLeanSound = now;
        }
    }

    playArea.addEventListener('pointerdown', function (event) {
        if (self.state !== 'PLAYING') return;
        dragging = true;
        playArea.setPointerCapture?.(event.pointerId);
        updateFromPointer(event);
        event.preventDefault();
    });
    playArea.addEventListener('pointermove', function (event) {
        if (!dragging || self.state !== 'PLAYING') return;
        updateFromPointer(event);
        event.preventDefault();
    });
    function stopDrag(event) {
        dragging = false;
        if (event?.pointerId !== undefined) playArea.releasePointerCapture?.(event.pointerId);
    }
    playArea.addEventListener('pointerup', stopDrag);
    playArea.addEventListener('pointercancel', stopDrag);

    window.addEventListener('keydown', function (event) {
        if (self.state !== 'PLAYING') return;
        if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
            self.catTargetX = clamp(self.catTargetX - 1.05, -2.9, 2.9);
        }
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
            self.catTargetX = clamp(self.catTargetX + 1.05, -2.9, 2.9);
        }
    });
};

GameEngine.prototype.resetGame = function () {
    originalResetGame.call(this);
    document.querySelectorAll('.overlay-screen.active').forEach(function (screen) {
        screen.classList.remove('active');
    });
    this.lives = 9;
    this.discoveries = 0;
    this.scrollSpeed = 4.3;
    this.spawnTimer = 0.45;
    this.historyCaptureTimer = 0;
    this.conditionIndex = -1;
    this.conditionName = 'SPRING DAWN';
    this.bgOffset = 0;
    this.catMesh.visible = true;
    this.catMesh.rotation.set(0, 0, 0);
    this.catMesh.scale.set(1, 1, 1);
    if (this.endingMesh) {
        this.scene.remove(this.endingMesh);
        this.endingMesh = null;
    }
    this.particles.forEach(function (particle) { particle.mesh.parent?.remove(particle.mesh); });
    this.particles = [];
    this.bgPlanes[0].position.y = 0;
    this.bgPlanes[1].position.y = -this.backgroundHeight;
    this.bgPlanes.forEach(function (plane) { this.applyBiomeTexture(plane, BIOMES.SUNLIT_FERN); }, this);
    document.getElementById('weather-layer').style.opacity = '0';
    document.getElementById('time-tint').style.background = 'transparent';
    document.getElementById('screen-area').style.cursor = 'grabbing';

    var hint = document.getElementById('gesture-hint');
    hint.style.display = 'block';
    hint.style.animation = 'none';
    void hint.offsetWidth;
    hint.style.animation = 'hintFade 3.4s forwards';
};

GameEngine.prototype.spawnEntity = function () {
    var choices = [
        ['tuna-can', 25], ['premium-can', 9], ['mystery-can', 5],
        ['catnip', 7], ['yarn-shield', 7], ['rock', 17],
        ['fallen-log', 9], ['bramble', 6], ['cool-cucumber', 4],
        ['cardboard-box', 4], ['frog', 5], ['ufo', 2]
    ];
    var roll = Math.random() * choices.reduce(function (total, entry) { return total + entry[1]; }, 0);
    var chosenType = 'tuna-can';
    for (var i = 0; i < choices.length; i++) {
        roll -= choices[i][1];
        if (roll <= 0) {
            chosenType = choices[i][0];
            break;
        }
    }

    var obstacle = ['rock', 'fallen-log', 'bramble', 'cool-cucumber'].includes(chosenType);
    var discovery = ['mystery-can', 'cardboard-box', 'frog', 'ufo'].includes(chosenType);
    var material = new THREE.SpriteMaterial({
        map: nekoTexture(NEKO_ASSETS.props[chosenType], true),
        transparent: true,
        alphaTest: 0.04,
        depthTest: false,
        depthWrite: false
    });
    var sprite = new THREE.Sprite(material);
    var size = chosenType === 'fallen-log' || chosenType === 'bramble' ? 2.25 : 1.45;
    if (chosenType === 'ufo') size = 1.85;
    sprite.scale.set(size, size, 1);

    var lanes = [-2.55, -1.25, 0, 1.25, 2.55];
    var x = lanes[Math.floor(Math.random() * lanes.length)];
    sprite.position.set(x, -9.2, 0.8);
    sprite.renderOrder = 10;
    this.scene.add(sprite);
    this.entities.push({
        mesh: sprite,
        type: chosenType,
        x: x,
        y: -9.2,
        isObstacle: obstacle,
        isDiscovery: discovery,
        gathered: false
    });
};

GameEngine.prototype.showMoment = function (message) {
    var toast = document.getElementById('moment-toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () { toast.classList.remove('visible'); }, 950);
};

GameEngine.prototype.resolveEncounter = function (entity) {
    if (entity.isObstacle) {
        if (this.boostActive) {
            this.score += 50;
            this.showMoment('WHOOSH! TOO FAST TO BONK');
            SOUND.playSFX('pickup');
            return;
        }
        if (this.shieldActive) {
            this.shieldActive = false;
            this.showMoment('YARN SHIELD SAVED A LIFE');
            SOUND.playSFX('shield');
            return;
        }
        this.lives -= 1;
        this.mudFactor = 0.68;
        this.showMoment('BONK! ONE LIFE TUMBLED AWAY');
        SOUND.playSFX('bump');
        this.logAudioEvent('bump');
        this.spawnSplash();
        if (this.lives <= 0) this.triggerCuteEnding();
        return;
    }

    if (entity.type === 'tuna-can') {
        this.score += 20;
        this.cansCollected += 1;
        this.lives = Math.min(9, this.lives + 1);
        this.showMoment('TUNA! +1 LIFE');
    } else if (entity.type === 'premium-can') {
        this.score += 60;
        this.cansCollected += 1;
        this.lives = Math.min(9, this.lives + 2);
        this.showMoment('PREMIUM DINNER! +2 LIVES');
    } else if (entity.type === 'yarn-shield') {
        this.shieldActive = true;
        this.showMoment('SOFT YARN SHIELD');
    } else if (entity.type === 'catnip') {
        this.boostActive = true;
        this.boostTimer = 4.5;
        this.showMoment('CATNIP ZOOMIES');
    } else {
        this.score += 100;
        this.discoveries += 1;
        this.showMoment('NEW CUTE MOMENT DISCOVERED!');
    }
    SOUND.playSFX('pickup');
    this.logAudioEvent('pickup');
};

GameEngine.prototype.updateCondition = function () {
    var next = Math.floor(this.distance / 22) % NEKO_CONDITIONS.length;
    if (next === this.conditionIndex) return;
    this.conditionIndex = next;
    var condition = NEKO_CONDITIONS[next];
    this.conditionName = condition.name;
    var weather = document.getElementById('weather-layer');
    weather.style.opacity = '0';
    setTimeout(function () {
        weather.src = 'assets/generated/sprites/season-weather/' + condition.sprite;
        weather.style.opacity = condition.name === 'CLEAR NOON' ? '.36' : '.58';
    }, 220);
    document.getElementById('time-tint').style.background = condition.tint;
};

GameEngine.prototype.spawnSplash = function () {
    for (var i = 0; i < 4; i++) {
        var material = new THREE.SpriteMaterial({
            map: nekoTexture(i % 2 ? 'assets/generated/sprites/props/dirt-pebbles.png' : 'assets/generated/sprites/props/speed-leaves.png', true),
            transparent: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0.9
        });
        var sprite = new THREE.Sprite(material);
        sprite.scale.set(0.75, 0.75, 1);
        sprite.position.set(this.catX + (Math.random() - 0.5) * 1.2, -1.35, 1.4);
        sprite.renderOrder = 15;
        this.scene.add(sprite);
        this.particles.push({
            mesh: sprite,
            vx: (Math.random() - 0.5) * 1.8,
            vy: 2.8 + Math.random() * 2.2,
            vz: 0,
            life: 1
        });
    }
};

GameEngine.prototype.updateParticles = function (delta) {
    for (var i = this.particles.length - 1; i >= 0; i--) {
        var particle = this.particles[i];
        particle.mesh.position.x += particle.vx * delta;
        particle.mesh.position.y += particle.vy * delta;
        particle.life -= delta * 1.8;
        particle.mesh.material.opacity = Math.max(0, particle.life);
        particle.mesh.material.rotation += delta * 1.3;
        if (particle.life <= 0) {
            this.scene.remove(particle.mesh);
            particle.mesh.material.dispose();
            this.particles.splice(i, 1);
        }
    }
};

GameEngine.prototype.triggerCuteEnding = function () {
    if (this.state !== 'PLAYING') return;
    this.state = 'ENDING';
    SOUND.stopBGM();
    SOUND.playSFX('gameover');
    this.logAudioEvent('gameover');

    var endingByBiome = {};
    endingByBiome[BIOMES.SUNLIT_FERN.id] = ENDINGS[4];
    endingByBiome[BIOMES.RAINY_CREEK.id] = ENDINGS[1];
    endingByBiome[BIOMES.GLOWROOT_HOLLOW.id] = ENDINGS[8];
    endingByBiome[BIOMES.KOI_RIVER.id] = ENDINGS[12];
    endingByBiome[BIOMES.TORII_MAPLE.id] = ENDINGS[5];
    this.selectedEnding = endingByBiome[this.activeBiome.id] || ENDINGS[4];

    var self = this;
    var start = performance.now();
    function finishFrame(now) {
        var elapsed = now - start;
        if (elapsed < 720) {
            self.catMesh.rotation.z += 0.19;
            self.catMesh.scale.multiplyScalar(0.997);
            self.setCatTextureSprite(3, elapsed < 360 ? 0 : 1);
        } else if (!self.endingMesh) {
            self.catMesh.visible = false;
            var material = new THREE.SpriteMaterial({
                map: nekoTexture(NEKO_ASSETS.endings[self.selectedEnding.id], true),
                transparent: true,
                depthTest: false,
                depthWrite: false
            });
            self.endingMesh = new THREE.Sprite(material);
            self.endingMesh.scale.set(4.6, 4.6, 1);
            self.endingMesh.position.set(self.catX, -1.7, 2.2);
            self.endingMesh.renderOrder = 30;
            self.scene.add(self.endingMesh);
        }

        self.renderer.render(self.scene, self.camera);
        if (elapsed < 1650) {
            requestAnimationFrame(finishFrame);
            return;
        }

        document.getElementById('ending-name').innerText = self.selectedEnding.text;
        document.getElementById('ending-art').src = NEKO_ASSETS.endings[self.selectedEnding.id];
        document.getElementById('res-score').innerText = self.score;
        document.getElementById('res-dist').innerText = Math.floor(self.distance) + 'm';
        document.getElementById('res-cans').innerText = self.cansCollected;
        document.getElementById('res-combo').innerText = self.discoveries + ' found';
        self.state = 'RESULTS';
        showScreen('results-screen');
    }
    requestAnimationFrame(finishFrame);
};

GameEngine.prototype.captureState = function () {
    this.history.push({
        timeOffset: Date.now() - this.runStartTime,
        catX: this.catX,
        catTargetX: this.catTargetX,
        scrollSpeed: this.scrollSpeed,
        score: this.score,
        distance: this.distance,
        lives: this.lives,
        discoveries: this.discoveries,
        conditionName: this.conditionName,
        activeBiome: Object.assign({}, this.activeBiome),
        shieldActive: this.shieldActive,
        boostActive: this.boostActive,
        entities: this.entities.map(function (entity) {
            return {
                type: entity.type,
                x: entity.mesh.position.x,
                y: entity.mesh.position.y,
                isObstacle: entity.isObstacle,
                gathered: entity.gathered
            };
        }),
        bgOffset: this.bgOffset
    });
    if (this.history.length > this.maxHistoryLength) this.history.shift();
};

GameEngine.prototype.animate = function () {
    requestAnimationFrame(this.animate.bind(this));
    var width = Math.max(1, this.canvas.clientWidth);
    var height = Math.max(1, this.canvas.clientHeight);
    if (this.lastWidth !== width || this.lastHeight !== height) {
        this.lastWidth = width;
        this.lastHeight = height;
        this.renderer.setSize(width, height, false);
        this.resizeCamera(width, height);
        this.hudCanvas.width = width;
        this.hudCanvas.height = height;
    }

    var delta = Math.min(this.clock.getDelta(), 0.034);
    if (this.state !== 'PLAYING') {
        this.renderer.render(this.scene, this.camera);
        return;
    }

    this.catX += (this.catTargetX - this.catX) * Math.min(1, delta * 10.5);
    this.catMesh.position.x = this.catX;
    this.catMesh.position.y = -2.25 + Math.sin(performance.now() * 0.008) * 0.08;
    var steerDelta = this.catTargetX - this.catX;
    this.catMesh.rotation.z += ((-steerDelta * 0.055) - this.catMesh.rotation.z) * 0.13;
    if (Math.abs(steerDelta) > 0.25) this.setCatTextureSprite(0, steerDelta < 0 ? 1 : 2);
    else this.setCatTextureSprite(0, this.boostActive ? 3 : 0);

    if (this.boostActive) {
        this.boostTimer -= delta;
        this.scrollSpeed = 8.5;
        this.boostParticleTimer += delta;
        if (this.boostParticleTimer > 0.14) {
            this.spawnSplash();
            this.boostParticleTimer = 0;
        }
        if (this.boostTimer <= 0) this.boostActive = false;
    } else {
        this.scrollSpeed = Math.min(6.7, 4.3 + this.distance / 150);
    }

    this.distanceCovered += this.scrollSpeed * delta;
    this.distance = this.distanceCovered * 0.45;
    this.bgOffset += this.scrollSpeed * delta;

    var biomeIndex = Math.floor(this.distance / 55) % NEKO_BIOME_ORDER.length;
    var nextBiome = NEKO_BIOME_ORDER[biomeIndex];
    if (nextBiome !== this.activeBiome) {
        this.activeBiome = nextBiome;
        SOUND.setBiome(nextBiome.id);
        this.showMoment(nextBiome.name.toUpperCase());
    }
    this.updateCondition();

    var backgroundStep = this.scrollSpeed * delta;
    for (var b = 0; b < this.bgPlanes.length; b++) {
        var plane = this.bgPlanes[b];
        plane.position.y += backgroundStep;
        if (plane.position.y >= this.backgroundHeight) {
            var lowest = Math.min.apply(null, this.bgPlanes.map(function (item) { return item.position.y; }));
            plane.position.y = lowest - this.backgroundHeight;
            this.applyBiomeTexture(plane, this.activeBiome);
        }
    }

    this.spawnTimer += delta;
    if (this.spawnTimer > 1.08) {
        this.spawnEntity();
        this.spawnTimer = 0;
    }

    for (var i = this.entities.length - 1; i >= 0; i--) {
        var entity = this.entities[i];
        entity.mesh.position.y += this.scrollSpeed * delta * 1.08;
        entity.mesh.material.rotation += delta * (entity.isObstacle ? 0.45 : 1.15);
        var yDistance = Math.abs(entity.mesh.position.y - this.catMesh.position.y);
        var xDistance = Math.abs(entity.mesh.position.x - this.catMesh.position.x);
        if (yDistance < 0.92 && xDistance < 0.82 && !entity.gathered) {
            entity.gathered = true;
            this.scene.remove(entity.mesh);
            this.entities.splice(i, 1);
            this.resolveEncounter(entity);
            if (this.state !== 'PLAYING') break;
            continue;
        }
        if (entity.mesh.position.y > 9.2) {
            this.scene.remove(entity.mesh);
            this.entities.splice(i, 1);
        }
    }

    if (this.mudFactor > 0) {
        this.mudFactor = Math.max(0, this.mudFactor - delta * 0.45);
        document.getElementById('mud-overlay').style.opacity = this.mudFactor;
    }

    this.updateParticles(delta);
    this.renderer.render(this.scene, this.camera);
    this.renderHUD();
    this.historyCaptureTimer += delta;
    if (this.historyCaptureTimer >= 1 / 30) {
        this.historyCaptureTimer -= 1 / 30;
        this.captureState();
    }
};

GameEngine.prototype.renderHUD = function () {
    var ctx = this.hudCtx;
    var width = this.hudCanvas.width;
    var height = this.hudCanvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = '#221e19';
    ctx.shadowBlur = 4;
    ctx.font = "8px 'Press Start 2P'";

    ctx.fillStyle = 'rgba(34,30,25,.72)';
    ctx.fillRect(8, 8, 122, 44);
    ctx.fillRect(width - 146, 8, 138, 44);
    ctx.fillStyle = '#fff4cf';
    ctx.fillText('DIST ' + Math.floor(this.distance) + 'm', 16, 24);
    ctx.fillStyle = '#ffdd59';
    ctx.fillText('SCORE ' + this.score, 16, 42);

    ctx.fillStyle = '#ffd0bf';
    ctx.fillText('LIVES ' + '●'.repeat(this.lives), width - 138, 24);
    ctx.fillStyle = '#9de4d8';
    ctx.fillText('FOUND ' + this.discoveries, width - 138, 42);

    ctx.fillStyle = 'rgba(34,30,25,.76)';
    ctx.fillRect(8, height - 42, width - 16, 32);
    ctx.fillStyle = '#fff4cf';
    ctx.fillText(this.activeBiome.name.toUpperCase(), 16, height - 23);
    ctx.fillStyle = '#b9e2c1';
    ctx.textAlign = 'right';
    ctx.fillText(this.conditionName, width - 16, height - 23);
    ctx.textAlign = 'left';
};

ReplayExporter.drawStateToExportCanvas = function (ctx, state) {
    ctx.clearRect(0, 0, 720, 1280);
    ctx.fillStyle = '#17130f';
    ctx.fillRect(0, 0, 720, 1280);
    var background = NEKO_IMAGES.backgrounds[state.activeBiome.id];
    if (background?.complete) {
        var shift = -((state.bgOffset * 80) % 1280);
        ctx.drawImage(background, 0, shift, 720, 1280);
        ctx.drawImage(background, 0, shift + 1280, 720, 1280);
    }

    state.entities.forEach(function (entity) {
        if (entity.gathered) return;
        var image = NEKO_IMAGES.props[entity.type];
        if (!image?.complete) return;
        var x = 360 + (entity.x / 3.2) * 300;
        var y = ((8 - entity.y) / 16) * 1280;
        var size = entity.type === 'fallen-log' || entity.type === 'bramble' ? 138 : 94;
        ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
    });

    if (ATL_CANVASES.character.complete) {
        var cellWidth = ATL_CANVASES.character.naturalWidth / 4;
        var cellHeight = ATL_CANVASES.character.naturalHeight / 4;
        var catX = 360 + (state.catX / 3.2) * 300;
        var catY = ((8 - (-2.25)) / 16) * 1280;
        ctx.drawImage(ATL_CANVASES.character, 0, 0, cellWidth, cellHeight, catX - 82, catY - 82, 164, 164);
    }

    if (ATL_CANVASES.replayFrame.complete) ctx.drawImage(ATL_CANVASES.replayFrame, 0, 0, 720, 1280);
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = '#fff4cf';
    ctx.textAlign = 'center';
    ctx.fillText('NEKO ROGARU', 360, 78);
    ctx.font = "15px 'Press Start 2P'";
    ctx.fillText(Math.floor(state.distance) + 'm', 220, 1160);
    ctx.fillText(state.lives + ' LIVES', 360, 1160);
    ctx.fillText((state.discoveries || 0) + ' FOUND', 510, 1160);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillStyle = '#ffdd59';
    ctx.fillText(state.activeBiome.name.toUpperCase(), 360, 1215);
};
