"use strict";
//@ts-ignore
const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const log = document.getElementById("log");
const gameForm = document.getElementById("game");
const startForm = document.getElementById("startgame");
const startBtn = startForm.querySelector("#gamestart");
//@ts-ignore
startForm.hidden = true;
log.hidden = true;
gameForm.hidden = true;
//@ts-ignore
room.hidden = true;
let roomName;
/**
 * message form 에입력된 message를
 * 화면에 보여줍니다.
 * @param message :string
 */
const addMessage = function (message) {
    const ul = log.querySelector("#chat");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
    if (ul.childElementCount > 8) {
        const target = ul.firstElementChild;
        const save = target.innerHTML;
        socket.emit("chat_full", roomName, save);
        target.remove();
    }
};
/**
 * 메시지를 서버에 전송합니다.
 * -해당 방에 출력됩니다.
 */
const handleMessageSubmit = function (event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    //@ts-ignore
    const value = input.value;
    socket.emit("new_message", value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    //@ts-ignore
    input.value = "";
};
/**
 *닉네임을 설정합니다.
 *해당 방에 닉네임을 공지합니다.
 * @param event :submit
 */
const handleNicknameSubmit = function (event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    //@ts-ignore
    const value = input.value;
    socket.emit("nickname", value, roomName, () => {
        addMessage(`you changed nickname: ${value}`);
    });
    //@ts-ignore
    input.value = "";
};
/**
 * 메인화면을 치우고
 * 방을 보여줍니다.
 */
const showRoom = function () {
    welcome.hidden = true;
    room.hidden = false;
    log.hidden = false;
    log.classList.add("makeflex");
    room.classList.add("makeflex");
    startForm.hidden = false;
    const h3 = room.querySelector("h3");
    h3.textContent = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
    const nameForm = room.querySelector("#name");
    nameForm.addEventListener("submit", handleNicknameSubmit);
};
/**
 * 유저가 입력한 방에
 * 서버를통해 입장합니다.
 *
 * @param event: "submit"
 */
const handleRoomSubmit = function (event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
};
form.addEventListener("submit", handleRoomSubmit);
/**
 *
 *
 */
socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});
socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left..`);
});
socket.on("new_message", addMessage);
/**
 * 메인화면의
 * 방 목롭을 보여줍니다.
 */
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("#roomlist");
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    });
});
/**
 * solo gaming part
 */
const addGameMessage = function (message) {
    const ul = log.querySelector("#blackjack");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
    if (ul.childElementCount > 5) {
        const target = ul.firstElementChild;
        target.remove();
    }
};
const cards = [[1, "🂱"], [2, "🂲"], [3, "🂳"],
    [4, "🂴"], [5, "🂵"], [6, "🂶"], [7, "🂷"],
    [8, "🂸"], [9, "🂹"], [10, "🂺"], [10, "🂻"],
    [10, "🂼"], [10, "🂽"], [10, "🂾"], [11, "🂡"]];
const length_cards = cards.length;
const create_random_index = function () {
    return Math.floor(Math.random() * length_cards);
};
const give_card = function (index) {
    const card = cards[index];
    return card;
};
const calculate_score = function (usercard) {
    let score = 0;
    usercard.forEach((each_card) => {
        score += each_card[0];
    });
    if (score > 21) {
        return 0;
    }
    else if (score === 21) {
        return 100;
    }
    else {
        return score;
    }
};
const check_result = function (score_fisrt, score_second = 50) {
    if (score_fisrt === 0 || score_second === 0 || score_fisrt === 100) {
        return false;
    }
    else {
        return true;
    }
};
const init_round = function () {
    while (user_cards.length > 0) {
        user_cards.pop();
    }
    while (dealer_cards.length > 0) {
        dealer_cards.pop();
    }
    round_playing = true;
    dealer_drawing = true;
    dealer_score = 0;
    user_score = 0;
};
const start_round = function () {
    round_count += 1;
    console.log(`start ${round_count}`);
    let user_index = create_random_index();
    let user_draw = give_card(user_index);
    user_cards.push(user_draw);
    user_index = create_random_index();
    user_draw = give_card(user_index);
    user_cards.push(user_draw);
    let dealer_index = create_random_index();
    let dealer_draw = give_card(dealer_index);
    dealer_cards.push(dealer_draw);
    dealer_index = create_random_index();
    dealer_draw = give_card(dealer_index);
    dealer_cards.push(dealer_draw);
    user_score = calculate_score(user_cards);
    dealer_score = calculate_score(dealer_cards);
    round_playing = check_result(user_score, dealer_score);
};
const hit_stand_double = function () {
    gameForm.hidden = false;
};
const deal = function () {
    if (dealer_score === 0) {
        dealer_drawing = false;
    }
    while (dealer_drawing) {
        const dealer_index = create_random_index();
        const dealer_draw = give_card(dealer_index);
        dealer_cards.push(dealer_draw);
        dealer_score = calculate_score(dealer_cards);
        if (dealer_score > 17 || dealer_score < 1) {
            dealer_drawing = false;
            break;
        }
    }
};
const choose_winner = function () {
    if (user_score == dealer_score) {
        socket.emit("end_game", "draw😊", roomName);
        return `draw your cards: ${user_cards} dealer's cards: ${dealer_cards}`;
    }
    else if (user_score > dealer_score) {
        socket.emit("end_game", "win😎", roomName);
        return `you win!! your cards: ${user_cards} dealer's cards: ${dealer_cards}`;
    }
    else {
        socket.emit("end_game", "lose😂", roomName);
        return `you lose. your cards: ${user_cards} dealer's cards: ${dealer_cards}`;
    }
};
let round_count = 0;
let round_playing = false;
let dealer_drawing = false;
let user_score = 0;
let dealer_score = 0;
const user_cards = [];
const dealer_cards = [];
startBtn.addEventListener("click", (event) => {
    event.preventDefault();
    startForm.hidden = true;
    gameForm.hidden = false;
    init_round();
    start_round();
    socket.emit("game_start", `your hands: ${user_cards} \n dealer's first card: ${dealer_cards[0]} \n choice button hit or stand or double`, roomName, hit_stand_double);
});
const hit = gameForm.querySelector("#hit");
const stand = gameForm.querySelector("#stand");
const double = gameForm.querySelector("#double");
hit.addEventListener("click", (event) => {
    event.preventDefault();
    gameForm.hidden = true;
    const user_index = create_random_index();
    const user_draw = give_card(user_index);
    user_cards.push(user_draw);
    user_score = calculate_score(user_cards);
    round_playing = check_result(user_score, dealer_score);
    if (round_playing) {
        gameForm.hidden = false;
    }
    else {
        deal();
        addGameMessage(choose_winner());
        gameForm.hidden = true;
        startForm.hidden = false;
    }
});
stand.addEventListener("click", (event) => {
    event.preventDefault();
    gameForm.hidden = true;
    deal();
    addGameMessage(choose_winner());
    startForm.hidden = false;
});
double.addEventListener("click", (event) => {
    event.preventDefault();
    gameForm.hidden = true;
    const user_index = create_random_index();
    const user_draw = give_card(user_index);
    user_cards.push(user_draw);
    user_score = calculate_score(user_cards);
    round_playing = check_result(user_score, dealer_score);
    if (round_playing) {
        gameForm.hidden = false;
    }
    else {
        deal();
        addGameMessage(choose_winner());
        gameForm.hidden = true;
        startForm.hidden = false;
    }
});
socket.on("game_start", (msg) => {
    addGameMessage(msg);
});
