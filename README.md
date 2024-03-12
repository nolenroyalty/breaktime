# BreakTime

![BreakTime running inside Google Calendar](./images/breaktime-final-readme.gif)

This is an implementation of [Breakout](<https://en.wikipedia.org/wiki/Breakout_(video_game)>) (aka [BrickBreaker](https://en.wikipedia.org/wiki/Brick_Breaker)) that runs inside Google Calendar.

Install it as a chrome extension and then press the extension's button in the chrome extension bar. A paddle and ball will appear. Press 'space' to start the game and use the arrow keys to move the paddle.

The ball will collide with events and "shatter" them. After you shatter all your visible events (or if the ball hits the floor) you'll be asked whether you actually want to decline the meetings that you shattered.

The ball cannot collide with events near the bottom of the screen. This is because it's too hard to play Breakout with events that close to the bottom - they can instantly cause you to lose! You can scroll while playing the game if it's important to you to smash stuff near the bottom :)

Many thanks to [Ian Henry](https://twitter.com/ianthehenry/status/1757464426616435093) for the initial inspiration, [Chana Messinger](https://twitter.com/ChanaMessinger/status/1757941634975859132) for the name of the game, and the [Google Calendar Twitter Account](https://twitter.com/googlecalendar/status/1764769037156843555) for the encouragement!

I'll gladly take contributions that fix bugs or improve the gameplay experience. I also always enjoy contributions that are really funny. The code is kinda bad and there are no tests so, uh, beware.
