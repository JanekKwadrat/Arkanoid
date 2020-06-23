function constrain(x, min, max)
{
	let result = x;
	if (min <= max)
	{
		if (x < min) result = min;
		if (x > max) result = max;
	}
	return result;
}

function collision(x1, y1, a1, b1, x2, y2, a2, b2)
{
	let distance_Y = y2 - y1;
	let distance_X = x2 - x1;
	
	let max_Y = b1 / 2 + b2 / 2;
	let max_X = a1 / 2 + a2 / 2;
	
	let difference_Y = max_Y - Math.abs(distance_Y);
	let difference_X = max_X - Math.abs(distance_X);
	
	if (difference_Y > 0 && difference_X > 0)
	{
		if (difference_Y <= difference_X)
			return {
				direction:'y',
				shift: (distance_Y >= 0 ? difference_Y : -difference_Y)
			};
		else
			return {
				direction:'x',
				shift: (distance_X >= 0 ? difference_X : -difference_X)};
	}
	else return false;
}

function collisionPadBall(_pad, _ball)
{
	let collision_result = collision(_pad.x, _pad.y, _pad.w, _pad.h, _ball.x, _ball.y, 2 * _ball.r, 2 * _ball.r)
	if (collision_result)
	{
		let direction = collision_result.direction;
		let shift = collision_result.shift;
		_ball['v_' + direction] *= -1;
		_ball[direction] += shift;
		return true;
	}
	else return false;
}

function collisionBoxesBall(_boxes, _ball)
{
	let collision_result = [];
	for (let i = 0; i < _boxes.length; i++)
		collision_result[i] = collision(_boxes[i].x, _boxes[i].y, _boxes[i].w, _boxes[i].h,
										_ball.x,     _ball.y,     2 * _ball.r, 2 * _ball.r);
	let collision_sides = {
		x: false,
		y: false
	};
	for (let i = 0; i < _boxes.length; i++)
		if (collision_result[i])
		{
			collision_sides[collision_result[i].direction] = true;
			_boxes[i].die();
		}
	
	_boxes = _boxes.filter(function(value, i, array){return value.id != -1;});
	
	if (collision_sides.x) _ball.v_x *= -1;
	if (collision_sides.y) _ball.v_y *= -1;
	
	return _boxes;
}

class Ball
{
	static counter = 0; //number of objects already made
	constructor(canvas, x, y, r, canvas_w, canvas_h)
	{
		this.x = x; //x of the ball
		this.y = y; //y of the ball
		
		this.r = r; //radius of the ball
		
		this.v_x = 0.5; //speed of the ball at x, px/ms
		this.v_y = -0.5; //speed of the ball at y px/ms
		
		this.id = Ball.counter++; //giving unique id to ball and incrementing counter
		
		this.canvas_w = canvas_w; //canvas width
		this.canvas_h = canvas_h; //canvas height
		
		canvas.appendChild(this.ball = document.createElement('div')); //ball refers to the html element
		this.ball.id = 'Ball_' + this.id; //giving unique id to the html element
		this.ball.classList.add('ball'); //class judt for ball
		this.ball.classList.add('game_element'); //class for all game elements
		
		this.draft(); //drawing ball
	}
	update(t)
	{
		this.x += this.v_x * t;
		this.y += this.v_y * t;
		
		let min_x = this.r;
		let max_x = canvas_w - this.r;
		let min_y = this.r;
		let max_y = canvas_h - this.r;
		
		let result = false;
		if (this.y > max_x) result = true;
		
		if (this.x < min_x || this.x > max_x) this.v_x *= -1;
		if (this.y < min_y || this.y > max_y) this.v_y *= -1;
		
		this.x = constrain(this.x, min_x, max_x);
		this.y = constrain(this.y, min_y, max_y);
		
		return result;
	}
	draft()
	{
		this.ball.style.left = (this.x - this.r) + 'px';
		this.ball.style.top = (this.y - this.r) + 'px';
		this.ball.style.width = 2 * this.r + 'px';
		this.ball.style.height = 2 * this.r + 'px';
	}
}

class Pad
{
	static counter = 0; //number of objects already made
	constructor(canvas, x, y, w, h, canvas_w)
	{
		this.x = x; //x of the pad
		this.y = y; //y of the pad
		
		this.v_x = 0; //vertical speed of the pad
		
		this.w = w; //width of the pad
		this.h = h; //height of the pad
		
		this.id = Pad.counter++; //giving unique id to ball and incrementing counter
		
		this.canvas_w = canvas_w; //canvas width
		
		canvas.appendChild(this.pad = document.createElement('div')); //pad refers to the html element
		this.pad.id = 'Pad_' + this.id; //giving unique id to the html element
		this.pad.classList.add('pad'); //class just for pad
		this.pad.classList.add('game_element'); //class for all game elements
		
		this.draft(); //drawing pad
	}
	update(t)
	{
		this.x += this.v_x * t;
		this.x = constrain(this.x, this.w / 2, canvas_w - this.w / 2);
	}
	draft()
	{
		this.pad.style.left = (this.x - this.w / 2) + 'px';
		this.pad.style.top = (this.y - this.h / 2) + 'px';
		this.pad.style.width = this.w + 'px';
		this.pad.style.height = this.h + 'px';
	}
	manageKeyDown(event)
	{
		switch (event.keyCode)
		{
			case 65:
				this.v_x = -0.37;
				break;
			case 68:
				this.v_x = 0.37;
				break;
		}
	}
	manageKeyUp(event)
	{
		switch (event.keyCode)
		{
			case 65:
				if (this.v_x < 0) this.v_x = 0;
				break;
			case 68:
				if (this.v_x > 0) this.v_x = 0;
				break;
		}
	}
}

class Box
{
	static counter = 0; //number of objects already made
	constructor(canvas, x, y, w, h)
	{
		this.x = x; //x of the box
		this.y = y; //y of the box
		
		this.w = w; //width of the box
		this.h = h; //height of the box
		
		this.id = Box.counter++; //giving unique id and incrementing counter
		
		canvas.appendChild(this.box = document.createElement('div')); //box refers to the html element
		this.box.id = 'Box_' + this.id; //giving unique id to the html element
		this.box.classList.add('box'); //class just for box
		this.box.classList.add('game_element'); //class for all game elements
		
		this.draft(); //drawing box
	}
	draft()
	{
		this.box.style.left = (this.x - this.w / 2) + 'px';
		this.box.style.top = (this.y - this.h / 2) + 'px';
		this.box.style.width = this.w;
		this.box.style.height = this.h;
	}
	die()
	{
		this.box.remove();
		this.id = -1;
	}
}

class Game
{
	constructor(canvas, canvas_w, canvas_h)
	{
		this.the_ball = new Ball(canvas, 300, 525, 10, canvas_w, canvas_h);
		this.the_pad = new Pad(canvas, 300, 555, 120, 30, canvas_w);
		this.the_boxes = [];
		for (let i = 0; i < 8; i++) this.the_boxes[i] = new Box(canvas, 55 + i * 70, 200, 60, 60);
		for (let i = 0; i < 8; i++) this.the_boxes[i + 8] = new Box(canvas, 55 + i * 70, 130, 60, 60);
		this.running = false;
		this.loop;
		console.log(this.the_ball);
	}
	main()
	{
			console.log(this.the_ball);
		let t = 4;
			console.log(this.the_ball);
		for (let i = 0; i < t; i++)
		{
			console.log(this.the_ball);
			this.the_ball.update(1);
			this.the_pad.update(1);
			collisionPadBall(this.the_pad, this.the_ball);
			this.the_boxes = collisionBoxesBall(this.the_boxes, this.the_ball);
		}
	
		this.the_ball.draft();
		this.the_pad.draft();
		for (let i = 0; i < this.the_boxes.length; i++) this.the_boxes[i].draft();
	}
	pause(p)
	{
		if (p && !this.running)
		{
			console.log(this.the_ball);
			document.addEventListener('keydown', this.the_pad.manageKeyDown);
			document.addEventListener('keyup', this.the_pad.manageKeyUp);
			this.loop = setInterval(this.main, 4);
			this.running = true;
		}
		else if (this.running)
		{
			document.removeEventListener('keydown', this.the_pad.manageKeyDown);
			document.removeEventListener('keyup', this.the_pad.manageKeyUp);
			clearInterval(this.loop);
			this.running = false;
		}
	}
}