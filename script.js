class Snake {
	constructor(initialPos) {
		// last element of array is head of snake
		this._body = [initialPos];

		// dx, dy represent velocity of snake in terms of x, y components
		this._dx = 0;
		this._dy = 0;
	}

	advance(ateApple) {
		this._body.push(this.next());
		if (!ateApple) this._body.shift();
	}

	next() {
		const head = this.getFront();
		return { x: head.x + this._dx, y: head.y + this._dy };
	}

	*iterBody() {
		yield* this._body;
	}

	size() {
		return this._body.length;
	}

	contains({ x, y }) {
		return this._body.some((cell) => cell.x === x && cell.y === y);
	}

	getFront() {
		return this._body.at(-1);
	}

	handleKeypress(event) {
		// FIXME: it's possible to turn in the opposite direction and immediately die
		switch (event.key) {
			case 'w':
			case 'ArrowUp':
				this._dx = 0;
				this._dy = -1;
				break;
			case 'a':
			case 'ArrowLeft':
				this._dx = -1;
				this._dy = 0;
				break;
			case 's':
			case 'ArrowDown':
				this._dx = 0;
				this._dy = 1;
				break;
			case 'd':
			case 'ArrowRight':
				this._dx = 1;
				this._dy = 0;
				break;
		}
	}
}

function selectRandomElement(items) {
	return items[Math.floor(Math.random() * items.length)];
}

class Game {
	static GRID_SIZE = 16;

	constructor(canvas) {
		this.reset();
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');
	}

	update() {
		const next = this._snake.next();
		if (this._snake.contains(next)) {
			// collided with other part of the snake
			// FIXME: notify player
			this.reset();
		} else if (0 <= next.x && next.x < Game.GRID_SIZE && 0 <= next.y && next.y < Game.GRID_SIZE) {
			const ateApple = next.x === this._apple.x && next.y === this._apple.y;
			this._snake.advance(ateApple);
			if (ateApple) {
				const maxSize = Game.GRID_SIZE * Game.GRID_SIZE;
				if (this._snake.size === maxSize) {
					// game completed
					// FIXME: notify player
					this.reset();
				} else {
					// select a new position for the apple
					const candidates = [];
					for (let x = 0; x < Game.GRID_SIZE; x++) {
						for (let y = 0; y < Game.GRID_SIZE; y++) {
							if (!this._snake.contains({ x, y })) candidates.push({ x, y });
						}
					}
					this._apple = selectRandomElement(candidates);
				}
			}
		} else {
			// died
			// FIXME: notify player
			this.reset();
		}

		this._render();
	}

	_render() {
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

		const h = this._canvas.height / Game.GRID_SIZE;
		const w = this._canvas.width / Game.GRID_SIZE;

		this._ctx.fillStyle = 'red';
		this._ctx.fillRect(this._apple.x * w, this._apple.y * h, w - 1, h - 1);

		this._ctx.fillStyle = 'green';
		for (const cell of this._snake.iterBody()) {
			this._ctx.fillRect(cell.x * w, cell.y * h, w - 1, h - 1);
		}
	}

	handleKeypress(event) {
		this._snake.handleKeypress(event);
	}

	reset() {
		this._snake = new Snake({
			x: Math.floor(Game.GRID_SIZE / 2),
			y: Math.floor(Game.GRID_SIZE / 2),
		});
		this._apple = { x: 5, y: 5 };
	}
}

// See https://stackoverflow.com/questions/1955687/best-way-for-simple-game-loop-in-javascript.
function callWithFrameDelay(f, frameDelay) {
	let prevTime = 0;
	let delta = 0;

	function loop(time) {
		const dt = time - prevTime;
		delta += dt;
		prevTime = time;
		while (delta > frameDelay) {
			f();
			delta -= frameDelay;
		}
		requestAnimationFrame(loop);
	}
	requestAnimationFrame((time) => {
		prevTime = time;
		requestAnimationFrame(loop);
	});
}

const FRAME_DELAY = 90; // how many milliseconds between updates -- higher value means slower movement and vice versa

const game = new Game(document.getElementById('game'));
document.addEventListener('keydown', (event) => game.handleKeypress(event));
callWithFrameDelay(() => game.update(), FRAME_DELAY);
