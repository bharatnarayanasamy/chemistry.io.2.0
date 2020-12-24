class CollectionBar {

    constructor (scene, x, y, type, value)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        this.value = value;
        this.p = 1.48;
        this.type = type;
        this.width = 150;
        this.height = 15;

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

    increment (scene, value, type)
    {
        this.type = type;
        this.value+=value;
        this.x = window.innerWidth/8; 

        if (this.type == "proton") {
            this.y = 10; 
        }
        else if (this.type == "electron") {
            this.y = 40; 
        }
        else {
            this.y = 70; 
        }
        if (this.value > 100)
        {
            this.value = 100;
        }

        this.draw()
        scene.add.existing(this.bar);
    }

    draw ()
    {
        this.bar.clear();

        //  outline
        this.bar.fillStyle(0xbdbdbd);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        //  fill

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 1, this.y +1, this.width-2, this.height-2);
        if (this.type == "proton") {
            this.bar.fillStyle(0xff5d5d);
        }
        else if (this.type == "electron") {
            this.bar.fillStyle(0x6fc8ff);      
        }
        else {
            this.bar.fillStyle(0x808080);
        }
        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 1, this.y + 1, d, this.height-2);
    }

    destroy() {
        this.bar.clear();
    }

}

