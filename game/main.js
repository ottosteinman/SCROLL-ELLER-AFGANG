const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let player;
let cursors;
let jumpCount = 0;
let maxJumps = 5;
let coyoteTimer = 0;


function preload() {
    // Load your images
    this.load.image('player', 'assets/player.png');
    this.load.image('ground', 'assets/ground.png');

    // Load your funny sound clips
    this.load.audio('quote', 'assets/asbjorn_quote.mp3'); // GOTTA MAKE SOME SWEET CLIPS, A WHOLE LOTTA EM' VOICEWORK TOMORROW LES GOOO - WHOLE LOTTA STUFF TO BE DONE
    this.load.audio('jump1', 'assets/jump1.wav'); // nogle forskellige ad "HEP, HOOP, HAP, HIP, HUP, HEEH"
    this.load.audio('jump2', 'assets/jump2.wav'); // HOP
    this.load.audio('jump3', 'assets/jump3.wav'); // HAP
    this.load.audio('jump4', 'assets/jump4.wav'); // HIP
    this.load.audio('jump5', 'assets/jump5.wav'); // IDI NAHUI - hvad var den russiske ting? 
}

function create() {
    // Play your intro sound
    this.sound.play('quote');

    // Add ground
    const ground = this.physics.add.staticGroup();
    ground.create(400, 380, 'ground');

    // Add player
    player = this.physics.add.sprite(100, 200, 'player');
    player.setCollideWorldBounds(true);

    // Movement settings
    player.setMaxVelocity(250, 500);
    player.setDragX(800);
    player.setAccelerationX(0);

    
    this.physics.add.collider(player, ground);

    // Keyboard input
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // SNAPPY MOVEMENT
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    // COYOTE TIME + RESET ON LAND
    if (player.body.touching.down) {
        jumpCount = 0;
        coyoteTimer = 100;
        player.setAngularVelocity(0);
        player.angle = 0;
    } else {
        coyoteTimer -= this.game.loop.delta;
    }

    // TAP-BASED JUMP
    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        tryJump.call(this);
    }
}

function tryJump() {
    const canJump =
        player.body.touching.down ||
        coyoteTimer > 0 ||
        jumpCount < maxJumps;

    if (!canJump) return;

    player.setVelocityY(-330);

    jumpCount++;
    coyoteTimer = 0;

    const soundKey = 'jump' + jumpCount;
    if (this.sound.get(soundKey)) {
        this.sound.play(soundKey);
    } else {
        this.sound.play('jump1');
    }

    if (jumpCount >= 2) {
        player.setAngularVelocity(200 + jumpCount * 50);
    }
}



new Phaser.Game(config);

