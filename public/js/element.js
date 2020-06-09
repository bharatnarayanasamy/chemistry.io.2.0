/*
parts that need to be incorporated:
location(x,y)
rotation,
playerID
team
healthbar class
score
*/

/*Vrishab Notes
Element.js

shoot() 
	-creates new bullet
	-pass the elect of the player class into bullet
    -bullet class takes that element
    bro dis is what i said, yall stay ignoring me

move()
 	-WASD controls

render()
	-Calls the code for drawing the player (not sure if we need this with Phaser’s stuff)


    
Bullet.js

Have a mapping —> some file does rendering for a bullet depending on the element —> call renderBullet & moveBullet

Render bullet() —> has methods for drawing all types of bullets

Movebullet() —> methods for moving all types of bullets


Other stuff
-Use Arrow functions
-Use SVGs

*/


class Element extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, rotation, id, element) {

        super(scene, x, y, "hydrogen");


        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.playerId = id;
        //this.socket = io();

        this.bullet_array = [];

        this.satomicNum = 1;
        this.texture = ["hydrogen", "helium"];
        this.kills = 0;
        this.health = gameSettings.playerHealth;

        //add player to the scene
        scene.add.existing(this);
        scene.physics.world.enableBody(this);

        this.setScale(0.5);
        this.body.setCollideWorldBounds(true);

        /*
        this.hp = new HealthBar(scene, x, y);
        this.score = 0;
        this.element = element;*/

    }



    /*
    //if a player gets hitw
    takeBulletDamage(damage) {
        //change player's healthbar
        this.health -= damage;
        this.bar.decrease(damage);
    }
    
    //if a player deals damage
    onDealtDamage() {
        score += 69;
        //if (player gets a kill) { upgrade }
    }
    
    healPlayer() {
        this.health += 20;
        this.bar.increase(20);
    }
    
    */
    movePlayer(scene) {
        //reset player velocity

        this.body.setVelocity(0);
        //this.hp.body.setVelocity(0);
        //move right or left
        if (scene.input.keyboard.addKey('A').isDown) {
            this.body.setVelocityX(-gameSettings.playerSpeed);
        } else if (scene.input.keyboard.addKey('D').isDown) {
            this.body.setVelocityX(gameSettings.playerSpeed);
        }
        //move up or down
        if (scene.input.keyboard.addKey('W').isDown) {
            this.body.setVelocityY(-gameSettings.playerSpeed);
        } else if (scene.input.keyboard.addKey('S').isDown) {
            this.body.setVelocityY(gameSettings.playerSpeed);
        }
        
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
    shootBullet(scene) {        
        var angle = Phaser.Math.Angle.Between(this.x, this.y, scene.input.activePointer.worldX, scene.input.activePointer.worldY);
        //var angleInDegrees = (angle * (180 / 3.1415)) + 90;

        var x_pos = this.x + 20 * Math.cos(angle);
        var y_pos = this.y + 20 * Math.sin(angle);

        this.bullet = new Bullet(scene, angle, x_pos, y_pos);
        this.bullet_array.push(this.bullet);

        this.bullet.disableBody(true, true);
        
        return this.bullet;
    }

    upgrade(){
        if (this.atomicNum < 3){
            this.setTexture(this.texture[this.atomicNum-1]);
        }
    }

}