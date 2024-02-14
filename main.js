const main = function () {
  const clamp = (min, max, value) => Math.min(Math.max(min, value), max);
  const BALL_SIZE = 50;
  const TICK_TIME = 100;
  const BASE_SPEED = 10;
  const STOP_AFTER_THIS_MANY_TICKS = 150;
  const FADE_IN_TIME = 1000;

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
  const BOTTOM = Math.max(bottomPlayArea.bottom, window.innerHeight - 25) - 25;
  const WIDTH = RIGHT - LEFT;
  const HEIGHT = BOTTOM - TOP;
  const EVENTS = document
    .querySelector("div[role='main']")
    .querySelectorAll("div[role='button']");

  var visual = document.createElement("div");
  visual.id = "_visual";

  visual.style.position = "fixed";
  visual.style.backgroundColor = "hsl(235deg 15% 67%)";
  visual.style.left = `${LEFT}px`;
  visual.style.top = `${TOP}px`;
  visual.style.width = `${RIGHT - LEFT}px`;
  visual.style.height = `${BOTTOM - TOP}px`;
  visual.style.outline = "2px dashed black";
  visual.style.transition = `opacity ${FADE_IN_TIME / 1000}s ease`;
  visual.style.opacity = "0";
  visual.style.pointerEvents = "none";

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
  ball.style.transition = `transform ${TICK_TIME / 1000}s linear, opacity ${
    FADE_IN_TIME / 1000
  }s ease`;
  ball.style.zIndex = "1000";
  ball.style.opacity = "0";

  document.body.appendChild(ball);

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
  const intersectsFromLeft = (ball, bounds) => {
    return ball.right >= bounds.left && ball.left <= bounds.left;
  };

  const intersectsFromRight = (ball, bounds) => {
    return ball.left <= bounds.right && ball.right >= bounds.right;
  };

  const intersectsFromAbove = (ball, bounds) => {
    return ball.bottom >= bounds.top && ball.top <= bounds.top;
  };

  const intersectsFromBelow = (ball, bounds) => {
    return ball.top <= bounds.bottom && ball.bottom >= bounds.bottom;
  };

  const mainLoop = () => {
    const interval = setInterval(() => {
      const nextLeft = ballLeft + BASE_SPEED * direction.x;
      const nextTop = ballTop + BASE_SPEED * direction.y;
      let hasCollided = false;
      const movingLeft = direction.x < 0;
      const movingRight = direction.x > 0;
      const movingUp = direction.y < 0;
      const movingDown = direction.y > 0;

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
          console.log(`INTERSECTION DETECTED: ${event.textContent}`);
          event.style.transition =
            "opacity 0.5s ease, background-color 0.5s ease";
          event.style.opacity = "0.3";
          event.dataset.intersected = "true";
          // I think we might want to handle X and Y separately here? unsure.
          if (hasCollided) {
            console.log("SKIPPING A COLLISION");
            return;
          }
          console.log(`NEXT BOX: ${JSON.stringify(nextBox)}`);
          console.log(`EVENT BOUNDS: ${JSON.stringify(eventBounds)}`);
          console.log(`INTERSECTIONS: ${JSON.stringify(intersections)}`);
          console.log("--------------");

          if (
            movingRight &&
            intersectsFromLeft(nextBox, eventBounds) &&
            !intersectsFromLeft(curBox, eventBounds)
          ) {
            direction.x *= -1;
            ensureToLeftOf(nextBox, eventBounds.left);
            hasCollided = true;
          } else if (
            movingLeft &&
            intersectsFromRight(nextBox, eventBounds) &&
            !intersectsFromRight(curBox, eventBounds)
          ) {
            direction.x *= -1;
            ensureToRightOf(nextBox, eventBounds.right);
            hasCollided = true;
          }

          if (
            movingDown &&
            intersectsFromAbove(nextBox, eventBounds) &&
            !intersectsFromAbove(curBox, eventBounds)
          ) {
            direction.y *= -1;
            ensureAbove(nextBox, eventBounds.top);
            hasCollided = true;
          } else if (
            movingUp &&
            intersectsFromBelow(nextBox, eventBounds) &&
            !intersectsFromBelow(curBox, eventBounds)
          ) {
            direction.y *= -1;
            ensureBelow(nextBox, eventBounds.bottom);
            hasCollided = true;
          }

          if (!hasCollided) {
            console.warn(`NO COLLISION DETECTED for ${event.textContent}`);
            direction.x *= -1;
            direction.y *= -1;
            hasCollided = true;
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
    }, STOP_AFTER_THIS_MANY_TICKS * TICK_TIME);
  };

  setTimeout(() => {
    ball.style.opacity = "1";
    visual.style.opacity = "1";
  }, 1);
  setTimeout(() => {
    mainLoop();
  }, FADE_IN_TIME + 1);
};

function resetEvents() {
  const EVENTS = document
    .querySelector("div[role='main']")
    .querySelectorAll("div[role='button']");
  EVENTS.forEach((event) => {
    event.style.opacity = "1";
    event.dataset.intersected = "";
  });
}

resetEvents();
main();
