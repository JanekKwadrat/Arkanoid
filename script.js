//the canvas
const canvas = document.getElementById("canvas");
let canvas_w = 600;
let canvas_h = 600;

//game elements
let myball;
let mypad;
let myboxes;

//game going?
let loop;
let going;

//flags
let score;
let gameover;
let win;

function manageKeyDown(event)
{
	mypad.manageKeyDown(event);
}
function manageKeyUp(event)
{
	mypad.manageKeyUp(event);
}

function start()
{
	if (!gameover && !win)
	{
		going = true;
		document.addEventListener('keydown', manageKeyDown);
		document.addEventListener('keyup', manageKeyUp);
		loop = setInterval(function()
		{
			let score_increment = 0;
			for (let i = 0; i < 4; i++)
			{
				//may be order-sensitive!!!
				if (myball.update(1)) gameover = true;
				mypad.update(1);
				
				collisionPadBall(mypad, myball);
				
				score_increment += myboxes.length;
				myboxes = collisionBoxesBall(myboxes, myball);
				score_increment -= myboxes.length;
			}
			
			score += score_increment;
			
			if (score == 16) win = true;
			
			if (gameover || win)
			{
				if (gameover) document.getElementById('score').innerHTML = 'Game over';
				else document.getElementById('score').innerHTML = 'You won!';
				pause();
			}
			else document.getElementById('score').innerHTML = 'Score: ' + score;
			
			myball.draft();
			mypad.draft();
			for (let i = 0; i < myboxes.length; i++) myboxes[i].draft();
		}, 4);
		document.getElementById('start').innerHTML = 'Pause';
	}
}

function pause()
{
	going = false;
	document.removeEventListener('keydown', manageKeyDown);
	document.removeEventListener('keyup', manageKeyUp);
	mypad.v_x = 0;
	clearInterval(loop);
	document.getElementById('start').innerHTML = 'Start';
}

function startpause()
{
	if (!going) start();
	else pause();
}

function reset()
{
	if (going) pause();
	canvas.innerHTML = '';
	myball = new Ball(canvas, 300, 530, 10, canvas_w, canvas_h);
	mypad = new Pad(canvas, 300, 555, 120, 30, canvas_w);
	
	myboxes = [];
	for (let i = 0; i < 8; i++) myboxes[i] = new Box(canvas, 55 + i * 70, 200, 60, 60);
	for (let i = 0; i < 8; i++) myboxes[i + 8] = new Box(canvas, 55 + i * 70, 130, 60, 60);
	
	loop = false;
	going = false;
	
	score = 0;
	document.getElementById('score').innerHTML = 'Score: 0';
	gameover = false;
	win = false;
}

reset();
document.getElementById('newgame').addEventListener('click', reset);
document.getElementById('start').addEventListener('click', startpause);