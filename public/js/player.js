/*
parts that need to be incorporated:
location(x,y)
rotation,
playerID
team
healthbar class
score
*/
class Element extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, rotation, id)
    {
        super(scene, x, y, "hydrogen");

        this.x = x;
        this.y = y;
        this.rotation = rotation
        this.playerID = id
        this.health = 100
        this.bar = new HealthBar(scene, x, y)   
    }

    //if a player gets hit
    takeBulletDamage(damage){
        //change player's healthbar
        this.health -= damage;
        this.bar.decrease(damage);
    }

    //if a player deals damage
    onDealtDamage(){
        //increase score
    }

    healPlayer(){
        this.health += 20;
        this.bar.increase(20);
    }


    movePlayer(){}

    upgrade
    
}
/*
self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'hydrogen')
        self.player.setScale(.25);
        if (playerInfo.team === 'blue') {
            self.player.setTint(0x0000ff);
        } else {
            self.player.setTint(0x00ff00);
        }
        self.player.body.angle = 45;
        self.player.body.setCollideWorldBounds(true);
        self.player.oldPosition = {
            x: self.player.x,
            y: self.player.y,
            rotation: self.player.rotation
        };
        self.hp = new HealthBar(self, playerInfo.x - 50, playerInfo.y - 50);
*/