// 3.1 NOTE dont forget to add this file in the index.html file
class Player extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y) {

        super(scene, x, y, "hydrogen");

        //add player to the scene
        scene.add.existing(this);

        //enable physics
        scene.physics.world.enableBody(this);

        //rotating player
        this.angle = 270;
        this.setScale(.25);
    }

    //moves player sprite in response to keystrokes
    movePlayerManager(scene) {
        //reset player velocity
        this.body.setVelocity(0);

        //move right/left
        if (scene.cursorKeys.left.isDown) {
            this.body.setVelocityX(-gameSettings.playerSpeed);
        } else if (scene.cursorKeys.right.isDown) {
            this.body.setVelocityX(gameSettings.playerSpeed);
        }
        //move up/down
        if (scene.cursorKeys.up.isDown) {
            this.body.setVelocityY(-gameSettings.playerSpeed);
        } else if (scene.cursorKeys.down.isDown) {
            this.body.setVelocityY(gameSettings.playerSpeed);
        }
    }

    //rotating player's gun so it faces wherever the cursor is pointing
    pointerMove(scene) {
        var angleToPointer = Phaser.Math.Angle.Between(this.x, this.y, scene.input.activePointer.worldX, scene.input.activePointer.worldY);
        var angleDelta = Phaser.Math.Angle.Wrap(angleToPointer - this.rotation);
        //some fancy math stuff I got from online
        if (Phaser.Math.Within(angleDelta, 0, gameSettings.TOLERANCE)) {
            this.rotation = angleToPointer;
            this.body.setAngularVelocity(0);
        } else {
            this.body.setAngularVelocity(Math.sign(angleDelta) * gameSettings.ROTATION_SPEED_DEGREES);
        }
    }

    //changes the texture of the player to helium
    upgrade() {
        this.setTexture('helium');
    }
}
