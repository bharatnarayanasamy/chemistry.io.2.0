class CollectionBar {

    constructor (scene, x, y, type, value)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        this.value = value;
        this.p = 3;
        this.type = type;
        this.width = 300;
        this.height = 20;

        this.draw();

        scene.add.existing(this.bar);
        scene.physics.world.enableBody(this);
    }

    set (value)
    {
        this.value = value;

        if (this.value < 0)
        {
            this.value = 0;
        }
        this.draw();

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
    
    move(scene, x, y) {
        this.x = x;
        this.y = y;
        this.draw();
        scene.add.existing(this.bar);

    }

    draw ()
    {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 304, 24);

        //  Health

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 300, 20);
        if (this.type == "proton") {
            this.bar.fillStyle(0xff0000);
        }
        else if (this.type == "electron") {
            this.bar.fillStyle(0xffc0cb);      
        }
        else {
            this.bar.fillStyle(0x808080);
        }
        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 2, this.y + 2, d, 20);
    }

    destroy() {
        this.bar.clear();
    }

}

