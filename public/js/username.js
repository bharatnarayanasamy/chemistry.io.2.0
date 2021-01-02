class UsernameLabel {

    constructor (scene, x, y, text)
    {
        this.label = new Phaser.GameObjects.Text(scene, x, y, text);

        scene.add.existing(this.label);
        scene.physics.world.enableBody(this);
    }
    move(scene, x, y) {
        this.label.x = x;
        this.label.y = y;
    }
}