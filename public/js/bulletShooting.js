function group1Bullet(gamejs, bullet, element, socket, bulletAngle) {


    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);


    
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

}

function group2Bullet(gamejs, bullet, distance, element, socket, bulletAngle) {

    bullet.damage /= 1.5;

    let tempangle1 = bulletAngle + 0.35;
    let tempangle2 = bulletAngle - 0.35;

    let x1 = Math.cos(tempangle1) * distance;
    let x2 = Math.cos(tempangle2) * distance;
    let y1 = Math.sin(tempangle1) * distance;
    let y2 = Math.sin(tempangle2) * distance;


    let pushbullet0 = new Bullet(gamejs, bulletAngle, element.x + x1, element.y + y1, gameSettings.texture[element.atomicNum - 1]);
    let pushbullet1 = new Bullet(gamejs, bulletAngle, element.x + x2, element.y + y2, gameSettings.texture[element.atomicNum - 1]);

    pushbullet0.owner_id = socket.id;
    pushbullet0.actualX = pushbullet0.x;
    pushbullet0.actualY = pushbullet0.y;

    pushbullet1.owner_id = socket.id;
    pushbullet1.actualX = pushbullet1.x;
    pushbullet1.actualY = pushbullet1.y;

    element.bullet_array.push(pushbullet0);
    element.bullet_array.push(pushbullet1);

    socket.emit('shoot-bullet', {
        x: element.x + x1, y: element.y + y1, angle: bulletAngle,
        bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: element.x + x2, y: element.y + y2, angle: bulletAngle,
        bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

}

function group3Bullet(gamejs, bullet, element, socket, bulletAngle) {


    let pushbullet1 = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet1.owner_id = socket.id;
    pushbullet1.actualX = pushbullet1.x;
    pushbullet1.actualY = pushbullet1.y;

    let pushbullet2 = new Bullet(gamejs, bulletAngle + 1.5708, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet2.owner_id = socket.id;
    pushbullet2.actualX = pushbullet2.x;
    pushbullet2.actualY = pushbullet2.y;

    let pushbullet3 = new Bullet(gamejs, bulletAngle - 1.5708, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet3.owner_id = socket.id;
    pushbullet3.actualX = pushbullet3.x;
    pushbullet3.actualY = pushbullet3.y;

    let pushbullet4 = new Bullet(gamejs, bulletAngle + 3.1416, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet4.owner_id = socket.id;
    pushbullet4.actualX = pushbullet4.x;
    pushbullet4.actualY = pushbullet4.y;

    let pushbullet5 = new Bullet(gamejs, bulletAngle + 0.7854, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet5.owner_id = socket.id;
    pushbullet5.actualX = pushbullet5.x;
    pushbullet5.actualY = pushbullet5.y;

    let pushbullet6 = new Bullet(gamejs, bulletAngle + 2.3562, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet6.owner_id = socket.id;
    pushbullet6.actualX = pushbullet6.x;
    pushbullet6.actualY = pushbullet6.y;

    let pushbullet7 = new Bullet(gamejs, bulletAngle - 0.7854, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet7.owner_id = socket.id;
    pushbullet7.actualX = pushbullet7.x;
    pushbullet7.actualY = pushbullet7.y;

    let pushbullet8 = new Bullet(gamejs, bulletAngle - 2.3562, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet8.owner_id = socket.id;
    pushbullet8.actualX = pushbullet8.x;
    pushbullet8.actualY = pushbullet8.y;


    element.bullet_array.push(pushbullet1);
    element.bullet_array.push(pushbullet2);
    element.bullet_array.push(pushbullet3);
    element.bullet_array.push(pushbullet4);
    element.bullet_array.push(pushbullet5);
    element.bullet_array.push(pushbullet6);
    element.bullet_array.push(pushbullet7);
    element.bullet_array.push(pushbullet8);

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 1.5708, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle - 1.5708, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 3.1416, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 0.7854, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 2.3562, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle - 0.7854, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle - 2.3562, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function group4Bullet(gamejs, bullet, element, socket, bulletAngle) {


    let pushbullet0 = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet0.owner_id = socket.id;
    pushbullet0.actualX = pushbullet0.x;
    pushbullet0.actualY = pushbullet0.y;


    let pushbullet1 = new Bullet(gamejs, bulletAngle + 1.571, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet1.owner_id = socket.id;
    pushbullet1.actualX = pushbullet1.x;
    pushbullet1.actualY = pushbullet1.y;


    let pushbullet2= new Bullet(gamejs, bulletAngle - 1.571, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet2.owner_id = socket.id;
    pushbullet2.actualX = pushbullet2.x;
    pushbullet2.actualY = pushbullet2.y;

    
    let pushbullet3 = new Bullet(gamejs, bulletAngle + 3.14, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet3.owner_id = socket.id;
    pushbullet3.actualX = pushbullet3.x;
    pushbullet3.actualY = pushbullet3.y;

    element.bullet_array.push(pushbullet0);
    element.bullet_array.push(pushbullet1);
    element.bullet_array.push(pushbullet2);
    element.bullet_array.push(pushbullet3);

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 1.571, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle - 1.571, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 3.14, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function group5Bullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);
    
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0, acc: true
    });

}

function group6Bullet(gamejs, bullet, element, socket, bulletAngle) {


    let pushbullet1 = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet1.owner_id = socket.id;
    pushbullet1.actualX = pushbullet1.x;
    pushbullet1.actualY = pushbullet1.y;

    let pushbullet2 = new Bullet(gamejs, bulletAngle + 0.2, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet2.owner_id = socket.id;
    pushbullet2.actualX = pushbullet2.x;
    pushbullet2.actualY = pushbullet2.y;

    let pushbullet3 = new Bullet(gamejs, bulletAngle - 0.2, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet3.owner_id = socket.id;
    pushbullet3.actualX = pushbullet3.x;
    pushbullet3.actualY = pushbullet3.y;

    element.bullet_array.push(pushbullet1);
    element.bullet_array.push(pushbullet2);
    element.bullet_array.push(pushbullet3);

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 0.2, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle - 0.2, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

}

function group7Bullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet1 = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet1.owner_id = socket.id;
    pushbullet1.actualX = pushbullet1.x;
    pushbullet1.actualY = pushbullet1.y;

    let pushbullet2 = new Bullet(gamejs, bulletAngle + 0.2, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet2.owner_id = socket.id;
    pushbullet2.actualX = pushbullet2.x;
    pushbullet2.actualY = pushbullet2.y;

    let pushbullet3 = new Bullet(gamejs, bulletAngle - 0.2, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet3.owner_id = socket.id;
    pushbullet3.actualX = pushbullet3.x;
    pushbullet3.actualY = pushbullet3.y;

    element.bullet_array.push(pushbullet1);
    element.bullet_array.push(pushbullet2);
    element.bullet_array.push(pushbullet3);
    
    //DAMAGE DRAMATICALLY LOWERED FOR TESTING
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage / 20, atomicNumber: element.atomicNum, rotAngle: 0
    });
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle + 0.2, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage / 20, atomicNumber: element.atomicNum, rotAngle: 0
    });
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle - 0.2, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage / 20, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function group8Bullet(gamejs, bullet, element, socket, bulletAngle, rotationAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);


    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage / 20, atomicNumber: element.atomicNum, rotAngle: rotationAngle - 1.571
    });
}

function transitionMetalBullet(gamejs, bullet, element, socket, bulletAngle) {


    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);

    //increase damage, decrease velocity
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed / 1.5,
        damage: bullet.damage * 2, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function lanthanideBullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);
    //increase damage, decrease velocity
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, bulletSpeed: gameSettings.bulletSpeed * 2,
        damage: bullet.damage * 2.5, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function actinideBullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0, firstBullet: true
    });
}