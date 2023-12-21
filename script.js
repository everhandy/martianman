window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor(){
            // this.keys is an emppty array that stores keydowns when they are pressed and splices them out when the keys are released
            this.keys = [];
            // keydown event
            window.addEventListener('keydown', e =>{
                if((    e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight' )
                        && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
                }
            });
            // keyup event
            window.addEventListener('keyup', e =>{
                if(     e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight'){
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 60;
            this.height = 100;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.speed = 0;
            this.vy = 0;
            this.gravity = 1;
        }
        draw(context){
            // shows hit box for player
            // context.strokeStyle = 'white'
            // context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(input, enemies){
            // collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.width/2 + this.width/2){
                    gameOver = true;
                }
            })

            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.vy -= 20;
            } else {
                this.speed = 0;
            }
            // horizontal player movement
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
            // vertical player movement
            this.y += this.vy;
            if (!this.onGround()){
                this.vy += this.gravity;
            } else {
                this.vy = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height
        }
        onGround(){
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 9000;
            this.height = 720;
            this.speed = 5;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
        update(){
            this.x -= this.speed;
            if(this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 120;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth - this.width;
            this.y = this.gameHeight - this.height;
            this.speed = 6;
            this.markedForDeletion = false;
        }
        draw(context){
            // shows hit boxes for enemy
            // context.strokeStyle = 'white'
            // context.strokeRect(this.x, this.y, this.width, this.height);
            // context.beginPath();
            // context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            this.x-= this.speed;
            if (this.x < 0 - this.width) this.markedForDeletion = true;
        }
    }

    function handleEnemies(deltaTime){
        if (enemyTimer > enemyInterval + randomEnemyInterval){
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update();
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function initializeHighScores() {
        if (!localStorage.getItem('highScores')) {
            localStorage.setItem('highScores', JSON.stringify([]));
        }
    }
    
    function updateHighScores(newScore, initials) {
        let highScores = JSON.parse(localStorage.getItem('highScores'));
        highScores.push({ score: newScore, initials: initials });
        highScores.sort((a, b) => b.score - a.score); // Sort based on score
        highScores = highScores.slice(0, 10); // Keep only top 10 scores
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }   

    function checkHighScore(score) {
        const highScores = JSON.parse(localStorage.getItem('highScores'));
        if (highScores.length < 10 || score > highScores[highScores.length - 1].score) {
            const initials = prompt("Congratulations! Enter your initials for the high score table:");
            if (initials) {
                const formattedInitials = initials.substring(0, 3).toUpperCase(); // Limit to 3 characters and convert to uppercase
                updateHighScores(score, formattedInitials);
            }
        }
    }
    

    function displayHighScores(context) {
        const highScores = JSON.parse(localStorage.getItem('highScores'));
    
        // High Score Table Styling
        const tableWidth = 300;
        const tableHeight = 30 * (highScores.length + 1); 
        const tableX = canvas.width / 2 - tableWidth / 2;
        const tableY = canvas.height / 2 - tableHeight / 2;
        const fontSize = 20;
        const lineHeight = 30; 
        context.fillStyle = 'gray';
        context.fillRect(tableX, tableY, tableWidth, tableHeight);

        // Draw Text (Title and Scores)
        context.font = `${fontSize}px Helvetica`;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        const title = 'High Scores';
        const titleX = canvas.width / 2;
        const titleY = tableY + lineHeight;
        context.fillText(title, titleX, titleY);
        const textWidth = context.measureText(title).width;
        const underlineHeight = titleY + 5; // Adjust as needed
        context.beginPath();
        context.moveTo(titleX - textWidth / 2, underlineHeight);
        context.lineTo(titleX + textWidth / 2, underlineHeight);
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.stroke();
        highScores.forEach((item, index) => {
            context.fillText(
                `#${index + 1}: ${item.initials} - ${item.score}`,
                titleX,
                tableY + lineHeight * (index + 2)
            );
        });
    }

    function displayStatusText(context){
        let roundedScore = Math.round(score);
        context.font = '40px Helvetica';
        context.fillStyle = 'gray';
        context.fillText('Score: ' + roundedScore, 20, 50)
        context.fillStyle = 'white';
        context.fillText('Score: ' + roundedScore, 22, 52)
        if (gameOver){
            //High scores Table
            checkHighScore(Math.round(score));
            displayHighScores(ctx);
            context.textAlign = 'center';
            context.fillStyle = 'gray';
            context.fillText('GAME OVER, try again!', canvas.width/2, 150)
            context.fillStyle = 'white';
            context.fillText('GAME OVER, try again!', canvas.width/2 + 2, 152)
            // Restart button
            drawRestartButton(ctx);
    }

    function drawRestartButton(context) {
        const buttonWidth = 100;
        const buttonHeight = 50;
        const buttonX = canvas.width - buttonWidth - 20;
        const buttonY = 20;
    
        context.fillStyle = 'gray';
        context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
        context.fillStyle = 'white';
        context.font = '20px Helvetica';
        context.textAlign = 'center';
        context.fillText('Restart', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 10);
    }

    function restartGame() {
        location.reload();
    }
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
    
        // Restart Button Bounds
        const buttonX = canvas.width - 100 - 20;
        const buttonY = 20;
        const buttonWidth = 100;
        const buttonHeight = 50;
    
        if (gameOver && 
            clickX > buttonX && clickX < buttonX + buttonWidth &&
            clickY > buttonY && clickY < buttonY + buttonHeight) {
            restartGame();
        }
    });         
}

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 5000 + 1000;
    let scoreRate = .001; //points per millisecond

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        score += deltaTime * scoreRate;
        ctx.clearRect(0,0,canvas.width, canvas.height)
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, enemies);
        handleEnemies(deltaTime);
        initializeHighScores();
        displayStatusText(ctx);
        if (!gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});