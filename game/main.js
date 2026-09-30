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
let isDead = false;
let hasWon = false;


function preload() {
    // Load your images
    this.load.image('player', 'assets/player.png');
    this.load.image('ground', 'assets/ground.png');
    
    this.load.image('martini_full', 'assets/martini_full.png');
    this.load.image('martini_empty', 'assets/martini_empty.png');
    
    
    this.load.image('damage_red', 'assets/tequila_damage.png'); // not sure about this one

    // LEVEL BACKGROUNDS
    this.load.image('background1', 'assets/background1.png');
    this.load.image('background2', 'assets/background2.png');
    this.load.image('background3', 'assets/background3.png');
    this.load.image('background4', 'assets/background4.png');

    this.load.image('scrollbar_logo', 'assets/ScrollBarLogo.png');
    this.load.image('scrollbar_logo2', 'assets/ScrollBarLogo2.png');
    this.load.image('scrollbar_logo3', 'assets/ScrollBarLogo3.png');

    // PROJECTILES
    this.load.image('projectile_dinscrollersvag','assets/projektil_dinscrollersvag-removebg-preview.png');
    this.load.image('projectile_duforgrimdsvr','assets/projektil_duforgrimdsvr-removebg-preview.png');
    this.load.image('projectile_optagetbarplads','assets/projektil_optagetbarplads-removebg-preview.png');
    this.load.image('projectile_template','assets/projektil_template-removebg-preview.png');
    
    
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

    // DEATH SEQUENCE
    this.load.audio('lightning', 'assets/lightning.wav');
 
    this.load.image('death1', 'assets/death1.jpg');
    this.load.image('death2', 'assets/death2.jpg');
    this.load.image('death3', 'assets/death3.jpg');

    // VICTORY SEQUENCE
    this.load.image('victory1', 'assets/victory1.jpg');
    this.load.image('victory2', 'assets/victory2.jpg');
    this.load.image('victory3', 'assets/victory3.jpg');

    this.load.audio('victory', 'assets/victory.wav');

    
}

function create() {
    // Play intro sound
    this.sound.play('quote');

   // PARALLAX BACKGROUNDS

    // Main background layer
    this.add.image(400, 200, 'background1').setScrollFactor(0.2).setScale(0.75);
    this.add.image(1200, 200, 'background2').setScrollFactor(0.2).setScale(0.75);
    this.add.image(2000, 200, 'background3').setScrollFactor(0.2).setScale(0.75);
    this.add.image(2800, 200, 'background4').setScrollFactor(0.2).setScale(0.75);

    // ScrollBar logo layer - moves faster than the background
    this.add.image(400, 200, 'scrollbar_logo').setScrollFactor(0.5);
    this.add.image(1600, 200, 'scrollbar_logo2').setScrollFactor(0.5);
    this.add.image(2800, 200, 'scrollbar_logo3').setScrollFactor(0.5);

    // WORLD SIZE
    const WORLD_WIDTH = 8000;

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, 400);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 400);


    // GROUND
    const ground = this.physics.add.staticGroup();

    for (let x = 400; x <= 8000; x += 400) {
    ground.create(x, 380, 'ground');
    }

    // PLAYER
    player = this.physics.add.sprite(100, 200, 'player');
    player.setCollideWorldBounds(true);

    // CAMERA FOLLOW
    this.cameras.main.startFollow(player);

    // PROJECTILES
    this.projectiles = this.physics.add.group({ allowGravity: false });

    this.physics.add.overlap(player, this.projectiles, (player, projectile) => {
    projectile.destroy();
    this.takeDamage();
    }, null, this);

    // HP UI
    this.add.text(
    20,
    40,
    'livsvilje:',
        {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
        }
    )
    .setOrigin(0, 0.5)
    .setScrollFactor(0)
    .setDepth(10);

    hpIcons = [
    this.add.image(135, 40, 'martini_full').setScale(0.7).setScrollFactor(0).setDepth(10),
    this.add.image(175, 40, 'martini_full').setScale(0.7).setScrollFactor(0).setDepth(10),
    this.add.image(215, 40, 'martini_full').setScale(0.7).setScrollFactor(0).setDepth(10)
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

        // RED DAMAGE EFFECT
        const damageEffect = this.add.image(
        player.x,
        player.y,
        'damage_red'
        ).setScale(0.5);

        this.tweens.add({
        targets: damageEffect,
        alpha: 0,
        duration: 400,
        onComplete: () => damageEffect.destroy()
        });

        if (hp === 0) {
        startDeathSequence.call(this);
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

    //WIN CON x >= ____ means the win area
    if (!isDead && !hasWon && player.x >= 7900) {
    startVictorySequence.call(this);
    }

    if (isDead || hasWon) return;
    
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
    
    const projectileTypes = [
    { key: 'projectile_dinscrollersvag', scale: 0.35 },
    { key: 'projectile_duforgrimdsvr', scale: 0.35 },
    { key: 'projectile_optagetbarplads', scale: 0.35 },
    { key: 'projectile_template', scale: 0.45 }
    ];

    if (Phaser.Math.Between(0, 500) === 1) {

    const type = Phaser.Utils.Array.GetRandom(projectileTypes);

    const p = this.projectiles.create(
        player.x + 600,
        Phaser.Math.Between(100, 300),
        type.key
    );

    p.setVelocityX(-250);
    p.setScale(type.scale);
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

    // PLAY SOUND FOR CURRENT JUMP
    const soundKey = 'jump' + jumpCount;
    this.sound.play(soundKey);

    if (jumpCount >= 2) {
        player.setAngularVelocity(200 + jumpCount * 50);
    }
}

function startDeathSequence() {
    if (isDead) return;

    isDead = true;

    // STOP PLAYER
    player.setVelocity(0, 0);
    player.setAcceleration(0, 0);
    player.body.setAllowGravity(false);

    // STOP AND REMOVE PROJECTILES
    this.projectiles.clear(true, true);

    // DARKEN SCREEN
    const darkness = this.add.rectangle(
        400,
        200,
        800,
        400,
        0x000000,
        0.75
    )
    .setScrollFactor(0)
    .setDepth(100);

    // DEATH TEXT
    const deathText = this.add.text(
        400,
        200,
        'JEG BANLYSES TIL\n1000 ÅRS BARLØS ARMOD!',
        {
            fontFamily: 'Arial',
            fontSize: '42px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(101);

    // Wait before lightning
    this.time.delayedCall(2000, () => {

        // LIGHTNING SOUND
        this.sound.play('lightning');

        // LIGHTNING FLASH
        const flash = this.add.rectangle(
            400,
            200,
            800,
            400,
            0xffffff,
            1
        )
        .setScrollFactor(0)
        .setDepth(200);

        // Remove the text at the strike
        deathText.destroy();

        // Quickly fade the flash
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 250,
            onComplete: () => {
                flash.destroy();
            }
        });

        // Start showing death images shortly afterwards
        this.time.delayedCall(500, () => {
            showDeathImages.call(this);
        });
    });
}

function showDeathImages() {
    const images = ['death1', 'death2', 'death3'];
    let index = 0;

    const showNextImage = () => {

        if (index >= images.length) {
            return;
        }

        const image = this.add.image(
            400,
            200,
            images[index]
        )
        .setScrollFactor(0)
        .setDepth(150)
        .setScale(0.4);

        image.setAlpha(0);

        // Fade image in
        this.tweens.add({
            targets: image,
            alpha: 1,
            duration: 300,

            onComplete: () => {

                // IF THIS IS THE FINAL IMAGE
                if (index === images.length - 1) {

                    // Final message
                    const finalText = this.add.text(
                        400,
                        80,
                        'HVORFOR GØRE DET!!!',
                        {
                            fontFamily: 'Arial',
                            fontSize: '42px',
                            color: '#ff0000',
                            stroke: '#000000',
                            strokeThickness: 6
                        }
                    )
                    .setOrigin(0.5)
                    .setScrollFactor(0)
                    .setDepth(200);

                    // SHAKE THE "HVORFOR GØRE DET!!!" TEXT
                    this.tweens.add({
                    targets: finalText,
                    x: { from: 395, to: 405 },
                    duration: 50,
                    yoyo: true,
                    repeat: -1
                    });
                    
                    // TRY AGAIN BUTTON
                    const retryButton = this.add.text(
                        400,
                        340,
                        'BEFRI MIG FRA MIN SKÆBNE',
                        {
                            fontFamily: 'Arial',
                            fontSize: '28px',
                            color: '#ffffff',
                            backgroundColor: '#8b0000',
                            padding: {
                                x: 20,
                                y: 10
                            }
                        }
                    )
                    .setOrigin(0.5)
                    .setScrollFactor(0)
                    .setDepth(200)
                    .setInteractive({ useHandCursor: true });

                    // Restart game when clicked
                    retryButton.on('pointerdown', () => {
                        hp = 3;
                        jumpCount = 0;
                        coyoteTimer = 0;
                        isDead = false;

                        this.scene.restart();
                    });

                    return;
                }

                // Otherwise wait, fade out and show next image
                this.time.delayedCall(1000, () => {

                    this.tweens.add({
                        targets: image,
                        alpha: 0,
                        duration: 300,

                        onComplete: () => {
                            image.destroy();

                            index++;
                            showNextImage();
                        }
                    });
                });
            }
        });
    };

    showNextImage();
}

function startVictorySequence() {
    if (hasWon) return;

    hasWon = true;

    // STOP PLAYER
    player.setVelocity(0, 0);
    player.setAcceleration(0, 0);
    player.body.setAllowGravity(false);
    player.body.enable = false;

    // REMOVE PROJECTILES
    this.projectiles.clear(true, true);

    // PLAY VICTORY SOUND
    this.sound.play('victory');

    // DARKEN BACKGROUND
    this.add.rectangle(
        400,
        200,
        800,
        400,
        0x000000,
        0.8
    )
    .setScrollFactor(0)
    .setDepth(100);

    // VICTORY TEXT
    const victoryText = this.add.text(
        400,
        200,
        'JEG KAN ENDELIGT VÆRE ET RIGTIGT MENNESKE 😤😤😤',
        {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: '#ffff00',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
        wordWrap: {
            width: 700,
            useAdvancedWrap: true
            }
        }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(200);

    // Hold the message for 2 seconds
    this.time.delayedCall(2000, () => {
        victoryText.destroy();

        showVictoryImages.call(this);
    });
}

function showVictoryImages() {
    const images = ['victory1', 'victory2', 'victory3'];

    // Individual scale for each picture
    const scales = [0.1, 0.1, 0.1];

    let index = 0;

    const showNextImage = () => {

        const image = this.add.image(
            400,
            200,
            images[index]
        )
        .setScrollFactor(0)
        .setDepth(150)
        .setScale(scales[index])
        .setAlpha(0);

        // FADE IN
        this.tweens.add({
            targets: image,
            alpha: 1,
            duration: 300,

            onComplete: () => {

                // FINAL IMAGE
                if (index === images.length - 1) {

                    const finalText = this.add.text(
                        400,
                        60,
                        'JEG SVÆLGER MIG I DÅD',
                        {
                            fontFamily: 'Arial',
                            fontSize: '48px',
                            color: '#ffff00',
                            stroke: '#000000',
                            strokeThickness: 7
                        }
                    )
                    .setOrigin(0.5)
                    .setScrollFactor(0)
                    .setDepth(200);

                    return;
                }

                // Show picture for 1.5 seconds
                this.time.delayedCall(1500, () => {

                    this.tweens.add({
                        targets: image,
                        alpha: 0,
                        duration: 300,

                        onComplete: () => {
                            image.destroy();

                            index++;
                            showNextImage();
                        }
                    });
                });
            }
        });
    };

    showNextImage();
}

new Phaser.Game(config);

