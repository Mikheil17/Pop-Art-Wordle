var randomWord = randomWordsList[Math.floor(Math.random() * randomWordsList.length)].toUpperCase();
console.log(randomWord);

var chosenWord = "";
var chosenLetter;
var row = 1;
var index = 0;
var gameOver = false;
var awaitingGuess = false;

$(document).keydown(async function(event) {
    inputLetter(event.key.toUpperCase());
});

async function makeGuess(word) {
    const isValid = await checkDictionaryTrue(word);

    if(isValid) {

        if(word === randomWord) {
            await correctLetters(word, randomWord);
            if(row === 6 ) {
                showComicMessage("omg", 750);
                dance(row);
            }
            else {
                let ran = Math.floor(Math.random() * 4 + 1);
                showComicMessage(`win${ran}`, 750);
                dance(row);
                $(".row" + row).children().addClass("explode");
                await pause(300)
                $(".row" + row).children().removeClass("explode");

        
            }
            confettiExplosion(row);
            gameOver = true;
        }
        else {
            if(row === 6) {
                await correctLetters(word, randomWord);
                showMessage(randomWord);
                showComicMessage("zap", 750);
                gameOver = true;
            } 
            else {
                await correctLetters(word, randomWord);
                row++;
                index = 0;
                chosenWord = "";
            }
        }
    }
}

async function correctLetters(word, randomWord) {

    for(let i = 0; i < 5; i++) {

        if(word[i] === randomWord[i]) {
            $(".row" + row).children().eq(i).addClass("green").addClass("flipped").removeClass("frame").removeAttr("style").addClass("glossy");
        }
        else if(randomWord.includes(word[i])) {
            $(".row" + row).children().eq(i).addClass("yellow").addClass("flipped").removeClass("frame").removeAttr("style").addClass("glossy");
        }
        else {
            $(".row" + row).children().eq(i).addClass("gray").addClass("flipped").removeClass("frame").removeAttr("style");
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
    $("#answer-message").text(msg).removeClass("hidden");
    setTimeout(function() {$("#answer-message").addClass("hidden");}, 2000);
}

function showComicMessage(word, duration) {
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

async function inputLetter(key) { //word messes up sometimes and includes last letter of previous guess or deleted key
    if (gameOver || awaitingGuess) {return;}

    if(key === "BACKSPACE" || key === "DELETE" || key === "⌫") {
        if(index > 5) {
            index = 5;
        }
        if(index > 0) {
            index--;
            chosenWord = chosenWord.slice(0, -1);
            $(".row" + row).children().eq(index).html(``).removeClass("glossy").toggleClass("frame");

            $(".delete").addClass("pressed");
            await pause(100);
            $(".delete").removeClass("pressed");
        };
        
    } 
    else if(key === "ENTER"){
        $(".enter").addClass("pressed");
        await pause(100);
        $(".enter").removeClass("pressed");

        if(index >= 5) {
            
            awaitingGuess =  true;
            await makeGuess(chosenWord);
            awaitingGuess = false;
        }
        else {
            showComicMessage("oops", 500);
            shake(row);
        }
    }    
    else if(/^[A-Z]$/.test(key) && index < 5) {

        const $button = $(`.key button`).filter(function () {
            return $(this).text() === key;
        });
        const $keyDiv = $button.closest(".key");

        $keyDiv.addClass("pressed");
        await pause(100);
        $keyDiv.removeClass("pressed");

        $(".row" + row).children().eq(index).html(`<p>${key}</p>`);
        popLetter($(".row" + row).children().eq(index));
      
        index++;
        chosenWord += key;
    }

}

function pressKey(key, color) {
    if(key !== "E") {
        $(`button:contains('${key}')`).addClass(color);
    }
    else {
        $(`.k1 button:contains('${key}')`).addClass(color);
    }
}

async function checkDictionaryTrue(word) {

    if(wordBank.includes(word.toLowerCase())){
        return true;
    }
    else {
        showComicMessage("smack", 500);
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

$('.tile').each(function () {
      const randDeg = Math.floor(Math.random() * 360);
      const filterVal = `hue-rotate(${randDeg}deg) saturate(3)`;
      $(this).css('filter', filterVal);
    });

function confettiExplosion(row) {
    const rowTop = $(".row" + row).offset().top;
    const windowHeight = $(window).height();
    const originY = rowTop / windowHeight;

  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: originY * 3 } //change it so that height matches row
  });
}