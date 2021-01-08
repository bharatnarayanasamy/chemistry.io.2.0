function group1Bullet(gamejs, bullet, element, socket, bulletAngle) {


    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);

    let damage = bullet.damage * (1 + gameSettings.group1.indexOf(element.atomicNum) * .1);

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function group2Bullet(gamejs, bullet, distance, element, socket, bulletAngle) {



    let tempangle1 = bulletAngle + 0.35;
    let tempangle2 = bulletAngle - 0.35;

    let x1 = Math.cos(tempangle1) * distance;
    let x2 = Math.cos(tempangle2) * distance;
    let y1 = Math.sin(tempangle1) * distance;
    let y2 = Math.sin(tempangle2) * distance;


    let pushbullet0 = new Bullet(gamejs, bulletAngle, element.x + x1, element.y + y1, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
    let pushbullet1 = new Bullet(gamejs, bulletAngle, element.x + x2, element.y + y2, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);

    pushbullet0.owner_id = socket.id;
    pushbullet0.actualX = pushbullet0.x;
    pushbullet0.actualY = pushbullet0.y;

    pushbullet1.owner_id = socket.id;
    pushbullet1.actualX = pushbullet1.x;
    pushbullet1.actualY = pushbullet1.y;

    element.bullet_array.push(pushbullet0);
    element.bullet_array.push(pushbullet1);

    bullet.damage *= 0.67;
    let damage = bullet.damage * (1 + gameSettings.group2.indexOf(element.atomicNum) * .1);

    socket.emit('shoot-bullet', {
        x: element.x + x1, y: element.y + y1, angle: bulletAngle,
        bulletSpeed: gameSettings.bulletSpeed, damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

    socket.emit('shoot-bullet', {
        x: element.x + x2, y: element.y + y2, angle: bulletAngle,
        bulletSpeed: gameSettings.bulletSpeed, damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
    });

}

function group3Bullet(gamejs, bullet, element, socket, bulletAngle) {

    let angles = [0, 1.5708, -1.5708, 3.14159265359, .7854, 2.3562, -.7854, -2.3562];

    bullet.damage *= 0.5;
    let damage = bullet.damage * (1 + gameSettings.group3.indexOf(element.atomicNum) * .1);
    console.log(damage);

    for (let i = 0; i < angles.length; i++) {
        let pushbullet = new Bullet(gamejs, bulletAngle + angles[i], element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
        pushbullet.owner_id = socket.id;
        pushbullet.actualX = pushbullet.x;
        pushbullet.actualY = pushbullet.y;
        element.bullet_array.push(pushbullet);
        socket.emit('shoot-bullet', {
            x: bullet.x, y: bullet.y, angle: bulletAngle + angles[i], bulletSpeed: gameSettings.bulletSpeed,
            damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
        });
    }
}



function group4Bullet(gamejs, bullet, element, socket, bulletAngle) {

    let angles = [0, 1.5708, -1.5708, 3.14159265359];

    bullet.damage *= 0.9;
    let damage = bullet.damage * (1 + gameSettings.group4.indexOf(element.atomicNum) * .1);
    console.log(damage);

    for (let i = 0; i < angles.length; i++) {
        let pushbullet = new Bullet(gamejs, bulletAngle + angles[i], element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
        pushbullet.owner_id = socket.id;
        pushbullet.actualX = pushbullet.x;
        pushbullet.actualY = pushbullet.y;
        element.bullet_array.push(pushbullet);
        socket.emit('shoot-bullet', {
            x: bullet.x, y: bullet.y, angle: bulletAngle + angles[i], bulletSpeed: gameSettings.bulletSpeed,
            damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
        });
    }
 
}

function group5Bullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    pushbullet.isFive = true;

    element.bullet_array.push(pushbullet);

    bullet.damage *= 1.1;
    
    let damage = bullet.damage * (1 + gameSettings.group5.indexOf(element.atomicNum) * 0.3);

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0, acc: true
    });

}

function group6Bullet(gamejs, bullet, element, socket, bulletAngle) {

    let angles = [0, 0.2, -0.2];

    bullet.damage *= 0.75;
    let damage = bullet.damage * (1 + gameSettings.group6.indexOf(element.atomicNum) * 0.1);
    console.log(damage);

    for (let i = 0; i < angles.length; i++) {
        let pushbullet = new Bullet(gamejs, bulletAngle + angles[i], element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
        pushbullet.owner_id = socket.id;
        pushbullet.actualX = pushbullet.x;
        pushbullet.actualY = pushbullet.y;
        element.bullet_array.push(pushbullet);
        socket.emit('shoot-bullet', {
            x: bullet.x, y: bullet.y, angle: bulletAngle + angles[i], bulletSpeed: gameSettings.bulletSpeed,
            damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
        });
    }
}

function group7Bullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet1 = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
    pushbullet1.owner_id = socket.id;
    pushbullet1.actualX = pushbullet1.x;
    pushbullet1.actualY = pushbullet1.y;

    pushbullet1.isSeven = true;
    pushbullet1.count = 0;

    element.bullet_array.push(pushbullet1);
    
    bullet.damage /= 20;
    let damage = bullet.damage * (1 + gameSettings.group7.indexOf(element.atomicNum) * .1);

    //DAMAGE DRAMATICALLY LOWERED FOR TESTING
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
    
}

function group8Bullet(gamejs, bullet, element, socket, bulletAngle, rotationAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    //pushbullet.isEight = true;

    element.bullet_array.push(pushbullet);
    //console.log(element.bullet_array[bullet_array.length - 1].increment);

    bullet.damage /= 20;
    let damage = bullet.damage * (1 + gameSettings.group8.indexOf(element.atomicNum) * .1);

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: damage, atomicNumber: element.atomicNum, rotAngle: rotationAngle - 1.571
    });
}

function transitionMetalBullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1], gameSettings.bulletSpeed);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);

    bullet.damage *= 2;
    let damage = bullet.damage * (1 + gameSettings.transitionmetals.indexOf(element.atomicNum) * .03);

    //increase damage, decrease velocity
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed / 1.5,
        damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function lanthanideBullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    element.bullet_array.push(pushbullet);
    //increase damage, decrease velocity

    bullet.damage *= 2.5;
    let damage = bullet.damage * (1 + gameSettings.transitionmetals.indexOf(element.atomicNum) * .1);

    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, bulletSpeed: gameSettings.bulletSpeed * 2,
        damage: damage, atomicNumber: element.atomicNum, rotAngle: 0
    });
}

function actinideBullet(gamejs, bullet, element, socket, bulletAngle) {

    let pushbullet = new Bullet(gamejs, bulletAngle, element.x, element.y, gameSettings.texture[element.atomicNum - 1]);
    pushbullet.owner_id = socket.id;
    pushbullet.actualX = pushbullet.x;
    pushbullet.actualY = pushbullet.y;

    let damage = bullet.damage * (1 + gameSettings.transitionmetals.indexOf(element.atomicNum) * .1);

    element.bullet_array.push(pushbullet);
    socket.emit('shoot-bullet', {
        x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: damage, atomicNumber: element.atomicNum, rotAngle: 0, firstBullet: true
    });
}