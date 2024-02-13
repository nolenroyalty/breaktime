const main = function () {
  const clamp = (min, max, value) => Math.min(Math.max(min, value), max);
  const BALL_SIZE = 50;
  const TICK_TIME = 50;
  const BASE_SPEED = 10;

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

  function elementsIntersect(ballLeft, ballTop, element) {
    const eltRect = element.getBoundingClientRect();
    const ballRight = ballLeft + BALL_SIZE;
    const ballBottom = ballTop + BALL_SIZE;

    const doNotIntersect =
      ballRight < eltRect.left || // ballRect is left of eltRect
      ballLeft > eltRect.right || // ballRect is right of eltRect
      ballBottom < eltRect.top || // ballRect is above eltRect
      ballTop > eltRect.bottom; // ballRect is below eltRect

    return { intersects: !doNotIntersect, eltRect };
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
  ball.style.transition = `transform ${TICK_TIME / 1000}s linear`;
  ball.style.zIndex = "1000";

  let ballLeft = WIDTH / 2;
  let ballTop = HEIGHT - 100;
  const direction = { x: 1, y: 1 };

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

  const getIntersections = (elt1, elt2) => {
    const above = elt1.bottom < elt2.top;
    const below = elt1.top > elt2.bottom;
    const left = elt1.right < elt2.left;
    const right = elt1.left > elt2.right;
    const intersects = !(above || below || left || right);
    return { intersects, above, below, left, right };
  };

  const intersectionOrientation = (oldBallRect, newBallRect, eltRect) => {};
  const ensureToLeftOf = (ballBox, left) => {
    ballBox.left = left - BALL_SIZE;
    ballBox.right = left;
  };
  const ensureToRightOf = (ballBox, right) => {
    ballBox.right = right + BALL_SIZE;
    ballBox.left = right;
  };
  const ensureAbove = (ballBox, top) => {
    ballBox.top = top - BALL_SIZE;
    ballBox.bottom = top;
  };
  const ensureBelow = (ballBox, bottom) => {
    ballBox.bottom = bottom + BALL_SIZE;
    ballBox.top = bottom;
  };

  const interval = setInterval(() => {
    const nextLeft = ballLeft + BASE_SPEED * direction.x;
    const nextTop = ballTop + BASE_SPEED * direction.y;
    let hasCollided = false;

    if (nextLeft < 0) {
      direction.x *= -1;
      nextLeft = 0;
      hasCollided = true;
    } else if (nextLeft + BALL_SIZE > WIDTH) {
      direction.x *= -1;
      hasCollided = true;
      // nextLeft = WIDTH - BALL_SIZE;
    }
    if (nextTop < 0) {
      direction.y *= -1;
      nextTop = 0;
      hasCollided = true;
    } else if (nextTop > HEIGHT - BALL_SIZE) {
      direction.y *= -1;
      hasCollided = true;
      // nextTop = HEIGHT - BALL_SIZE;
    }

    const curBox = {
      left: ballLeft,
      right: ballLeft + BALL_SIZE,
      top: ballTop,
      bottom: ballTop + BALL_SIZE,
    };
    const nextBox = {
      left: nextLeft,
      right: nextLeft + BALL_SIZE,
      top: nextTop,
      bottom: nextTop + BALL_SIZE,
    };

    EVENTS.forEach((event) => {
      const eventBounds = translatedBounds(event);
      const intersections = getIntersections(nextBox, eventBounds);
      if (intersections.intersects && !event.dataset.intersected) {
        event.style.backgroundColor = "slategrey";
        event.style.transition =
          "opacity 0.5s ease, background-color 0.5s ease";
        event.style.opacity = "0.3";
        event.dataset.intersected = "true";
        // I think we might want to handle X and Y separately here? unsure.
        if (hasCollided) {
          return;
        }
        hasCollided = true;
        if (
          direction.x > 0 &&
          nextBox.right > eventBounds.left &&
          nextBox.left < eventBounds.left
        ) {
          direction.x *= -1;
          ensureToLeftOf(nextBox, eventBounds.left);
        } else if (
          direction.x < 0 &&
          nextBox.left < eventBounds.right &&
          nextBox.right > eventBounds.right
        ) {
          direction.x *= -1;
          ensureToRightOf(nextBox, eventBounds.right);
        }

        if (
          direction.y > 0 &&
          nextBox.bottom > eventBounds.top &&
          nextBox.top < eventBounds.top
        ) {
          direction.y *= -1;
          ensureAbove(nextBox, eventBounds.top);
        } else if (
          direction.y < 0 &&
          nextBox.top < eventBounds.bottom &&
          nextBox.bottom > eventBounds.bottom
        ) {
          direction.y *= -1;
          ensureBelow(nextBox, eventBounds.bottom);
        }
      }
    });

    translateBall(nextBox.left, nextBox.top);
    ballLeft = nextBox.left;
    ballTop = nextBox.top;
  }, TICK_TIME);

  setTimeout(() => {
    console.log("clearing interval");
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
