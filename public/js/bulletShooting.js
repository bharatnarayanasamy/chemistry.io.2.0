function group2Bullet(bullet, distance, element0, socket0, bulletAngle) {
        this.element = element0;
    
        if (bullet.x > this.element.x && bullet.y > this.element.y) {
            let tempangle = Math.atan((bullet.x - this.element.x) / (bullet.y - this.element.y));
            let tempangle1 = tempangle + 0.2;
            let tempangle2 = tempangle - 0.2;
    
            let x1 = Math.sin(tempangle1) * distance;
            let x2 = Math.sin(tempangle2) * distance;
            let y1 = Math.cos(tempangle1) * distance;
            let y2 = Math.cos(tempangle2) * distance;
    
            socket0.emit('shoot-bullet', { x: this.element.x + x1, y: this.element.y + y1, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
            socket0.emit('shoot-bullet', { x: this.element.x + x2, y: this.element.y + y2, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
        }
        else if (bullet.x > this.element.x && this.element.y > bullet.y) {
            tempangle = Math.atan((this.element.y - bullet.y) / (bullet.x - this.element.x));
            tempangle1 = tempangle + 0.2;
            tempangle2 = tempangle - 0.2;
    
            x1 = Math.cos(tempangle1) * distance;
            x2 = Math.cos(tempangle2) * distance;
            y1 = Math.sin(tempangle1) * distance;
            y2 = Math.sin(tempangle2) * distance;
    
            socket0.emit('shoot-bullet', { x: this.element.x + x1, y: this.element.y - y1, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
            socket0.emit('shoot-bullet', { x: this.element.x + x2, y: this.element.y - y2, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
    
        }
        else if (this.element.x > bullet.x && bullet.y > this.element.y) {
            tempangle = Math.atan((this.element.x - bullet.x) / (bullet.y - this.element.y));
            tempangle1 = tempangle + 0.2;
            tempangle2 = tempangle - 0.2;
    
            x1 = Math.sin(tempangle1) * distance;
            x2 = Math.sin(tempangle2) * distance;
            y1 = Math.cos(tempangle1) * distance;
            y2 = Math.cos(tempangle2) * distance;
    
            socket0.emit('shoot-bullet', { x: this.element.x - x1, y: this.element.y + y1, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
            socket0.emit('shoot-bullet', { x: this.element.x - x2, y: this.element.y + y2, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
        }
        else if (this.element.x > bullet.x && this.element.y > bullet.y) {
            tempangle = Math.atan((this.element.y - bullet.y) / (this.element.x - bullet.x));
            tempangle1 = tempangle + 0.2;
            tempangle2 = tempangle - 0.2;
    
            x1 = Math.cos(tempangle1) * distance;
            x2 = Math.cos(tempangle2) * distance;
            y1 = Math.sin(tempangle1) * distance;
            y2 = Math.sin(tempangle2) * distance;
    
            socket0.emit('shoot-bullet', { x: this.element.x - x1, y: this.element.y - y1, angle: bulletAngle, 
                bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });

            socket0.emit('shoot-bullet', { x: this.element.x - x2, y: this.element.y - y2, angle: bulletAngle, 
                bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
        }
}

function group6Bullet(bullet, element, socket, bulletAngle){
    
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0 });
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle + 0.2,  bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0 });
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle - 0.2, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0 });
    
}

function group4Bullet(bullet, element, socket, bulletAngle){
 
   
    
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0 });
        
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle + 1.571,  bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0 });

    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle - 1.57, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0 });

    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle + 3.14, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0 });
    
}

function actinideBullet(bullet, element, socket, bulletAngle)
{
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: 0, firstBullet: true});
}

function group8Bullet(bullet, element, socket, bulletAngle, rotationAngle)
{
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage/20, atomicNumber: element.atomicNum, rotAngle: rotationAngle});
}

function group5Bullet(bullet, element, socket, bulletAngle, rotationAngle)
{
    socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed,
        damage: bullet.damage, atomicNumber: element.atomicNum, rotAngle: rotationAngle});
}
        