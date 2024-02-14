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

const maybeNegate = () => (Math.random() > 0.5 ? 1 : -1);
const randomMaybeNegative = (max) =>
  Math.floor(Math.random() * max * maybeNegate());

// const interval = setInterval(() => {
//   const oldBallRect = ball.getBoundingClientRect();
//   let nextLeft = ballLeft + SPEED * direction.x;
//   let nextTop = ballTop + SPEED * direction.y;
//   if (nextLeft >= WIDTH - BALL_SIZE || nextLeft <= 0) {
//     direction.x *= -1;
//   }
//   if (nextTop >= HEIGHT - BALL_SIZE || nextTop <= 0) {
//     direction.y *= -1;
//   }
//   nextLeft = clamp(0, WIDTH - BALL_SIZE, nextLeft);
//   nextTop = clamp(0, HEIGHT - BALL_SIZE, nextTop);
//   translateBall(nextLeft, nextTop);

//   EVENTS.forEach((event) => {
//     const { intersects, eltRect } = elementsIntersect(
//       oldBallRect.left + SPEED * direction.x,
//       oldBallRight.top + SPEED * direction.y,
//       event
//     );
//     if (event.dataset.intersected) {
//       return;
//     }

//     if (intersects) {
//       event.dataset.intersected = "true";
//       let intersectionOrientation = "unknown";

//       if (direction.x > 0) {
//         nextLeft = Math.min(nextLeft, eltRect.left - BALL_SIZE);
//       } else {
//         nextLeft = Math.max(nextLeft, eltRect.right);
//       }
//       if (direction.y > 0) {
//         nextTop = Math.min(nextTop, eltRect.top - BALL_SIZE);
//       } else {
//         nextTop = Math.max(nextTop, eltRect.bottom);
//       }

//       const ballCenterX = ballRect.left + ballRect.width / 2;
//       const ballCenterY = ballRect.top + ballRect.height / 2;
//       const eltCenterX = eltRect.left + eltRect.width / 2;
//       const eltCenterY = eltRect.top + eltRect.height / 2;

//       // shoutout to https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
//       const relativeIntersectY = eltCenterY - ballCenterY;
//       const relativeIntersectX = eltCenterX - ballCenterX;

//       const normalizedIntersectY = relativeIntersectY / (eltRect.height / 2);
//       const normalizedIntersectX = relativeIntersectX / (eltRect.width / 2);

//       if (betweenTopAndBottom(oldBallRect, eltRect)) {
//         intersectionOrientation = "side";
//       } else if (betweenLeftAndRight(oldBallRect, eltRect)) {
//         intersectionOrientation = "top";
//       } else {
//         if (Math.abs(normalizedIntersectX) > Math.abs(normalizedIntersectY)) {
//           intersectionOrientation = "side";
//         } else {
//           intersectionOrientation = "top";
//         }
//       }

//       if (intersectionOrientation === "side") {
//         direction.x *= -1;
//       } else {
//         direction.y *= -1;
//       }

//       event.style.backgroundColor = "slategrey";
//       event.style.transition =
//         "opacity 0.5s ease, background-color 0.5s ease";
//       event.style.opacity = "0.3";
//     }
//   });

//   ballLeft = nextLeft;
//   ballTop = nextTop;
// }, 100);
