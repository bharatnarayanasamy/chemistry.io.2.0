class CollectionBar {

    constructor (scene, x, y)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        this.value = 50;
        this.p = 3;
        this.draw();
        this.width = 300
        this.height = 20;

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

    draw ()
    {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 304, 24);

        //  Health

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 300, 20);
        this.bar.fillStyle(0x000000);


        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 2, this.y + 2, d, 20);
    }

    destroy() {
        this.bar.clear();
    }

}