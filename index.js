// var wordBank = ["apple", "snake", "orate", "phone", "slimy"];
var randomWord = randomWordsList[Math.floor(Math.random() * randomWordsList.length)].toUpperCase();
console.log(randomWord);

var chosenWord = "";
var chosenLetter;
var row = 1;
var index = 0;
var gameOver = false;

$(document).keydown(async function(event) {
    inputLetter(event.key.toUpperCase());
});

async function makeGuess(word) {
    const isValid = await checkDictionaryTrue(word);

    if(isValid) {

        if(word === randomWord) {
            await correctLetters(word, randomWord);
            if(row === 6 ) {
                showMessage("Phew");
                dance(row);
            }
            else {
                showMessage("Good Job!");
                dance(row);
            }
            gameOver = true;
        }
        else {
            if(row === 6) {
                await correctLetters(word, randomWord);
                showMessage(randomWord);
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
            $(".row" + row).children().eq(i).addClass("green").addClass("flipped").addClass("flipped-frame");
        }
        else if(randomWord.includes(word[i])) {
            $(".row" + row).children().eq(i).addClass("yellow").addClass("flipped").addClass("flipped-frame");
        }
        else {
            $(".row" + row).children().eq(i).addClass("gray").addClass("flipped").addClass("flipped-frame");
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
    $("#message").text(msg).removeClass("hidden");
    setTimeout(function() {$("#message").addClass("hidden");}, 1500);
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
    if (gameOver) {return;}

    if(key === "BACKSPACE" || key === "DELETE" || key === "⌫") {
        if(index > 0) {
            index--;
            chosenWord = chosenWord.slice(0, -1);
            $(".row" + row).children().eq(index).html(``).toggleClass("frame");
        };
        
    } 
    else if(/^[A-Z]$/.test(key) && index < 5) {

        $(".row" + row).children().eq(index).html(`<p>${key}</p>`);
        popLetter($(".row" + row).children().eq(index));
      
        index++;
        chosenWord += key;
    }
    else if(key === "ENTER"){
        if(index === 5) {
            await makeGuess(chosenWord);
        }
        else {
            incorrect("Not enough letters");
        }
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
        incorrect("Not in word list");
        return false;
    }
}

function incorrect(message) {
    showMessage(message);
    shake(row);
}

async function shake(row) {
    for(let i = 0; i < 5; i++) {
        $(".row" + row).children().eq(i).addClass("shake");
    }

    await pause(350);
    $(".row" + row).children().removeClass("shake");
}