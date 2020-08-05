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
    constructor(scene, x, y, rotation, id, textureCons) {

        super(scene, x, y, textureCons);

        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.playerId = id;
        //this.socket = io();

        this.bullet_array = [];

        this.atomicNum = 1;

        this.texture1 = gameSettings.texture;

        this.kills = 0;
        this.health = gameSettings.playerHealth;

        //add player to the scene
        scene.add.existing(this);
        scene.physics.world.enableBody(this);

        this.body.setCollideWorldBounds(true);

        this.hp = new HealthBar(scene, x - 50, y + 70);

        this.lastHurt = 0;
        this.gs1 = 0;//{ x: this.x, y: this.y, rot: this.rotation };
        this.gs2 = 0;//{ x: this.x, y: this.y, rot: this.rotation };
        this.diff = {x: 0, y: 0, rot: 0};
        this.firstEntityInterpolation = false;
        this.counter = 0;
    }



    /*
    //if a player gets hit
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
    movePlayer(scene, speed, isHitByTransitionBullet, speedX, speedY, bulletAngle) {
        //reset player velocity
        let currentSpeedX0 = 0;
        let currentSpeedY0 = 0;
        var bool = false;
        this.body.setVelocity(0);
        //this.hp.body.setVelocity(0);
        //move right or left
        
        //ORDER =          W/s   a/D
        //w and d are 1, s and a are -1
        let command_arr = [0, 0, 0]; 

        if (!isHitByTransitionBullet) {
            //no knockback
            if (scene.input.keyboard.addKey('A').isDown) {
                /*this.body.setVelocityX(-speed);
                bool = true;*/
                command_arr[1] = -1;
            } 
            else if (scene.input.keyboard.addKey('D').isDown) {
                /*this.body.setVelocityX(speed);*/
                command_arr[1] = 1;

            }

            //move up or down
            if (scene.input.keyboard.addKey('W').isDown) {
                /*this.body.setVelocityY(-speed);
                bool = true;
                currentSpeedY0 = -speed;*/

                command_arr[0] = -1;

            } else if (scene.input.keyboard.addKey('S').isDown) {
                // this.body.setVelocityY(speed);
                // bool = true;
                // currentSpeedY0 = speed;
                command_arr[0] = 1;
            }
            //"fuck the healthbar" - Chris, July 31, 2020
            this.hp.move(scene, this.body.x + 40, this.body.y + 120);
            this.x += gameSettings.playerSpeed / 60 * command_arr[1];
            this.y += gameSettings.playerSpeed / 60 * command_arr[0];
        }
        else {
            //knockback
            this.body.setVelocityX(speedX*2);
            this.body.setVelocityY(speedY*2);
            this.hp.move(scene, this.body.x + 40, this.body.y + 120);

        }

        let angleToPointer = Phaser.Math.Angle.Between(this.x, this.y, scene.input.activePointer.worldX, scene.input.activePointer.worldY);
        let angleDelta = Phaser.Math.Angle.Wrap(angleToPointer - this.rotation);
        this.rotation = angleToPointer;

        //some fancy math stuff I got from online
        /*if (Phaser.Math.Within(angleDelta, 0, gameSettings.TOLERANCE)) {
            
            this.body.setAngularVelocity(0);
        } 
        else {
            this.body.setAngularVelocity(Math.sign(angleDelta) * gameSettings.ROTATION_SPEED_DEGREES);
        }*/
        command_arr[2] = angleToPointer;
        //var data = {
            //currentSpeedX: currentSpeedX0, 
            //currentSpeedY: currentSpeedY0,
             
        //}
        return command_arr;

        
    }
    shootBullet(scene) {

        let angle = Phaser.Math.Angle.Between(this.x, this.y, scene.input.activePointer.worldX, scene.input.activePointer.worldY);
        //let angleInDegrees = (angle * (180 / 3.1415)) + 90;

        let x_pos = this.x + 20 * Math.cos(angle);
        let y_pos = this.y + 20 * Math.sin(angle);

        this.bullet = new Bullet(scene, angle, x_pos, y_pos);
        this.bullet_array.push(this.bullet);

        this.bullet.disableBody(true, true);

        return this.bullet;
    }

    upgrade() {

        let text = gameSettings.texture;
        if (this.atomicNum < texLen + 1) {
            this.setTexture(text[this.atomicNum - 1]);
        }
    }

}