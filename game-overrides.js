/* Neko Rogaru art/input/world integration layer.
 * Keeps the Gemini Three.js skeleton while replacing its procedural placeholders.
 */

var NEKO_ASSET_VERSION = '20260627-cat-rollback-v1';

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
    characters: {
        'slide-neutral': 'assets/generated/sprites/character/slide-neutral.png',
        'slide-left': 'assets/generated/sprites/character/slide-left.png',
        'slide-right': 'assets/generated/sprites/character/slide-right.png',
        'fast-fall': 'assets/generated/sprites/character/fast-fall.png',
        'blink': 'assets/generated/sprites/character/blink.png',
        'happy-meow': 'assets/generated/sprites/character/happy-meow.png',
        'worried': 'assets/generated/sprites/character/worried.png',
        'dizzy': 'assets/generated/sprites/character/dizzy.png',
        'pickup-happy': 'assets/generated/sprites/character/pickup-happy.png',
        'bump': 'assets/generated/sprites/character/bump.png',
        'sneeze': 'assets/generated/sprites/character/sneeze.png',
        'branch-catch': 'assets/generated/sprites/character/branch-catch.png',
        'tumble-a': 'assets/generated/sprites/character/tumble-a.png',
        'tumble-b': 'assets/generated/sprites/character/tumble-b.png',
        'soft-landing': 'assets/generated/sprites/character/soft-landing.png',
        'victory-wave': 'assets/generated/sprites/character/victory-wave.png'
    },
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
        'springy-branch': 'assets/generated/sprites/props/springy-branch.png',
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

var NEKO_IMAGES = { backgrounds: {}, characters: {}, props: {}, endings: {}, weather: {} };
var NEKO_TEXTURES = new Map();

function nekoVersioned(src) {
    return src + (src.indexOf('?') === -1 ? '?' : '&') + 'v=' + NEKO_ASSET_VERSION;
}

function nekoImage(src) {
    var image = new Image();
    image.decoding = 'async';
    image.src = nekoVersioned(src);
    return image;
}

function nekoTexture(src, nearest) {
    var versionedSrc = nekoVersioned(src);
    if (NEKO_TEXTURES.has(versionedSrc)) return NEKO_TEXTURES.get(versionedSrc);
    var texture = new THREE.TextureLoader().load(versionedSrc);
    texture.minFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
    texture.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
    texture.generateMipmaps = false;
    if (THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
    NEKO_TEXTURES.set(versionedSrc, texture);
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
    Object.keys(NEKO_ASSETS.characters).forEach(function (id) {
        NEKO_IMAGES.characters[id] = nekoImage(NEKO_ASSETS.characters[id]);
    });
    Object.keys(NEKO_ASSETS.props).forEach(function (id) {
        NEKO_IMAGES.props[id] = nekoImage(NEKO_ASSETS.props[id]);
    });
    Object.keys(NEKO_ASSETS.endings).forEach(function (id) {
        NEKO_IMAGES.endings[id] = nekoImage(NEKO_ASSETS.endings[id]);
    });
    NEKO_SEASONS.concat(NEKO_WEATHERS, [NEKO_SNOW_WEATHER]).forEach(function (condition) {
        condition.sprites.forEach(function (id) {
            if (!NEKO_IMAGES.weather[id]) {
                NEKO_IMAGES.weather[id] = nekoImage('assets/generated/sprites/season-weather/' + id + '.png');
            }
        });
    });

    this.renderToDOMViewer();
};

var NEKO_BIOME_ORDER = [
    BIOMES.SUNLIT_FERN,
    BIOMES.KOI_RIVER,
    BIOMES.TORII_MAPLE,
    BIOMES.GLOWROOT_HOLLOW,
    BIOMES.RAINY_CREEK,
    BIOMES.KOI_RIVER,
    BIOMES.TORII_MAPLE,
    BIOMES.GLOWROOT_HOLLOW
];

var NEKO_TIMES = [
    { name: 'MORNING', tint: 'linear-gradient(rgba(255,239,185,.24), rgba(255,205,145,.10))', blend: 'screen' },
    { name: 'NOON', tint: 'linear-gradient(rgba(255,250,220,.20), rgba(255,236,170,.08))', blend: 'screen' },
    { name: 'SUNSET', tint: 'linear-gradient(rgba(255,126,77,.24), rgba(103,55,105,.15))', blend: 'soft-light' },
    { name: 'NIGHT', tint: 'linear-gradient(rgba(20,38,72,.20), rgba(28,55,88,.15))', blend: 'multiply' }
];

var NEKO_SEASONS = [
    { name: 'SPRING', sprites: ['spring-branch-left', 'spring-branch-right', 'spring-petal-swirl', 'spring-wildflowers', 'spring-fiddleheads', 'spring-blossom-puddle'] },
    { name: 'SUMMER', sprites: ['summer-leaves-left', 'summer-leaves-right', 'summer-cicada', 'summer-pollen', 'summer-fireflies'] },
    { name: 'AUTUMN', sprites: ['autumn-maple-left', 'autumn-maple-right', 'autumn-leaf-vortex', 'autumn-acorns', 'autumn-persimmons', 'autumn-golden-grass'] },
    { name: 'WINTER', sprites: ['winter-bank-left', 'winter-bank-right', 'winter-bamboo', 'winter-icicles', 'winter-snowdrift', 'winter-ice-sparkles'] }
];

var NEKO_WEATHERS = [
    { name: 'CLEAR', sprites: [] },
    { name: 'BREEZE', sprites: ['weather-wind'] },
    { name: 'DRIZZLE', sprites: ['weather-rain'] },
    { name: 'MIST', sprites: ['weather-fog'] }
];

var NEKO_SNOW_WEATHER = { name: 'SNOW', sprites: ['weather-snow'] };

var CAT_POSES = {
    'slide-neutral': [0, 0], 'slide-left': [0, 1], 'slide-right': [0, 2], 'fast-fall': [0, 3],
    'blink': [1, 0], 'happy-meow': [1, 1], 'worried': [1, 2], 'dizzy': [1, 3],
    'pickup-happy': [2, 0], 'bump': [2, 1], 'sneeze': [2, 2], 'branch-catch': [2, 3],
    'tumble-a': [3, 0], 'tumble-b': [3, 1], 'soft-landing': [3, 2], 'victory-wave': [3, 3]
};

var NEKO_MUSIC = {
    files: {
        MORNING: 'assets/generated/audio/morning.mp3',
        NOON: 'assets/generated/audio/noon.mp3',
        SUNSET: 'assets/generated/audio/main.mp3',
        NIGHT: 'assets/generated/audio/night.mp3'
    },
    tracks: {},
    initialized: false,
    activeKey: null,
    masterVolume: 0.3,
    fadeSeconds: 1.8,
    stopToken: 0,

    init: function () {
        if (this.initialized) return true;
        SOUND.init();
        if (!SOUND.ctx || !SOUND.dest) return false;

        var self = this;
        Object.keys(this.files).forEach(function (key) {
            var audio = new Audio();
            audio.preload = 'auto';
            audio.loop = true;
            audio.crossOrigin = 'anonymous';
            audio.src = self.files[key];
            var source = SOUND.ctx.createMediaElementSource(audio);
            var gain = SOUND.ctx.createGain();
            gain.gain.value = 0;
            source.connect(gain);
            gain.connect(SOUND.ctx.destination);
            gain.connect(SOUND.dest);
            self.tracks[key] = { audio: audio, source: source, gain: gain };
        });
        this.initialized = true;
        return true;
    },

    start: function (timeName, immediate) {
        if (!this.init()) return;
        this.stopToken++;
        SOUND.ctx.resume?.();
        var wasRunning = Object.keys(this.tracks).some(function (key) {
            return !NEKO_MUSIC.tracks[key].audio.paused;
        });
        Object.keys(this.tracks).forEach(function (key) {
            var track = NEKO_MUSIC.tracks[key];
            if (!wasRunning) {
                try { track.audio.currentTime = 0; } catch (error) {}
            }
            track.audio.play().catch(function () {});
        });
        this.setTime(timeName || 'MORNING', immediate ? 0.08 : this.fadeSeconds);
    },

    setTime: function (timeName, fadeSeconds) {
        if (!this.init()) return;
        var key = this.files[timeName] ? timeName : 'SUNSET';
        if (this.activeKey === key && fadeSeconds === undefined) return;
        this.activeKey = key;
        this.stopToken++;
        var now = SOUND.ctx.currentTime;
        var fade = fadeSeconds === undefined ? this.fadeSeconds : Math.max(0.03, fadeSeconds);
        var self = this;
        Object.keys(this.tracks).forEach(function (trackKey) {
            var gain = self.tracks[trackKey].gain.gain;
            var target = trackKey === key ? self.masterVolume : 0.0001;
            gain.cancelScheduledValues(now);
            gain.setValueAtTime(Math.max(0.0001, gain.value), now);
            gain.exponentialRampToValueAtTime(Math.max(0.0001, target), now + fade);
        });
    },

    stop: function (fadeSeconds) {
        if (!this.initialized || !SOUND.ctx) return;
        var fade = fadeSeconds === undefined ? 0.7 : Math.max(0.03, fadeSeconds);
        var now = SOUND.ctx.currentTime;
        var token = ++this.stopToken;
        Object.keys(this.tracks).forEach(function (key) {
            var gain = NEKO_MUSIC.tracks[key].gain.gain;
            gain.cancelScheduledValues(now);
            gain.setValueAtTime(Math.max(0.0001, gain.value), now);
            gain.exponentialRampToValueAtTime(0.0001, now + fade);
        });
        var self = this;
        setTimeout(function () {
            if (token !== self.stopToken) return;
            Object.keys(self.tracks).forEach(function (key) { self.tracks[key].audio.pause(); });
            self.activeKey = null;
        }, fade * 1000 + 80);
    }
};

/* Keep the procedural synth for SFX, but replace its background sequencer. */
SOUND.startBGM = function () {
    this.init();
    this.isPlaying = true;
    NEKO_MUSIC.start('MORNING', true);
};

SOUND.stopBGM = function () {
    if (this.sequencerTimer) clearTimeout(this.sequencerTimer);
    this.sequencerTimer = null;
    this.isPlaying = false;
    NEKO_MUSIC.stop(0.7);
};

SOUND.setBiome = function (biomeId) {
    this.currentBiomeId = biomeId;
};

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
    this.catMomentTimer = 0;
    this.catPose = 'slide-neutral';
    this.catY = -1.15;
    this.blinkTimer = 2.8;
    this.sneezeTimer = 7;
    this.hanging = false;
    this.caughtBranch = null;
    this.backgroundDecorations = [];
    this.weatherSprites = [];
    this.timeIndex = -1;
    this.seasonIndex = -1;
    this.weatherIndex = -1;
    this.timeName = 'MORNING';
    this.seasonName = 'SPRING';
    this.weatherName = 'CLEAR';
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
    this.catMesh.position.set(0, this.catY, 2);
    this.catMesh.renderOrder = 20;
    this.scene.add(this.catMesh);
};

GameEngine.prototype.setCatTextureSprite = function (row, col) {
    this.catTexture.offset.set(col * 0.25, (3 - row) * 0.25);
};

GameEngine.prototype.setCatPose = function (pose) {
    var coords = CAT_POSES[pose] || CAT_POSES['slide-neutral'];
    this.catPose = pose;
    this.setCatTextureSprite(coords[0], coords[1]);
};

GameEngine.prototype.playCatMoment = function (pose, duration) {
    if (this.hanging && pose !== 'branch-catch') return;
    this.catMomentTimer = duration || 0.65;
    this.setCatPose(pose);
};

GameEngine.prototype.setupInput = function () {
    var self = this;
    var playArea = document.getElementById('screen-area');
    var dragging = false;
    var lastLeanSound = 0;
    var swipeStartX = 0;

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
        swipeStartX = event.clientX;
        playArea.setPointerCapture?.(event.pointerId);
        if (!self.hanging) updateFromPointer(event);
        event.preventDefault();
    });
    playArea.addEventListener('pointermove', function (event) {
        if (!dragging || self.state !== 'PLAYING') return;
        if (self.hanging) {
            var swipeDistance = event.clientX - swipeStartX;
            if (Math.abs(swipeDistance) >= 24) {
                self.releaseBranch(swipeDistance < 0 ? -1 : 1);
                swipeStartX = event.clientX;
                updateFromPointer(event);
            }
            event.preventDefault();
            return;
        }
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
            if (self.hanging) self.releaseBranch(-1);
            self.catTargetX = clamp(self.catTargetX - 1.05, -2.9, 2.9);
        }
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
            if (self.hanging) self.releaseBranch(1);
            self.catTargetX = clamp(self.catTargetX + 1.05, -2.9, 2.9);
        }
    });
};

GameEngine.prototype.resetGame = function () {
    var previousEntities = (this.entities || []).slice();
    previousEntities.forEach(function (entity) {
        if (entity.halo) {
            entity.halo.parent?.remove(entity.halo);
            entity.halo.material.dispose();
        }
    });
    originalResetGame.call(this);
    document.querySelectorAll('.overlay-screen.active').forEach(function (screen) {
        screen.classList.remove('active');
    });
    this.lives = 9;
    this.discoveries = 0;
    this.scrollSpeed = 4.3;
    this.spawnTimer = 0.2;
    this.historyCaptureTimer = 0;
    this.maxHistoryLength = 360;
    this.catMomentTimer = 0;
    this.blinkTimer = 2.5 + Math.random() * 2;
    this.sneezeTimer = 6 + Math.random() * 5;
    this.hanging = false;
    this.catY = -1.15;
    this.setCatPose('slide-neutral');
    this.timeIndex = -1;
    this.seasonIndex = -1;
    this.weatherIndex = -1;
    this.timeName = 'MORNING';
    this.seasonName = 'SPRING';
    this.weatherName = 'CLEAR';
    this.bgOffset = 0;
    this.catMesh.visible = true;
    this.catMesh.rotation.set(0, 0, 0);
    this.catMesh.scale.set(1, 1, 1);
    if (this.endingMesh) {
        this.scene.remove(this.endingMesh);
        this.endingMesh = null;
    }
    if (this.caughtBranch) {
        this.scene.remove(this.caughtBranch);
        this.caughtBranch = null;
    }
    (this.backgroundDecorations || []).forEach(function (decoration) {
        decoration.mesh.parent?.remove(decoration.mesh);
        decoration.mesh.material.dispose();
    });
    this.backgroundDecorations = [];
    (this.weatherSprites || []).forEach(function (decoration) {
        decoration.mesh.parent?.remove(decoration.mesh);
        decoration.mesh.material.dispose();
    });
    this.weatherSprites = [];
    this.particles.forEach(function (particle) { particle.mesh.parent?.remove(particle.mesh); });
    this.particles = [];
    this.bgPlanes[0].position.y = 0;
    this.bgPlanes[1].position.y = -this.backgroundHeight;
    this.bgPlanes.forEach(function (plane) { this.applyBiomeTexture(plane, BIOMES.SUNLIT_FERN); }, this);
    document.getElementById('weather-layer').style.display = 'none';
    var timeTint = document.getElementById('time-tint');
    timeTint.style.background = NEKO_TIMES[0].tint;
    timeTint.style.mixBlendMode = NEKO_TIMES[0].blend;
    document.getElementById('screen-area').style.cursor = 'grabbing';

    var hint = document.getElementById('gesture-hint');
    hint.innerHTML = 'DRAG YOUR FINGER<br>THE WORLD FALLS PAST YOU';
    hint.style.opacity = '';
    hint.style.display = 'block';
    hint.style.animation = 'none';
    void hint.offsetWidth;
    hint.style.animation = 'hintFade 3.4s forwards';
};

GameEngine.prototype.spawnEntity = function () {
    var difficulty = clamp(this.distance / 180, 0, 1);
    var choices = [
        ['tuna-can', 13], ['premium-can', 4], ['mystery-can', 4],
        ['catnip', 5], ['yarn-shield', 5], ['springy-branch', 7],
        ['rock', 19 + difficulty * 8], ['fallen-log', 13 + difficulty * 6],
        ['bramble', 10 + difficulty * 5], ['cool-cucumber', 8 + difficulty * 4],
        ['cardboard-box', 3], ['frog', 3], ['ufo', 1]
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

    var firstLane = this.spawnEntityOfType(chosenType);
    var doubleChance = clamp(0.08 + this.distance / 420, 0.08, 0.38);
    if (this.distance > 28 && Math.random() < doubleChance && chosenType !== 'springy-branch') {
        var hazards = ['rock', 'fallen-log', 'bramble', 'cool-cucumber'];
        this.spawnEntityOfType(hazards[Math.floor(Math.random() * hazards.length)], firstLane);
    }
};

GameEngine.prototype.spawnEntityOfType = function (chosenType, excludedLane) {
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
    var size = chosenType === 'fallen-log' || chosenType === 'bramble' ? 2.55 : 1.72;
    if (chosenType === 'springy-branch') size = 2.35;
    if (chosenType === 'ufo') size = 2.05;
    sprite.scale.set(size, size, 1);

    var haloMaterial = new THREE.SpriteMaterial({
        map: nekoTexture(NEKO_ASSETS.props[chosenType], true),
        color: obstacle ? 0xff9b75 : 0xfff1a8,
        transparent: true,
        alphaTest: 0.025,
        depthTest: false,
        depthWrite: false,
        opacity: obstacle ? 0.78 : 0.92
    });
    var halo = new THREE.Sprite(haloMaterial);
    var haloSize = size * 1.28;
    halo.scale.set(haloSize, haloSize, 1);

    var lanes = [-2.55, -1.25, 0, 1.25, 2.55];
    var availableLanes = excludedLane === undefined ? lanes : lanes.filter(function (lane) {
        return Math.abs(lane - excludedLane) > 0.7;
    });
    var x = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    sprite.position.set(x, -9.2, 0.8);
    halo.position.set(x, -9.2, 0.55);
    sprite.renderOrder = 10;
    halo.renderOrder = 9;
    this.scene.add(halo, sprite);
    this.entities.push({
        mesh: sprite,
        halo: halo,
        haloSize: haloSize,
        pulseOffset: Math.random() * Math.PI * 2,
        type: chosenType,
        x: x,
        y: -9.2,
        isObstacle: obstacle,
        isDiscovery: discovery,
        gathered: false
    });
    return x;
};

GameEngine.prototype.showMoment = function (message) {
    var toast = document.getElementById('moment-toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () { toast.classList.remove('visible'); }, 950);
};

GameEngine.prototype.beginBranchHang = function () {
    if (this.hanging) return;
    this.hanging = true;
    this.catTargetX = this.catX;
    this.setCatPose('branch-catch');
    this.catMomentTimer = Infinity;

    var material = new THREE.SpriteMaterial({
        map: nekoTexture(NEKO_ASSETS.props['springy-branch'], true),
        transparent: true,
        alphaTest: 0.04,
        depthTest: false,
        depthWrite: false
    });
    this.caughtBranch = new THREE.Sprite(material);
    this.caughtBranch.scale.set(3.1, 3.1, 1);
    this.caughtBranch.position.set(this.catX, this.catY + 1.15, 1.65);
    this.caughtBranch.renderOrder = 18;
    this.scene.add(this.caughtBranch);

    var hint = document.getElementById('gesture-hint');
    hint.innerHTML = 'BRANCH BREAK!<br>SWIPE LEFT OR RIGHT TO LET GO';
    hint.style.display = 'block';
    hint.style.opacity = '1';
    this.showMoment('A PERFECTLY GOOD REST STOP');
    SOUND.playSFX('shield');
    this.logAudioEvent('shield');
};

GameEngine.prototype.releaseBranch = function (direction) {
    if (!this.hanging) return;
    this.hanging = false;
    this.catMomentTimer = 0.5;
    this.catTargetX = clamp(this.catX + direction * 0.8, -2.9, 2.9);
    this.setCatPose(direction < 0 ? 'tumble-a' : 'tumble-b');
    if (this.caughtBranch) {
        this.scene.remove(this.caughtBranch);
        this.caughtBranch.material.dispose();
        this.caughtBranch = null;
    }
    var hint = document.getElementById('gesture-hint');
    hint.innerHTML = 'DRAG YOUR FINGER<br>THE WORLD FALLS PAST YOU';
    hint.style.opacity = '0';
    this.showMoment('AND... BACK TO FALLING!');
    this.spawnSplash();
};

GameEngine.prototype.resolveEncounter = function (entity) {
    if (entity.type === 'springy-branch') {
        this.beginBranchHang();
        return;
    }
    if (entity.isObstacle) {
        if (this.boostActive) {
            this.score += 50;
            this.showMoment('WHOOSH! TOO FAST TO BONK');
            this.playCatMoment('victory-wave', 0.45);
            SOUND.playSFX('pickup');
            return;
        }
        if (this.shieldActive) {
            this.shieldActive = false;
            this.showMoment('YARN SHIELD SAVED A LIFE');
            this.playCatMoment('worried', 0.55);
            SOUND.playSFX('shield');
            return;
        }
        var damage = entity.type === 'fallen-log' || entity.type === 'bramble' ? 2 : 1;
        this.lives -= damage;
        this.mudFactor = 0.68;
        this.showMoment('BONK! ' + damage + (damage === 1 ? ' LIFE' : ' LIVES') + ' TUMBLED AWAY');
        this.playCatMoment('bump', 0.38);
        var self = this;
        setTimeout(function () {
            if (self.state === 'PLAYING' && !self.hanging) self.playCatMoment('dizzy', 0.72);
        }, 330);
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
        this.playCatMoment('pickup-happy', 0.62);
    } else if (entity.type === 'premium-can') {
        this.score += 60;
        this.cansCollected += 1;
        this.lives = Math.min(9, this.lives + 2);
        this.showMoment('PREMIUM DINNER! +2 LIVES');
        this.playCatMoment('happy-meow', 0.82);
    } else if (entity.type === 'yarn-shield') {
        this.shieldActive = true;
        this.showMoment('SOFT YARN SHIELD');
        this.playCatMoment('victory-wave', 0.72);
    } else if (entity.type === 'catnip') {
        this.boostActive = true;
        this.boostTimer = 4.5;
        this.showMoment('CATNIP ZOOMIES');
    } else {
        this.score += 100;
        this.discoveries += 1;
        this.showMoment('NEW CUTE MOMENT DISCOVERED!');
        this.playCatMoment(this.discoveries % 2 ? 'happy-meow' : 'victory-wave', 0.85);
    }
    SOUND.playSFX('pickup');
    this.logAudioEvent('pickup');
};

GameEngine.prototype.updateCondition = function () {
    var nextTime = Math.floor(this.distance / 55) % NEKO_TIMES.length;
    var nextSeason = Math.floor(this.distance / 140) % NEKO_SEASONS.length;
    var nextWeather = Math.floor(this.distance / 36) % NEKO_WEATHERS.length;
    var decorationChanged = nextSeason !== this.seasonIndex || nextWeather !== this.weatherIndex;

    if (nextTime !== this.timeIndex) {
        this.timeIndex = nextTime;
        var time = NEKO_TIMES[nextTime];
        this.timeName = time.name;
        var tint = document.getElementById('time-tint');
        tint.style.background = time.tint;
        tint.style.mixBlendMode = time.blend;
        if (this.state === 'PLAYING') NEKO_MUSIC.setTime(time.name);
    }

    this.seasonIndex = nextSeason;
    this.weatherIndex = nextWeather;
    this.seasonName = NEKO_SEASONS[nextSeason].name;
    var weather = nextSeason === 3 && nextWeather === 2 ? NEKO_SNOW_WEATHER : NEKO_WEATHERS[nextWeather];
    this.weatherName = weather.name;
    if (decorationChanged) this.createConditionDecorations(NEKO_SEASONS[nextSeason], weather);
};

GameEngine.prototype.createConditionDecorations = function (season, weather) {
    (this.backgroundDecorations || []).forEach(function (decoration) {
        decoration.mesh.parent?.remove(decoration.mesh);
        decoration.mesh.material.dispose();
    });
    this.backgroundDecorations = [];
    (this.weatherSprites || []).forEach(function (decoration) {
        decoration.mesh.parent?.remove(decoration.mesh);
        decoration.mesh.material.dispose();
    });
    this.weatherSprites = [];

    for (var planeIndex = 0; planeIndex < this.bgPlanes.length; planeIndex++) {
        var plane = this.bgPlanes[planeIndex];
        for (var s = 0; s < 8; s++) {
            var seasonId = season.sprites[(s + planeIndex * 2) % season.sprites.length];
            var seasonMaterial = new THREE.SpriteMaterial({
                map: nekoTexture('assets/generated/sprites/season-weather/' + seasonId + '.png', true),
                transparent: true,
                depthTest: false,
                depthWrite: false,
                opacity: 0.7
            });
            var seasonSprite = new THREE.Sprite(seasonMaterial);
            var edgeDecoration = /left|right|bank|bamboo|wildflowers/.test(seasonId);
            var seasonSize = edgeDecoration ? 1.82 : 1.18;
            seasonSprite.scale.set(seasonSize, seasonSize, 1);
            var side = s % 2 ? 1 : -1;
            var x = edgeDecoration ? side * 3.15 : side * (2.15 + (s % 3) * 0.3);
            var y = -7 + s * 2;
            seasonSprite.position.set(x, y, 0.3);
            seasonSprite.renderOrder = -5;
            plane.add(seasonSprite);
            this.backgroundDecorations.push({ mesh: seasonSprite, id: seasonId, plane: plane });
        }
    }

    var weatherCount = weather.name === 'CLEAR' ? 0 : weather.name === 'BREEZE' ? 3 : weather.name === 'MIST' ? 4 : 8;
    for (var w = 0; w < weatherCount; w++) {
        var spriteId = weather.sprites[w % weather.sprites.length];
        var material = new THREE.SpriteMaterial({
            map: nekoTexture('assets/generated/sprites/season-weather/' + spriteId + '.png', true),
            transparent: true,
            depthTest: false,
            depthWrite: false,
            opacity: spriteId === 'weather-fog' ? 0.24 : 0.62
        });
        var sprite = new THREE.Sprite(material);
        var size = 0.9 + Math.random() * 0.42;
        sprite.scale.set(size, size, 1);
        sprite.position.set(-3.1 + Math.random() * 6.2, -7 + Math.random() * 14, 1.1);
        sprite.renderOrder = 14;
        this.scene.add(sprite);
        this.weatherSprites.push({
            mesh: sprite,
            id: spriteId,
            kind: 'weather',
            drift: (Math.random() - 0.5) * 0.3,
            speed: 0.58 + Math.random() * 0.35,
            baseX: sprite.position.x
        });
    }
};

GameEngine.prototype.updateConditionDecorations = function (delta, worldSpeed) {
    (this.weatherSprites || []).forEach(function (decoration, index) {
        decoration.mesh.position.y += worldSpeed * delta * decoration.speed;
        decoration.mesh.position.x = decoration.baseX + Math.sin(performance.now() * 0.0014 + index) * decoration.drift;
        decoration.mesh.material.rotation += delta * decoration.drift * 0.12;
        if (decoration.mesh.position.y > 8.8) decoration.mesh.position.y = -8.8;
    });
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
        sprite.position.set(this.catX + (Math.random() - 0.5) * 1.2, this.catY + 0.9, 1.4);
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
    this.hanging = false;
    if (this.caughtBranch) {
        this.scene.remove(this.caughtBranch);
        this.caughtBranch.material.dispose();
        this.caughtBranch = null;
    }
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
    var lastEndingCapture = start - 34;
    function finishFrame(now) {
        var elapsed = now - start;
        if (elapsed < 610) {
            self.catMesh.rotation.z += 0.19;
            self.catMesh.scale.multiplyScalar(0.997);
            self.setCatPose(Math.floor(elapsed / 120) % 2 ? 'tumble-a' : 'tumble-b');
        } else if (elapsed < 720) {
            self.setCatPose('soft-landing');
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
            self.endingMesh.position.set(self.catX, self.catY + 0.55, 2.2);
            self.endingMesh.renderOrder = 30;
            self.scene.add(self.endingMesh);
        }

        if (now - lastEndingCapture >= 1000 / 30) {
            lastEndingCapture = now;
            self.captureState(Date.now() - self.runStartTime);
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

GameEngine.prototype.captureReplayTick = function (delta) {
    this.historyCaptureTimer += delta;
    var frameStep = 1 / 30;
    while (this.historyCaptureTimer >= frameStep) {
        this.historyCaptureTimer -= frameStep;
        var scheduledOffset = Date.now() - this.runStartTime - this.historyCaptureTimer * 1000;
        this.captureState(scheduledOffset);
    }
};

GameEngine.prototype.captureState = function (timeOffsetOverride) {
    var timeOffset = Number.isFinite(timeOffsetOverride) ? timeOffsetOverride : Date.now() - this.runStartTime;
    this.history.push({
        timeOffset: timeOffset,
        catX: this.catX,
        catTargetX: this.catTargetX,
        catY: this.catY,
        catPose: this.catPose,
        catRotation: this.catMesh.rotation.z,
        catScale: this.catMesh.scale.x,
        scrollSpeed: this.scrollSpeed,
        score: this.score,
        distance: this.distance,
        lives: this.lives,
        discoveries: this.discoveries,
        timeName: this.timeName,
        timeIndex: this.timeIndex,
        seasonName: this.seasonName,
        seasonIndex: this.seasonIndex,
        weatherName: this.weatherName,
        weatherIndex: this.weatherIndex,
        activeBiome: Object.assign({}, this.activeBiome),
        shieldActive: this.shieldActive,
        boostActive: this.boostActive,
        hanging: this.hanging,
        endingId: this.endingMesh && this.selectedEnding ? this.selectedEnding.id : null,
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
    var cutoff = timeOffset - 10500;
    while (this.history.length > 1 && (this.history[0].timeOffset < cutoff || this.history.length > this.maxHistoryLength)) {
        this.history.shift();
    }
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
    var speedPressure = clamp((this.scrollSpeed - 5.35) / (9.2 - 5.35), 0, 1);
    var targetCatY = this.boostActive ? -3.45 : -1.15 - speedPressure * 1.25;
    if (!this.hanging) this.catY += (targetCatY - this.catY) * Math.min(1, delta * 3.8);
    this.catMesh.position.x = this.catX;
    this.catMesh.position.y = this.catY + Math.sin(performance.now() * 0.008) * 0.08;
    var steerDelta = this.catTargetX - this.catX;
    this.catMesh.rotation.z += ((-steerDelta * 0.055) - this.catMesh.rotation.z) * 0.13;

    if (this.hanging) {
        this.setCatPose('branch-catch');
        this.scrollSpeed = 0;
        if (this.caughtBranch) {
            this.caughtBranch.position.x = this.catX;
            this.caughtBranch.position.y = this.catY + 1.15 + Math.sin(performance.now() * 0.004) * 0.05;
        }
        this.updateConditionDecorations(delta, 0.18);
        this.renderer.render(this.scene, this.camera);
        this.renderHUD();
        this.captureReplayTick(delta);
        return;
    }

    if (Number.isFinite(this.catMomentTimer) && this.catMomentTimer > 0) {
        this.catMomentTimer = Math.max(0, this.catMomentTimer - delta);
    }
    this.blinkTimer -= delta;
    this.sneezeTimer -= delta;
    if (this.catMomentTimer <= 0) {
        if (this.sneezeTimer <= 0 && this.seasonName === 'SUMMER') {
            this.playCatMoment('sneeze', 0.58);
            this.sneezeTimer = 7 + Math.random() * 7;
        } else if (this.blinkTimer <= 0) {
            this.playCatMoment('blink', 0.22);
            this.blinkTimer = 2.8 + Math.random() * 3.8;
        } else if (this.boostActive) {
            this.setCatPose('fast-fall');
        } else if (Math.abs(steerDelta) > 0.25) {
            this.setCatPose(steerDelta < 0 ? 'slide-left' : 'slide-right');
        } else {
            this.setCatPose('slide-neutral');
        }
    }

    if (this.boostActive) {
        this.boostTimer -= delta;
        this.scrollSpeed = 10.2;
        this.boostParticleTimer += delta;
        if (this.boostParticleTimer > 0.14) {
            this.spawnSplash();
            this.boostParticleTimer = 0;
        }
        if (this.boostTimer <= 0) this.boostActive = false;
    } else {
        this.scrollSpeed = Math.min(9.2, 5.35 + this.distance / 78);
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
        this.playCatMoment('victory-wave', 0.82);
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
    var spawnInterval = clamp(0.88 - this.distance / 420, 0.48, 0.88);
    if (this.spawnTimer > spawnInterval) {
        this.spawnEntity();
        this.spawnTimer = 0;
    }

    for (var i = this.entities.length - 1; i >= 0; i--) {
        var entity = this.entities[i];
        entity.mesh.position.y += this.scrollSpeed * delta * 1.08;
        entity.mesh.material.rotation += delta * (entity.isObstacle ? 0.45 : 1.15);
        if (entity.halo) {
            entity.halo.position.x = entity.mesh.position.x;
            entity.halo.position.y = entity.mesh.position.y;
            var pulse = entity.haloSize * (1 + Math.sin(performance.now() * 0.006 + entity.pulseOffset) * 0.055);
            entity.halo.scale.set(pulse, pulse, 1);
            entity.halo.material.rotation = entity.mesh.material.rotation;
        }
        var yDistance = Math.abs(entity.mesh.position.y - this.catMesh.position.y);
        var xDistance = Math.abs(entity.mesh.position.x - this.catMesh.position.x);
        if (entity.isObstacle && entity.mesh.position.y < this.catMesh.position.y && yDistance < 2.6 && xDistance < 0.78 && this.catMomentTimer <= 0) {
            this.playCatMoment('worried', 0.28);
        }
        if (yDistance < 1.02 && xDistance < 0.9 && !entity.gathered) {
            entity.gathered = true;
            this.scene.remove(entity.mesh);
            if (entity.halo) {
                this.scene.remove(entity.halo);
                entity.halo.material.dispose();
            }
            this.entities.splice(i, 1);
            this.resolveEncounter(entity);
            if (this.state !== 'PLAYING') break;
            continue;
        }
        if (entity.mesh.position.y > 9.2) {
            this.scene.remove(entity.mesh);
            if (entity.halo) {
                this.scene.remove(entity.halo);
                entity.halo.material.dispose();
            }
            this.entities.splice(i, 1);
        }
    }

    if (this.mudFactor > 0) {
        this.mudFactor = Math.max(0, this.mudFactor - delta * 0.45);
        document.getElementById('mud-overlay').style.opacity = this.mudFactor;
    }

    this.updateParticles(delta);
    this.updateConditionDecorations(delta, this.scrollSpeed);
    this.renderer.render(this.scene, this.camera);
    this.renderHUD();
    this.captureReplayTick(delta);
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
    ctx.font = "6px 'Press Start 2P'";
    ctx.textAlign = 'right';
    ctx.fillText(this.timeName + ' · ' + this.seasonName + ' · ' + this.weatherName, width - 16, height - 23);
    ctx.textAlign = 'left';
};

ReplayExporter.buildFinalTenSeconds = function (history) {
    var source = (history || []).slice().sort(function (a, b) { return a.timeOffset - b.timeOffset; });
    if (!source.length) return [];
    var frameCount = 300;
    var duration = 10000;
    var endTime = source[source.length - 1].timeOffset;
    var startTime = endTime - duration;
    var frames = [];
    var sourceIndex = 0;

    for (var i = 0; i < frameCount; i++) {
        var targetTime = startTime + (i / (frameCount - 1)) * duration;
        while (sourceIndex < source.length - 1 && source[sourceIndex + 1].timeOffset <= targetTime) sourceIndex++;
        var before = source[sourceIndex];
        var after = source[Math.min(source.length - 1, sourceIndex + 1)];
        var chosen = Math.abs(after.timeOffset - targetTime) < Math.abs(before.timeOffset - targetTime) ? after : before;
        frames.push(chosen);
    }
    return frames;
};

ReplayExporter.chooseRecordingMimeType = function () {
    var candidates = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
    ];
    return candidates.find(function (type) { return MediaRecorder.isTypeSupported(type); }) || null;
};

ReplayExporter.compile = async function (gameEngine) {
    var frames = this.buildFinalTenSeconds(gameEngine.history);
    if (!frames.length) {
        alert('No tumble recorded yet! Play a run first.');
        return;
    }

    showScreen('replay-screen');
    var exportCanvas = document.getElementById('export-canvas');
    exportCanvas.width = 720;
    exportCanvas.height = 1280;
    var ctx = exportCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    var progressBar = document.getElementById('replay-progress-bar');
    var statusText = document.getElementById('replay-status');
    progressBar.style.width = '0%';
    statusText.innerText = 'Preparing final 10 seconds · 720 × 1280 portrait';

    var recordingMime = this.chooseRecordingMimeType();
    if (!recordingMime) {
        statusText.innerText = 'This browser cannot encode a shareable video.';
        return;
    }

    this.drawStateToExportCanvas(ctx, frames[0], gameEngine);
    var replayTimeName = frames[0].timeName || 'MORNING';
    NEKO_MUSIC.start(replayTimeName, true);
    var videoStream = exportCanvas.captureStream(30);
    var audioTracks = SOUND.dest ? SOUND.dest.stream.getAudioTracks() : [];
    var recordingAudioTracks = audioTracks.map(function (track) { return track.clone(); });
    var combinedStream = new MediaStream(videoStream.getVideoTracks().concat(recordingAudioTracks));
    var recorder = new MediaRecorder(combinedStream, {
        mimeType: recordingMime,
        videoBitsPerSecond: 5000000
    });
    var chunks = [];
    recorder.ondataavailable = function (event) {
        if (event.data.size) chunks.push(event.data);
    };
    var stopped = new Promise(function (resolve, reject) {
        recorder.onstop = resolve;
        recorder.onerror = reject;
    });

    var windowStart = frames[0].timeOffset;
    var windowEnd = frames[frames.length - 1].timeOffset;
    var replayEvents = gameEngine.audioEvents.filter(function (event) {
        return event.timeMs >= windowStart && event.timeMs <= windowEnd;
    });
    var audioIndex = 0;
    var frameDuration = 1000 / 30;
    var startedAt = performance.now();
    var frameIndex = 0;
    recorder.start(1000);

    await new Promise(function (resolve) {
        function drawNextFrame() {
            var now = performance.now();
            var targetFrame = Math.min(frames.length - 1, Math.floor((now - startedAt) / frameDuration));
            while (frameIndex <= targetFrame && frameIndex < frames.length) {
                var state = frames[frameIndex];
                if (state.timeName && state.timeName !== replayTimeName) {
                    replayTimeName = state.timeName;
                    NEKO_MUSIC.setTime(replayTimeName, 0.55);
                }
                ReplayExporter.drawStateToExportCanvas(ctx, state, gameEngine);
                while (audioIndex < replayEvents.length && replayEvents[audioIndex].timeMs <= state.timeOffset) {
                    SOUND.playSFX(replayEvents[audioIndex].type);
                    audioIndex++;
                }
                frameIndex++;
            }

            var elapsed = now - startedAt;
            var progress = Math.min(100, Math.floor(elapsed / 100));
            progressBar.style.width = progress + '%';
            statusText.innerText = 'Rendering final 10 seconds · ' + Math.min(10, Math.floor(elapsed / 1000)) + ' / 10';
            if (elapsed >= 10000) {
                if (frameIndex < frames.length) ReplayExporter.drawStateToExportCanvas(ctx, frames[frames.length - 1], gameEngine);
                progressBar.style.width = '100%';
                resolve();
                return;
            }
            setTimeout(drawNextFrame, Math.max(4, frameDuration - ((performance.now() - startedAt) % frameDuration)));
        }
        drawNextFrame();
    });

    NEKO_MUSIC.stop(0.12);
    recorder.stop();
    await stopped;
    combinedStream.getTracks().forEach(function (track) { track.stop(); });
    var blob = new Blob(chunks, { type: recordingMime });
    this.finalizeReplayUI(blob);
};

ReplayExporter.finalizeReplayUI = function (blob) {
    var statusText = document.getElementById('replay-status');
    var videoContainer = document.getElementById('video-container');
    var videoPlayer = document.getElementById('video-player');
    var btnShare = document.getElementById('btn-share-video');
    var btnDownload = document.getElementById('btn-download-video');
    var extension = blob.type.includes('mp4') ? 'mp4' : 'webm';

    if (videoPlayer.dataset.objectUrl) URL.revokeObjectURL(videoPlayer.dataset.objectUrl);
    var videoURL = URL.createObjectURL(blob);
    videoPlayer.dataset.objectUrl = videoURL;
    videoPlayer.src = videoURL;
    videoPlayer.style.aspectRatio = '9 / 16';
    videoContainer.style.display = 'block';
    statusText.innerText = 'Final 10 seconds ready · 720 × 1280 portrait';

    btnShare.disabled = false;
    btnShare.onclick = function () { ReplayExporter.shareVideo(blob); };
    btnDownload.disabled = false;
    btnDownload.onclick = function () {
        var anchor = document.createElement('a');
        anchor.href = videoURL;
        anchor.download = 'nekorogaru-final-10-seconds.' + extension;
        anchor.click();
    };
};

ReplayExporter.shareVideo = function (blob) {
    var extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
    var file = new File([blob], 'nekorogaru-final-10-seconds.' + extension, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
            files: [file],
            title: 'My Neko Rogaru ending!',
            text: 'Nine lives. No brakes. Here are my final ten seconds.'
        }).catch(function () {});
    } else {
        document.getElementById('btn-download-video').click();
    }
};

ReplayExporter.drawStateToExportCanvas = function (ctx, state) {
    ctx.clearRect(0, 0, 720, 1280);
    ctx.fillStyle = '#17130f';
    ctx.fillRect(0, 0, 720, 1280);
    var background = NEKO_IMAGES.backgrounds[state.activeBiome.id];
    var shift = -((state.bgOffset * 80) % 1280);
    if (background?.complete) {
        ctx.drawImage(background, 0, shift, 720, 1280);
        ctx.drawImage(background, 0, shift + 1280, 720, 1280);
    }

    var replayTime = Math.max(0, state.timeIndex || 0) % NEKO_TIMES.length;
    var replayTints = [
        ['screen', 'rgba(255,225,160,.18)'],
        ['screen', 'rgba(255,248,220,.12)'],
        ['soft-light', 'rgba(235,94,56,.24)'],
        ['multiply', 'rgba(32,55,92,.22)']
    ];
    ctx.globalCompositeOperation = replayTints[replayTime][0];
    ctx.fillStyle = replayTints[replayTime][1];
    ctx.fillRect(0, 0, 720, 1280);
    ctx.globalCompositeOperation = 'source-over';

    var replaySeasonIndex = Math.max(0, state.seasonIndex || 0) % NEKO_SEASONS.length;
    var replayWeatherIndex = Math.max(0, state.weatherIndex || 0) % NEKO_WEATHERS.length;
    var replaySeason = NEKO_SEASONS[replaySeasonIndex];
    var replayWeather = replaySeasonIndex === 3 && replayWeatherIndex === 2 ? NEKO_SNOW_WEATHER : NEKO_WEATHERS[replayWeatherIndex];
    replaySeason.sprites.forEach(function (spriteId, index) {
        var decoration = NEKO_IMAGES.weather[spriteId];
        if (!decoration?.complete) return;
        var x = index % 2 ? 564 - (index % 3) * 24 : 46 + (index % 3) * 24;
        var localY = 110 + index * (1060 / Math.max(1, replaySeason.sprites.length - 1));
        var size = /left|right|bank|bamboo|wildflowers|puddle/.test(spriteId) ? 126 : 78;
        ctx.globalAlpha = 0.68;
        ctx.drawImage(decoration, x, shift + localY, size, size);
        ctx.drawImage(decoration, x, shift + 1280 + localY, size, size);
    });
    replayWeather.sprites.forEach(function (spriteId, index) {
        var decoration = NEKO_IMAGES.weather[spriteId];
        if (!decoration?.complete) return;
        var x = 72 + ((index * 197 + state.bgOffset * 11) % 560);
        var y = 150 + ((index * 317 + state.bgOffset * 54) % 920);
        ctx.globalAlpha = spriteId === 'weather-fog' ? 0.28 : 0.58;
        ctx.drawImage(decoration, x, y, 82, 82);
    });
    ctx.globalAlpha = 1;

    state.entities.forEach(function (entity) {
        if (entity.gathered) return;
        var image = NEKO_IMAGES.props[entity.type];
        if (!image?.complete) return;
        var x = 360 + (entity.x / 3.2) * 300;
        var y = ((8 - entity.y) / 16) * 1280;
        var size = entity.type === 'fallen-log' || entity.type === 'bramble' ? 158 : 112;
        ctx.save();
        ctx.shadowColor = entity.isObstacle ? '#ff8f70' : '#fff0a0';
        ctx.shadowBlur = 24;
        ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
        ctx.restore();
        ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
    });

    var catX = 360 + (state.catX / 3.2) * 300;
    var catWorldY = Number.isFinite(state.catY) ? state.catY : -1.15;
    var catY = ((8 - catWorldY) / 16) * 1280;
    if (state.hanging) {
        var branchImage = NEKO_IMAGES.props['springy-branch'];
        if (branchImage?.complete) ctx.drawImage(branchImage, catX - 122, catY - 152, 244, 244);
    }
    if (state.endingId && NEKO_IMAGES.endings[state.endingId]?.complete) {
        ctx.drawImage(NEKO_IMAGES.endings[state.endingId], catX - 150, catY - 150, 300, 300);
    } else {
        var catImage = NEKO_IMAGES.characters[state.catPose] || NEKO_IMAGES.characters['slide-neutral'];
        if (catImage?.complete) {
            ctx.save();
            ctx.translate(catX, catY);
            ctx.rotate(state.catRotation || 0);
            var catSize = 184 * (state.catScale || 1);
            ctx.drawImage(catImage, -catSize / 2, -catSize / 2, catSize, catSize);
            ctx.restore();
        }
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
    ctx.font = "9px 'Press Start 2P'";
    ctx.fillStyle = '#d9f2df';
    ctx.fillText((state.timeName || 'MORNING') + ' · ' + (state.seasonName || 'SPRING') + ' · ' + (state.weatherName || 'CLEAR'), 360, 1248);
};
