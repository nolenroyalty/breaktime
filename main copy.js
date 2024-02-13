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

  function betweenTopAndBottom(ballRect, eltRect) {
    const above = ballRect.bottom < eltRect.top;
    const below = ballRect.top > eltRect.bottom;
    return !above && !below;
  }

  function betweenLeftAndRight(ballRect, eltRect) {
    const left = ballRect.right < eltRect.left;
    const right = ballRect.left > eltRect.right;

    return !left && !right;
  }

  function elementsIntersect(ball, element) {
    const ballRect = ball.getBoundingClientRect();
    const eltRect = element.getBoundingClientRect();

    const doNotIntersect =
      ballRect.right < eltRect.left || // ballRect is left of eltRect
      ballRect.left > eltRect.right || // ballRect is right of eltRect
      ballRect.bottom < eltRect.top || // ballRect is above eltRect
      ballRect.top > eltRect.bottom; // ballRect is below eltRect

    return { intersects: !doNotIntersect, ballRect, eltRect };
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

  const intersectionOrientation = (oldBallRect, newBallRect, eltRect) => {};

  const interval = setInterval(() => {
    const oldBallRect = ball.getBoundingClientRect();
    let nextLeft = ballLeft + SPEED * direction.x;
    let nextTop = ballTop + SPEED * direction.y;
    if (nextLeft >= WIDTH - BALL_SIZE || nextLeft <= 0) {
      direction.x *= -1;
    }
    if (nextTop >= HEIGHT - BALL_SIZE || nextTop <= 0) {
      direction.y *= -1;
    }
    nextLeft = clamp(0, WIDTH - BALL_SIZE, nextLeft);
    nextTop = clamp(0, HEIGHT - BALL_SIZE, nextTop);
    translateBall(nextLeft, nextTop);

    EVENTS.forEach((event) => {
      const { intersects, ballRect, eltRect } = elementsIntersect(ball, event);
      if (event.dataset.intersected) {
        return;
      }

      if (intersects) {
        event.dataset.intersected = "true";
        let intersectionOrientation = "unknown";
        const ballCenterX = ballRect.left + ballRect.width / 2;
        const ballCenterY = ballRect.top + ballRect.height / 2;
        const eltCenterX = eltRect.left + eltRect.width / 2;
        const eltCenterY = eltRect.top + eltRect.height / 2;

        // shoutout to https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
        const relativeIntersectY = eltCenterY - ballCenterY;
        const relativeIntersectX = eltCenterX - ballCenterX;

        const normalizedIntersectY = relativeIntersectY / (eltRect.height / 2);
        const normalizedIntersectX = relativeIntersectX / (eltRect.width / 2);

        if (betweenTopAndBottom(oldBallRect, eltRect)) {
          intersectionOrientation = "side";
        } else if (betweenLeftAndRight(oldBallRect, eltRect)) {
          intersectionOrientation = "top";
        } else {
          if (Math.abs(normalizedIntersectX) > Math.abs(normalizedIntersectY)) {
            intersectionOrientation = "side";
          } else {
            intersectionOrientation = "top";
          }
        }

        if (intersectionOrientation === "side") {
          direction.x *= -1;
        } else {
          direction.y *= -1;
        }

        event.style.backgroundColor = "slategrey";
        event.style.transition =
          "opacity 0.5s ease, background-color 0.5s ease";
        event.style.opacity = "0.3";
      }
    });

    ballLeft = nextLeft;
    ballTop = nextTop;
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
  }, 7500);

  document.body.appendChild(ball);
};

function resetEvents() {
  const EVENTS = document
    .querySelector("div[role='main']")
    .querySelectorAll("div[role='button']");
  EVENTS.forEach((event) => {
    event.style.backgroundColor = "white";
    event.style.opacity = "1";
    event.dataset.intersected = "";
  });
}

resetEvents();
main();
