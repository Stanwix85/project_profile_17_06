var buttonColours = ["red", "blue", "green", "yellow"];

var gamePattern = [];
var userClickedPattern = [];

var started = false;
var level = 0;
var isGameOver = false;

function startGame() {
  if (!started && !isGameOver) {
    level = 0;
    $("#level-title").text("Level " + level);
    nextSequence();
    started = true;
  }
}

// Start via mouse click anywhere on the page
$(document).click(function() {
  if (!started && !isGameOver) {
    startGame();
  }
});

// Also allow keyboard start (any key)
$(document).keydown(function() {
  if (!started && !isGameOver) {
    startGame();
  }
});

// Start/restart via touch or mouse click on the title (supports mobile & desktop)
$("#level-title").on("click touchstart", function(e) {
  if (!started && !isGameOver) {
    e.preventDefault();
    e.stopPropagation();
    startGame();
  }
});

$(".btn").click(function(e) {
  // Stop click from bubbling to $(document).click so wrong answers don't immediately restart
  e.stopPropagation();

  if (isGameOver) return;

  if (!started) {
    startGame();
    return;
  }

  var userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);

  playSound(userChosenColour);
  animatePress(userChosenColour);

  checkAnswer(userClickedPattern.length - 1);
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  } else {
    isGameOver = true;
    playSound("wrong");
    $("body").addClass("game-over");
    $("#level-title").text("Game Over! Click to Restart");

    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 300);

    // Brief cooldown so accidental rapid clicks don't immediately restart
    setTimeout(function () {
      isGameOver = false;
    }, 400);

    startOver();
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);
  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  $("#" + randomChosenColour).fadeIn(200).fadeOut(200).fadeIn(200).addClass("snitch");
  setTimeout(function () {
    $("#" + randomChosenColour).removeClass("snitch");
  }, 200);
  playSound(randomChosenColour);
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}

function playSound(name) {
  try {
    var audio = new Audio("sound/" + name + ".mp3");
    var playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(function(err) {
        // Suppress audio autoplay error if blocked
      });
    }
  } catch (e) {
    // Audio API unavailable
  }
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
}
