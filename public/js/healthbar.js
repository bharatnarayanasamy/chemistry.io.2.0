  class HealthBar {

    constructor (scene, x, y)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        this.value = 100;
        this.p = 76 / 100;
        this.draw();

        scene.add.existing(this.bar);
        scene.physics.world.enableBody(this);
    }


    move(scene, x, y) {
        this.x = x;
        this.y = y;
        this.draw();
        scene.add.existing(this.bar);
    }

    set (value)
    {
        this.value = value;

        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();
        //scene.add.existing(this.bar);
    }

    increment (value)
    {
        this.value+=value;

        if (this.value > 100)
        {
            this.value = 100;
        }

        this.draw();

    }

    draw ()
    {
        this.bar.clear();

        //  BG (Not in use anymore for new healthbar)
        //this.bar.fillStyle(0x454545);
        //this.bar.fillRect(this.x - 27, this.y - 28, 80, 8);

        //  Health

        this.bar.fillStyle(0xC4C4C4);
        this.bar.fillRect(this.x - 25, this.y -26 , 76, 4);

        if (this.value < 30)
        {
            this.bar.fillStyle(0xFF8686);
        }
        else
        {
            this.bar.fillStyle(0x58FF8B);
        }

        let d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x -25 , this.y - 26, d, 4);
    }

    destroy() {
        this.bar.clear();
    }

    getX()
    {
        return this.x;
    }

}