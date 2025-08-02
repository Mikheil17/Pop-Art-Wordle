var randomWord = randomWordsList[Math.floor(Math.random() * randomWordsList.length)].toUpperCase();
var chosenWordArray = [];
var chosenLetter;
var row = 1;
var index = 0;
var gameOver = false;
var awaitingGuess = false;
var isInputLocked = false;

const currentStyle = document.getElementById("theme-style").getAttribute("href");
isComic = currentStyle.includes("comic.css");

$(document).keydown(async function(event) {
    inputLetter(event.key.toUpperCase());
});

async function makeGuess(word) {
    const isValid = await checkDictionaryTrue(word);

    if(isValid) {

        if(word === randomWord) {
            await correctLetters(word, randomWord);
            if(row === 6 ) {
                if(isComic) {showComicMessage("omg", 750);}
                dance(row);
            }
            else {
                let ran = Math.floor(Math.random() * 4 + 1);
                if(isComic) {showComicMessage(`win${ran}`, 750);}
                dance(row);
                if(isComic) {$(".row" + row).children().addClass("explode");
                await pause(300)
                $(".row" + row).children().removeClass("explode");}

        
            }
            if(isComic) {confettiExplosion(row);}
            gameOver = true;
        }
        else {
            if(row === 6) {
                await correctLetters(word, randomWord);
                showMessage(randomWord);
                if(isComic) {showComicMessage("zap", 750);}
                gameOver = true;
            } 
            else {
                await correctLetters(word, randomWord);
                row++;
                index = 0;
                chosenWordArray = [];
            }
        }
    }
}

async function correctLetters(word, randomWord) {
    let greenLetters = {};
    let yellowLetters = {};
    
    function countCharacters(str, char) {
        return str.split('').reduce(function(count, currentChar) {
            return currentChar === char ? count + 1 : count;
        }, 0);
    }

    for(let i = 0; i < 5; i++) {
        if(word[i] === randomWord[i]) {
            greenLetters[word[i]] = (greenLetters[word[i]] || 0) + 1;
        }
    }

    for(let i = 0; i < 5; i++) {

        if(word[i] === randomWord[i]) {
            $(".row" + row).children().eq(i).addClass("green").addClass("flipped").removeClass("frame").removeAttr("style").addClass("glossy").addClass("flipped-frame");
        }
        else if(randomWord.includes(word[i]) && countCharacters(randomWord, word[i]) > ((greenLetters[word[i]] || 0) + (yellowLetters[word[i]] || 0))) {
            $(".row" + row).children().eq(i).addClass("yellow").addClass("flipped").removeClass("frame").removeAttr("style").addClass("glossy").addClass("flipped-frame");;
            yellowLetters[word[i]] = (yellowLetters[word[i]] || 0) + 1;
        }
        else {
            $(".row" + row).children().eq(i).addClass("gray").addClass("flipped").removeClass("frame").removeAttr("style").addClass("flipped-frame");
        } 

        await pause(350);
        $(".row" + row).children().eq(i).removeClass("flipped");

    }

    for(let i = 0; i < 5; i++) {

        if(word[i] === randomWord[i]) {
            pressKey(word[i], "green");
        }
        else if(randomWord.includes(word[i])) {
            pressKey(word[i], "yellow");
        }
        else {
            pressKey(word[i], "gray");
        } 
    }
}

function popLetter(tile) {
    tile.addClass("pop");
    setTimeout(function() {
        tile.removeClass("pop");
    }, 100);
    tile.toggleClass("frame");
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function showMessage(msg) {
    if(isComic) {
    $("#answer-message").text(msg).removeClass("hidden");
    setTimeout(function() {$("#answer-message").addClass("hidden");}, 2000);
    }
    else {
        $("#message").text(msg).removeClass("hidden");
        setTimeout(function() {$("#message").addClass("hidden");}, 1000);
    }
}

function showComicMessage(word, duration) {
    new Audio('./Sounds/bang.mp3').play();
    const img = document.getElementById("msg-img");
    img.src = `./Images/explosions/${word}.png`;
    $("#message").removeClass("hidden");
    setTimeout(function () {
        $("#message").addClass("hidden");
    }, duration);
}


async function dance(row) {
    for(let i = 0; i < 5; i++) {
        $(".row" + row).children().eq(i).addClass("dance");
        await pause(100);
    }
}

$("button").click(function() {
    inputLetter($(this).text().toUpperCase());
    this.blur();
});

async function inputLetter(key) {
    if (gameOver || awaitingGuess || isInputLocked) {return;}

    if(key === "BACKSPACE" || key === "DELETE" || key === "⌫") {
        if(index > 5) {
            index = 5;
        }
        if(index > 0) {
            index--;
            chosenWordArray.pop();
            $(".row" + row).children().eq(index).html(``).removeClass("glossy").toggleClass("frame");

            $(".delete").addClass("pressed");
            isInputLocked = true;
            await pause(30);
             isInputLocked = false;
            $(".delete").removeClass("pressed");
            if(isComic) {new Audio("./Sounds/typing.mp3").play();}
        };
        
    } 
    else if(key === "ENTER"){
        $(".enter").addClass("pressed");
        isInputLocked = true;
        await pause(30);
        isInputLocked = false;
        $(".enter").removeClass("pressed");
        if(isComic) {new Audio("./Sounds/typing.mp3").play();}

        if(index >= 5) {
            
            awaitingGuess =  true;
            await makeGuess(chosenWordArray.join(""));
            awaitingGuess = false;
        }
        else {
            if(isComic) {showComicMessage("oops", 500);} 
            else {showMessage("Not enough letters")}

            shake(row);
        }
    }    
    else if(/^[A-Z]$/.test(key) && index < 5) {

        const $button = $(`.key button`).filter(function () {
            return $(this).text() === key;
        });
        const $keyDiv = $button.closest(".key");

        $keyDiv.addClass("pressed");
        await pause(30);
        $keyDiv.removeClass("pressed");

        $(".row" + row).children().eq(index).html(`<p>${key}</p>`);
        popLetter($(".row" + row).children().eq(index));
      
        index++;
        chosenWordArray.push(key);
        if(isComic) {new Audio("./Sounds/typing.mp3").play();}
    }
    if(chosenWordArray.length > 5) {
        chosenWordArray = chosenWordArray.slice( 0, 5);
    }
}

function pressKey(key, color) {
    if(key !== "E") {
        $(`#game-board button:contains('${key}')`).addClass(color);
    }
    else {
        $(`#game-board k1 button:contains('${key}')`).addClass(color);
    }
}

async function checkDictionaryTrue(word) {

    if(wordBank.includes(word.toLowerCase())){
        return true;
    }
    else {
        if(isComic) {showComicMessage("smack", 500);}
        else {showMessage("Not enough letters")}
        shake(row);
        return false;
    }
}

async function shake(row) {
    for(let i = 0; i < 5; i++) {
        $(".row" + row).children().eq(i).addClass("shake");
    }

    await pause(350);
    $(".row" + row).children().removeClass("shake");
}

if(isComic) {
    $('.tile').each(function () {
      const randDeg = Math.floor(Math.random() * 360);
      const filterVal = `hue-rotate(${randDeg}deg) saturate(3)`;
      $(this).css('filter', filterVal);
    });
}

function confettiExplosion(row) {
    const rowTop = $(".row" + row).offset().top;
    const windowHeight = $(window).height();
    const originY = rowTop / windowHeight;

  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: originY * 2 } //change it so that height matches row
  });
}

$("#reveal-button").click(function () {
  if(isComic) {const sound = new Audio('./Sounds/button.mp3');
  sound.currentTime = 0;
  sound.play();}

  $('h1').text(randomWord);

  setTimeout(function () {
    $('h1').text('Wordle');
  }, 3000);
});

$('#toggle-mode').change(function () {
  const styleLink = document.getElementById("theme-style");
  const sound = new Audio('./Sounds/switch.mp3');
  sound.currentTime = 0;
  sound.play();

  if (this.checked) {
    styleLink.href = "comic.css";
    isComic = true;
  } else {
    styleLink.href = "classic.css";
    isComic = false;
  }

  glitchEffect();
});

async function glitchEffect(duration = 200) {
  const styleLink = document.getElementById("theme-style");
  const originalHref = styleLink.getAttribute("href");

  let isComicTheme = originalHref.includes("comic.css");
  let startTime = performance.now();

  $("body").addClass("glitchy glitch-overlay");

  const interval = setInterval(() => {

    styleLink.href = isComicTheme ? "classic.css" : "comic.css";
    isComicTheme = !isComicTheme;
  }, 30);

  await pause(duration);

  clearInterval(interval);
  styleLink.href = originalHref;

  $("body").removeClass("glitchy glitch-overlay");
}

//add glitch sound