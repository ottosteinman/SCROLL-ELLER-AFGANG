const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
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

function preload() {
    // Load your images
    this.load.image('player', 'assets/player.png');
    this.load.image('ground', 'assets/ground.png');

    // Load your funny sound clips
    this.load.audio('quote', 'assets/asbjorn_quote.mp3'); // GOTTA MAKE SOME SWEET CLIPS, A WHOLE LOTTA EM' VOICEWORK TOMORROW LES GOOO - WHOLE LOTTA STUFF TO BE DONE
    this.load.audio('jump', 'assets/jump.wav'); // nogle forskellige ad "HEP, HOOP, HAP, HIP, HUP, HEEH"
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

    this.physics.add.collider(player, ground);

    // Keyboard input
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
        this.sound.play('jump');
    }
}

new Phaser.Game(config);

