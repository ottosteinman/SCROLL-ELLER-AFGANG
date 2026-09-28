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
let hp = 3;
let hpIcons = [];



function preload() {
    // Load your images
    this.load.image('player', 'assets/player.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('martini_full', 'assets/martini_full.png');
    this.load.image('martini_empty', 'assets/martini_empty.png');
    this.load.image('scrollbar_logo', 'assets/ScrollBarLogo.png');
    this.load.image('afvist', 'assets/ansogningafvist.png');
    this.load.image('tequila_damage', 'assets/tequila_damage.png'); // not sure about this one




    // Load your funny sound clips
    this.load.audio('quote', 'assets/asbjorn_quote.mp3'); // GOTTA MAKE SOME SWEET CLIPS, A WHOLE LOTTA EM' VOICEWORK TOMORROW LES GOOO - WHOLE LOTTA STUFF TO BE DONE
    this.load.audio('jump1', 'assets/jump1.wav'); // nogle forskellige ad "HEP, HOOP, HAP, HIP, HUP, HEEH"
    this.load.audio('jump2', 'assets/jump2.wav'); // HOP
    this.load.audio('jump3', 'assets/jump3.wav'); // HAP
    this.load.audio('jump4', 'assets/jump4.wav'); // HIP
    this.load.audio('jump5', 'assets/jump5.wav'); // IDI NAHUI - hvad var den russiske ting?
    this.load.audio('dmg1', 'assets/dmg1.wav'); // AV FOR SATAN
    this.load.audio('dmg2', 'assets/dmg2.wav'); // HVORFOR GØRE DET
    this.load.audio('dmg3', 'assets/dmg3.wav'); // AAAAAAAAAAAAAAAAAAAAAAA

}

function create() {
    // Play intro sound
    this.sound.play('quote');

    // PARALLAX BACKGROUND
    const bgFar = this.add.image(400, 200, 'background').setScrollFactor(0.2);
    const bgLogo = this.add.image(400, 200, 'scrollbar_logo').setScrollFactor(0.5);

    // WORLD SIZE
    this.physics.world.setBounds(0, 0, 2000, 400);
    this.cameras.main.setBounds(0, 0, 2000, 400);

    // GROUND
    const ground = this.physics.add.staticGroup();
    ground.create(400, 380, 'ground');
    ground.create(800, 380, 'ground');
    ground.create(1200, 380, 'ground');
    ground.create(1600, 380, 'ground');

    // PLAYER
    player = this.physics.add.sprite(100, 200, 'player');
    player.setCollideWorldBounds(true);

    // CAMERA FOLLOW
    this.cameras.main.startFollow(player);

    // PROJECTILES
    this.projectiles = this.physics.add.group({ allowGravity: false });

    this.physics.add.overlap(player, this.projectiles, () => {
        this.takeDamage();
    }, null, this);

    // HP UI
    hpIcons = [
        this.add.image(50, 40, 'martini_full').setScrollFactor(0),
        this.add.image(100, 40, 'martini_full').setScrollFactor(0),
        this.add.image(150, 40, 'martini_full').setScrollFactor(0)
    ];

    // DAMAGE LOGIC
    this.takeDamage = () => {
        if (hp <= 0) return;

        hp--;
        hpIcons[hp].setTexture('martini_empty');

        // RANDOM DAMAGE SOUND
        const dmgSounds = ['dmg1', 'dmg2', 'dmg3'];
        const randomKey = Phaser.Utils.Array.GetRandom(dmgSounds);
        this.sound.play(randomKey);

        // TEQUILA SPLASH (make sure you load this!)
        const splash = this.add.image(player.x, player.y - 50, 'tequila_damage').setScrollFactor(0);
        this.tweens.add({
            targets: splash,
            alpha: 0,
            duration: 400,
            onComplete: () => splash.destroy()
        });

        if (hp === 0) {
            console.log("You died!");
        }
    };

    // MOVEMENT SETTINGS
    player.setMaxVelocity(250, 500);
    player.setDragX(800);
    player.setAccelerationX(0);

    this.physics.add.collider(player, ground);

    // INPUT
    cursors = this.input.keyboard.createCursorKeys();
    this.damageKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
}


function update() {
    // MOVEMENT
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    // COYOTE TIME
    if (player.body.touching.down) {
        jumpCount = 0;
        coyoteTimer = 100;
        player.setAngularVelocity(0);
        player.angle = 0;
    } else {
        coyoteTimer -= this.game.loop.delta;
    }

    // JUMP
    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        tryJump.call(this);
    }

    // SELF DAMAGE
    if (Phaser.Input.Keyboard.JustDown(this.damageKey)) {
        this.takeDamage();
    }

    // PROJECTILE SPAWN
    if (Phaser.Math.Between(0, 100) === 1) {
        const p = this.projectiles.create(player.x + 600, Phaser.Math.Between(100, 300), 'afvist');
        p.setVelocityX(-250);
        p.setScale(0.7);
    }

    // PROJECTILE CLEANUP
    this.projectiles.children.iterate(p => {
        if (p && p.x < player.x - 800) {
            p.destroy();
        }
    });
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

