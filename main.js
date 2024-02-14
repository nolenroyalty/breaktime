const getEvents = () => {
  return document
    .querySelector("div[role='main']")
    .querySelectorAll("div[role='button']");
};

const css = `
:root {
  --color-black: hsl(235deg 15% 15%);
  --color-playarea: hsl(235deg 15% 67%);
}

.play-area {
  position: fixed;
  top: calc(var(--top) * 1px);
  left: calc(var(--left) * 1px);
  width: calc(var(--width) * 1px);
  height: calc(var(--height) * 1px);
  background-color: var(--color-playarea);
  outline: 2px dashed black;
  pointer-events: none;
  transition: opacity 1s ease;
}

.ball {
  position: fixed;
  left: calc(var(--left)* 1px);
  top: calc(var(--top)* 1px);
  width: calc(var(--size)* 1px);
  height: calc(var(--size)* 1px);
  background-color: var(--color-black);
  border-radius: 50%; 
  will-change: transform;
  transition: transform 0.1s linear, opacity 1s ease;
  z-index: 1001;
}

/* .ball::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100px;
  height: 50px;
  z-index: -1;
  transform: rotate(180deg) translateX(65px);
  clip-path: polygon(0% 10%, 100% 30%, 100% 70%, 0% 90%);
  background: linear-gradient(270deg, rgba(123,183,217,0) 0%,
                                     rgba(167,204,224,0.72) 50%, 
                                     rgba(225,237,244,0.2) 65%,
                                     rgba(225,237,244,0) 80%
                                     );
} */

.paddle {
  position: fixed;
  left: calc(var(--left)* 1px);
  top: calc(var(--top)* 1px);
  width: calc(var(--width)* 1px);
  height: calc(var(--height)* 1px);
  background-color: var(--color-black);
  z-index: 1002;
  transition: transform 0.05s linear, opacity 1s ease;
}

.transparent {
  opacity: 0;
}

.faded {
  opacity: 0.3;
  transition: opacity 0.5s ease, background-color 0.5s ease;
}
`;

const main = function () {
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  const BALL_SIZE = 50;
  const TICK_TIME = 50;
  const BASE_SPEED = 5;
  const STOP_AFTER_THIS_MANY_TICKS = 300;
  const FADE_IN_TIME = 1000;

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
  // It's gross but these need to be global :/
  let paddleLeft = WIDTH / 2 - 50;
  let ballLeft = WIDTH / 2;
  let ballTop = HEIGHT - 100;

  function createElt(id, style = {}, classList = []) {
    document.querySelector(`#${id}`)?.remove();
    const elt = document.createElement("div");
    elt.id = id;
    elt.classList.add(...classList);
    Object.keys(style).forEach((key) => {
      elt.style.setProperty(key, style[key]);
    });
    document.body.appendChild(elt);
    return elt;
  }

  const playArea = createElt(
    "_playArea",
    { "--top": TOP, "--left": LEFT, "--width": WIDTH, "--height": HEIGHT },
    ["play-area", "transparent"]
  );

  const ball = createElt(
    "_ball",
    { "--top": TOP, "--left": LEFT, "--size": BALL_SIZE },
    ["ball", "transparent"]
  );

  const paddle = createElt(
    "_paddle",
    { "--top": BOTTOM - 22, "--left": LEFT, "--width": 100, "--height": 20 },
    ["paddle", "transparent"]
  );

  const clamp = (min, max, value) => Math.min(Math.max(min, value), max);

  function addTransform(elt, transform, key) {
    const prefix = `data-transform-`;
    elt.setAttribute(prefix + key, transform);
    const transforms = [];
    for (const [k, v] of Object.entries(elt.dataset)) {
      if (k.startsWith("transform")) {
        transforms.push(v);
      }
    }
    elt.style.transform = transforms.join(" ");
  }

  function translate(elt, x, y) {
    addTransform(elt, `translate(${x}px, ${y}px)`, "translate");
  }

  function rotateForVector(elt, dx, dy) {
    // dy is negative because the y axis is inverted in the browser.
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) {
      angle += 360;
    }

    addTransform(elt, `rotate(${angle}deg)`, "rotate");
  }

  const getIntersectionState = ({ oldBall, newBall, elt }) => {
    // We need to add 1 to all of these functions in case the ball is exactly on the edge of the element.
    const leftIntersectionStrength = (ball, bounds) =>
      ball.right >= bounds.left && ball.left <= bounds.left
        ? 1 + ball.right - bounds.left
        : 0;

    const rightIntersectionStrength = (ball, bounds) =>
      ball.left <= bounds.right && ball.right >= bounds.right
        ? 1 + bounds.right - ball.left
        : 0;

    const aboveIntersectionStrength = (ball, bounds) =>
      ball.bottom >= bounds.top && ball.top <= bounds.top
        ? 1 + ball.bottom - bounds.top
        : 0;

    const belowIntersectionStrength = (ball, bounds) =>
      ball.top <= bounds.bottom && ball.bottom >= bounds.bottom
        ? 1 + bounds.bottom - ball.top
        : 0;

    const doesNotIntersect =
      newBall.bottom < elt.top ||
      newBall.top > elt.bottom ||
      newBall.right < elt.left ||
      newBall.left > elt.right;

    if (doesNotIntersect) {
      return { intersects: false };
    }

    const justIntersected = (checkIntersect) => {
      return checkIntersect(newBall, elt) && !checkIntersect(oldBall, elt);
    };

    const strengthIfJustIntersected = (strengthFn) => {
      const oldStrength = strengthFn(oldBall, elt);
      const newStrength = strengthFn(newBall, elt);
      return oldStrength === 0 && newStrength > 0 ? newStrength : 0;
    };

    const intersectsFrom = {
      left: strengthIfJustIntersected(leftIntersectionStrength),
      right: strengthIfJustIntersected(rightIntersectionStrength),
      above: strengthIfJustIntersected(aboveIntersectionStrength),
      below: strengthIfJustIntersected(belowIntersectionStrength),
    };
    return { intersects: true, intersectsFrom };
  };

  function wrappedIntervalLoop(fn, label) {
    return () => {
      try {
        fn();
      } catch (e) {
        console.log(`${label} ERROR: ${e}`);
      }
    };
  }

  function paddleLoop() {
    const keysPressed = { ArrowLeft: false, ArrowRight: false };
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        keysPressed[e.key] = true;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        keysPressed[e.key] = false;
      }
    });

    function loop() {
      let shouldTranslate = false;
      if (keysPressed.ArrowLeft) {
        paddleLeft = clamp(0, WIDTH - 100, paddleLeft - 2);
        shouldTranslate = true;
      }
      if (keysPressed.ArrowRight) {
        paddleLeft = clamp(0, WIDTH - 100, paddleLeft + 2);
        shouldTranslate = true;
      }
      if (shouldTranslate) {
        translate(paddle, paddleLeft, 0);
      }
    }

    return wrappedIntervalLoop(loop, "PADDLE");
  }

  function mainLoop() {
    const direction = { x: 1, y: 1 };

    const translatedBounds = (obj) => {
      const bounds = obj.getBoundingClientRect();
      return {
        left: bounds.left - LEFT,
        right: bounds.right - LEFT,
        top: bounds.top - TOP,
        bottom: bounds.bottom - TOP,
      };
    };

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

    const makeBallBox = (left, top) => ({
      left,
      right: left + BALL_SIZE,
      top,
      bottom: top + BALL_SIZE,
    });

    function loop() {
      const tickId = Math.floor(Math.random() * 1000000);
      let nextLeft = ballLeft + BASE_SPEED * direction.x;
      let nextTop = ballTop + BASE_SPEED * direction.y;
      let hasCollidedX = false;
      let hasCollidedY = false;
      const movingLeft = direction.x < 0;
      const movingRight = direction.x > 0;
      const movingUp = direction.y < 0;
      const movingDown = direction.y > 0;

      if (nextLeft < 0) {
        direction.x *= -1;
        nextLeft = 0;
        hasCollidedX = true;
      } else if (nextLeft + BALL_SIZE > WIDTH) {
        direction.x *= -1;
        nextLeft = WIDTH - BALL_SIZE;
        hasCollidedX = true;
      }
      if (nextTop < 0) {
        direction.y *= -1;
        nextTop = 0;
        hasCollidedY = true;
      } else if (nextTop > HEIGHT - BALL_SIZE) {
        direction.y *= -1;
        nextTop = HEIGHT - BALL_SIZE;
        hasCollidedY = true;
      }

      const oldBall = makeBallBox(ballLeft, ballTop);
      const newBall = makeBallBox(nextLeft, nextTop);

      function collideWithEvent(event) {
        event.classList.add("faded");
        event.dataset.intersected = "true";
      }

      getEvents().forEach((event) => {
        if (event.dataset.intersected) {
          return;
        }

        const eventBounds = translatedBounds(event);
        const { intersects, intersectsFrom } = getIntersectionState({
          oldBall,
          newBall,
          elt: eventBounds,
        });

        if (intersects) {
          console.log(
            `[${tickId}] INTERSECTION DETECTED: ${event.textContent}`
          );
          collideWithEvent(event);

          if (hasCollidedX && hasCollidedY) {
            console.log("SKIPPING A COLLISION");
            return;
          }
          console.log(`OLD BOX: ${JSON.stringify(oldBall)}`);
          console.log(`NEXT BOX: ${JSON.stringify(newBall)}`);
          console.log(`EVENT BOUNDS: ${JSON.stringify(eventBounds)}`);
          console.log(`INTERSECTIONS: ${JSON.stringify(intersectsFrom)}`);

          let intersectionStrength = Infinity;
          let intersectionFn = null;

          const maybeUpdateIntersection = (strength, fn) => {
            // This is counterintuitive, but we care about the *smallest* strength. The way to think about it is that
            // If there's an intersection, both a horizontal and vertical `intersectsFrom` must be true (if only one
            // was true, the ball could be, say, between the event vertically but very far away horizontally.)

            // Typically this function is only called once in a tick, because we only call it if the ball began to intersect
            // the element in a direction *this tick*. But it's possible that that becomes true both horizontally and vertically
            // in the same tick.

            // If that happens we want to pick the smaller of the two strengths, because that's the one that happened second -
            // meaning that it's the one that "caused" the intersection. A way to think about this is that if our tick function
            // happened much more frequently, the larger strength intersection would likely have happened on a prior tick.
            if (strength > 0 && strength < intersectionStrength) {
              intersectionStrength = strength;
              intersectionFn = fn;
            }
          };

          if (!hasCollidedX && movingRight && intersectsFrom.left) {
            maybeUpdateIntersection(intersectsFrom.left, () => {
              ensureToLeftOf(newBall, eventBounds.left);
              direction.x *= -1;
              hasCollidedX = true;
            });
          } else if (!hasCollidedX && movingLeft && intersectsFrom.right) {
            maybeUpdateIntersection(intersectsFrom.right, () => {
              ensureToRightOf(newBall, eventBounds.right);
              direction.x *= -1;
              hasCollidedX = true;
            });
          }

          if (!hasCollidedY && movingDown && intersectsFrom.above) {
            maybeUpdateIntersection(intersectsFrom.above, () => {
              ensureAbove(newBall, eventBounds.top);
              direction.y *= -1;
              hasCollidedY = true;
            });
          } else if (!hasCollidedY && movingUp && intersectsFrom.below) {
            maybeUpdateIntersection(intersectsFrom.below, () => {
              ensureBelow(newBall, eventBounds.bottom);
              direction.y *= -1;
              hasCollidedY = true;
            });
          }

          if (intersectionFn) {
            intersectionFn();
          } else {
            console.info(
              `NO COLLISION DETECTED for ${event.textContent} | xCollision: ${hasCollidedX} | yCollision: ${hasCollidedY}`
            );
          }
          console.log("--------------");
        }
      });

      translate(ball, newBall.left, newBall.top);
      rotateForVector(ball, direction.x, direction.y);
      ballLeft = newBall.left;
      ballTop = newBall.top;
    }

    return wrappedIntervalLoop(loop, "GAME");
  }

  let mainInterval;
  let paddleInterval;
  function applyInitialTranslations() {
    translate(ball, ballLeft, ballTop);
    translate(paddle, paddleLeft, 0);
  }
  applyInitialTranslations();

  const stopGame = setTimeout(() => {
    console.log("STOPPING");
    clearInterval(mainInterval);
    clearInterval(paddleInterval);
  }, STOP_AFTER_THIS_MANY_TICKS * TICK_TIME);

  const setup = setTimeout(() => {
    ball.classList.remove("transparent");
    playArea.classList.remove("transparent");
    paddle.classList.remove("transparent");
  }, 1);

  const startGame = setTimeout(() => {
    mainInterval = setInterval(mainLoop(), TICK_TIME);
    paddleInterval = setInterval(paddleLoop(), 1000 / 60);
  }, FADE_IN_TIME + 1);
};

function resetEvents() {
  getEvents().forEach((event) => {
    event.classList.remove("faded");
    event.dataset.intersected = "";
  });
}

resetEvents();
main();
