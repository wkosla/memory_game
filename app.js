var cardsList = [],
    cardsNodes = [],
    flippedCards = [],
    cards = [],
    cardSrcs = [],
    hintCards = [],
    cardsOther = [],
    playable, players, currentPlayer;

document.querySelector('.board_container').classList.toggle('loading');
init();

setTimeout(function() {
    document.querySelector('.board_container').classList.toggle('loading');
    cardsList.forEach(function(current) {
        current.classList.toggle('board_item-loading');
    });
    playable = true;
}, 5000);

document.querySelector('.btn-new').addEventListener('click', shuffle);
document.querySelector('.btn-hint').addEventListener('click', hint);

cardsList.forEach(function(current) {
    current.addEventListener('click', function() {
        click(current)
    });
});

function click(current) { // runs when player click a card
    if (!playable || current.classList.value === 'board_item checked' || current.firstChild.classList.value === 'board_img uncovered') { // checks if the game status is playable and if the card you clicked on isnt already guessed
        return;
    };

    flippedCards.push(current); // pushes the clicked card into the flippedCards array
    toggleImg(current); // toggles classes on the clicked card to make it visible

    if (flippedCards.length === 2) { // checks if there are two flipped cards at the moment
        playable = false; // for the time of comparing the cards, the game status is changed to false, so players cant flip more cards at the same time

        if (flippedCards[0].firstChild.src === flippedCards[1].firstChild.src) { // compares the src of the two flipped cards to see if they match
            setTimeout(function() {
                correct(current)
            }, 1000);
        } else {
            setTimeout(wrong, 1000);
        };
    };
}

function wrong() { // runs when the cards doesnt match
    flippedCards.forEach(function(cur) { // if the cards dont match, they flip back again after a second
        toggleImg(cur);
    });
    flippedCards = [];
    playable = true;
    getCurrentPlayer('label').classList.toggle('active');
    currentPlayer === 0 ? currentPlayer = 1 : currentPlayer = 0; // switches current player
    getCurrentPlayer('label').classList.toggle('active');
}

function correct(current) { // runs when the cards match
    flippedCards.forEach(function(cur) {
        cur.classList.toggle('checked'); // if they match, they get the "checked" class and get excluded from the rest of the game

        for (var i = 0; i < cardsOther.length; i++) { // removes the guessed card from the array, so it wont be picked for a hint again
            if (cardsOther[i].firstChild.src === current.firstChild.src) {
                cardsOther.splice(i, 1);
            }
        }
    });

    hintCards = []; // empties the hintCards array so the next time players clicks 'Hint!' he gets a new set of hinted cards
    flippedCards = [];
    playable = true; // changes the game status back to playable
    players[currentPlayer].score += 1; // updates current player's score in the players object
    getCurrentPlayer('score').textContent = players[currentPlayer].score;
    // document.querySelector('.header_p' + currentPlayer + 'score').textContent = players[currentPlayer].score; // and on the UI

    if (players[0].score + players[1].score === 14) { // checks if the max score has been achieved, which means the game has ended
        gameEnd();
    };
}

function gameEnd() { // runs when the game is over

    playable = false;

    if (players[0].score > players[1].score) { // if it did, it check which players has higher score and declares him a winner
        winner(0);
    } else if (players[0].score < players[1].score) {
        winner(1);
    } else { // if they have the same score, there is a draw
        document.querySelector('.header_p0name').textContent = 'DRAW!';
        document.querySelector('.header_p1name').textContent = 'DRAW!';
        if (currentPlayer === 0) {
            document.querySelector('.header_p1label').classList.add('active');
        } else {
            document.querySelector('.header_p0label').classList.add('active');
        }
    };

    document.querySelector('.btn-new').textContent = 'New Game!'; // changes the 'Shuffle!' button to 'New Game!' button
    document.querySelector('.btn-hint').style.display = 'none';

    cardsList.forEach(function(el) {
        el.classList.remove('checked');
    });
}

function shuffle() { // resets the board and reshuffles all the cards
    cardsList.forEach(function(el) {
        el.classList.toggle('shuffled');
    })
    init();
    playable = true;
    document.querySelector('.btn-new').textContent = 'Shuffle!';
}

function init() { // init function

    playable = false;
    currentPlayer = 0;
    players = [{
        player: 0,
        score: 0,
        hints: 4
    }, {
        player: 1,
        score: 0,
        hints: 4
    }];

    document.querySelector('.header_p0name').textContent = 'Player 1';
    document.querySelector('.header_p1name').textContent = 'Player 2';
    document.querySelector('.header_p0score').textContent = '0';
    document.querySelector('.header_p1score').textContent = '0';
    document.querySelector('.header_p0label').classList.value = 'header_p0label active';
    document.querySelector('.header_p1label').classList.value = 'header_p1label';

    document.querySelector('.btn-hint').style.display = 'inline-block';

    document.querySelector('.header_p0hints').firstChild.nextSibling.textContent = 4;
    document.querySelector('.header_p1hints').firstChild.nextSibling.textContent = 4;

    cardsNodes = document.querySelectorAll('.board_item');
    // cardsList = Array.from(cardsNodes); // converts the Node List to an array
    cardsList = Array.prototype.slice.call(cardsNodes); // converts the Node List to an array

    cardsList.forEach(function(current) {

        current.classList.remove('checked')
        current.firstChild.classList.remove('covered');
        current.firstChild.classList.remove('uncovered');
        current.firstChild.classList.add('covered');

        cards.push(current.firstChild.id); // an array of card IDs

        cardsOther.push(current);

    });

    var i = 0;

    while (cardSrcs.length < 14) { // creates an array of img sources
        i = i.toString();
        if (i.length === 1) {
            i = '0' + i;
        }
        cardSrcs.push('https://source.unsplash.com/random/300x3' + i);
        i = parseInt(i);
        i++;
    };

    while (cards.length > 0) { // assigns the img sources to random cards on the board
        var cardOne, cardTwo, imgSrc;

        cardOne = randomizer(cards);
        cardTwo = randomizer(cards);
        imgSrc = randomizer(cardSrcs);

        document.getElementById(cardOne).src = document.getElementById(cardTwo).src = imgSrc;
    };

};

function hint() { // resposible for hinting cards

    if (flippedCards.length !== 0 || !playable) {
        return;
    }

    if (hintCards.length === 0 && players[currentPlayer].hints > 0) { // will only select new hint cards if the previous ones have been uncovered and if the player has enough hints left

        var hintOne, hintTwo;

        hintOne = randomizer(cardsOther); // pick a random card
        for (var i = 0; i < cardsOther.length; i++) {
            if (cardsOther[i].firstChild.src === hintOne.firstChild.src && cardsOther[i].firstChild.id !== hintOne.firstChild.id) { // finds it's match
                hintTwo = cardsOther[i]
                cardsOther.splice(i, 1);
            }
        }
        hintThree = cardsOther[Math.floor(Math.random() * cardsOther.length)]; // pick a third random card, different from the previous two

        // puts all three cards into the hintCards array
        hintCards.push(hintOne);
        hintCards.push(hintTwo);
        hintCards.push(hintThree);

        // decreases the current player's amount of hints left
        players[currentPlayer].hints--;
        getCurrentPlayer('hints').firstChild.nextSibling.textContent = players[currentPlayer].hints;
        // document.querySelector('.header_p' + currentPlayer + 'hints').firstChild.nextSibling.textContent = players[currentPlayer].hints;

    } else if (players[currentPlayer].hints === 0 && hintCards.length === 0) { // if the player clicks on 'Hint!' button when he doesn't have any left, it gets highlighted for a split second
        getCurrentPlayer('hints').classList.add('hints-none');
        // document.querySelector('.header_p' + currentPlayer + 'hints').classList.add('hints-none');
        setTimeout(function() {
            getCurrentPlayer('hints').classList.remove('hints-none');
            // document.querySelector('.header_p' + currentPlayer + 'hints').classList.remove('hints-none');
        }, 500);
    }

    hintCards.forEach(function(el) { // adds the hint class to hinted cards
        el.classList.add('hint');
    });

    setTimeout(function() { // after a second, the hint class is being removed
        hintCards.forEach(function(el) {
            el.classList.remove('hint');
        });
    }, 1000);

};

function getCurrentPlayer(string) {
    return document.querySelector('.header_p' + currentPlayer + string);
}

function winner(player) {
    document.querySelector('.header_p' + player + 'name').textContent = 'WINNER!';
    document.querySelector('.header_p' + player + 'label').classList.toggle('winner');
    document.querySelector('.header_p1label').classList.remove('active');
    document.querySelector('.header_p0label').classList.remove('active');
}

function randomizer(arr) {
    card = arr[Math.floor(Math.random() * arr.length)]; // picks a random position from an array
    remove(arr, card);
    return card;
};

function remove(arr, card) {
    var remove;
    remove = arr.indexOf(card);
    arr.splice(remove, 1);
}

function toggleImg(el) {
    el.firstChild.classList.toggle('covered');
    el.firstChild.classList.toggle('uncovered');
};
