const main = function () {
  const clamp = (min, max, value) => Math.min(Math.max(min, value), max);
  const BALL_SIZE = 50;

  const _ball = document.getElementById("_ball");
  const _visual = document.getElementById("_visual");
  const maybeNegate = () => (Math.random() > 0.5 ? 1 : -1);
  const randomMaybeNegative = (max) =>
    Math.floor(Math.random() * max * maybeNegate());
  if (_ball) {
    // delete ball
    _ball.remove();
  }
  if (_visual) {
    // delete visual
    _visual.remove();
  }

  const mainElt = document.querySelector("div[role='main']");
  const grid = mainElt.querySelector("div[role='grid']");
  const topPlayArea = grid
    .querySelector("div[role='row'][aria-hidden='false']")
    .getBoundingClientRect();
  const bottomPlayArea = grid.children[1].getBoundingClientRect();
  const LEFT = Math.min(topPlayArea.left, bottomPlayArea.left);
  const TOP = topPlayArea.top;
  const RIGHT = Math.max(topPlayArea.right, bottomPlayArea.right);
  const BOTTOM =
    Math.max(bottomPlayArea.bottom, window.innerHeight - 100) - 100;
  const WIDTH = RIGHT - LEFT;
  const HEIGHT = BOTTOM - TOP;
  const EVENTS = document
    .querySelector("div[role='main']")
    .querySelectorAll("div[role='button']");

  var visual = document.createElement("div");
  visual.id = "_visual";

  visual.style.position = "fixed";
  visual.style.backgroundColor = "slategrey";
  visual.style.left = `${LEFT}px`;
  visual.style.top = `${TOP}px`;
  visual.style.width = `${RIGHT - LEFT}px`;
  visual.style.height = `${BOTTOM - TOP}px`;
  visual.style.outline = "2px dashed black";

  document.body.appendChild(visual);

  var ball = document.createElement("div");
  ball.id = "_ball";

  ball.style.position = "fixed";
  ball.style.width = `${BALL_SIZE}px`;
  ball.style.height = `${BALL_SIZE}px`;
  ball.style.backgroundColor = "black";
  ball.style.borderRadius = "50%";
  ball.style.left = `${LEFT}px`;
  ball.style.top = `${TOP}px`;
  ball.style.willChange = "transform";
  ball.style.transition = "transform 0.1s linear";
  ball.style.zIndex = "1000";

  let ballLeft = WIDTH / 2;
  let ballTop = HEIGHT - 100;
  const direction = { x: 1, y: 1 };
  const SPEED = 20;

  const translateBall = (left, top) => {
    ball.style.transform = `translate(${left}px, ${top}px)`;
  };

  translateBall(ballLeft, ballTop);

  const translatedBounds = (obj) => {
    const bounds = obj.getBoundingClientRect();
    return {
      left: bounds.left - LEFT,
      right: bounds.right - LEFT,
      top: bounds.top - TOP,
      bottom: bounds.bottom - TOP,
    };
  };

  const interval = setInterval(() => {
    const nextLeft = ballLeft + SPEED * direction.x;
    const nextTop = ballTop + SPEED * direction.y;
    if (nextLeft >= WIDTH - BALL_SIZE || nextLeft <= 0) {
      direction.x *= -1;
    }
    if (nextTop >= HEIGHT - BALL_SIZE || nextTop <= 0) {
      direction.y *= -1;
    }
    ballLeft = clamp(0, WIDTH - BALL_SIZE, nextLeft);
    ballTop = clamp(0, HEIGHT - BALL_SIZE, nextTop);
    translateBall(ballLeft, ballTop);

    EVENTS.forEach((event) => {
      const bounds = translatedBounds(event);
      // check if the ball intersects with the event
      if (
        ballLeft < bounds.right &&
        ballLeft + BALL_SIZE > bounds.left &&
        ballTop < bounds.bottom &&
        ballTop + BALL_SIZE > bounds.top
      ) {
        console.log(
          `Intersects: ${ballLeft}, ${ballTop} - ${bounds.left}, ${bounds.top}, ${bounds.right}, ${bounds.bottom}`
        );
        event.style.backgroundColor = "red";
      }
    });
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
  }, 7500);

  document.body.appendChild(ball);
};
