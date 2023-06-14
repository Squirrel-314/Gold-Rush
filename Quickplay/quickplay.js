// Gold Rush v2
// Started April 11, 2023 by Editor Rust
// Last updated June 11, 2023
// The code is better now [citation needed]
// "Inspired" by Cookie Clicker

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Game data and information
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Inital data set seperatly for clearing save
const InitGameData = {
   // Gold, clicks', other game data
   test: "99",
   gold: 0,
   goldPerClick: 1,
   goldFromClicks: 0, // Used to be clickinGold
   clicks: 0,
   topGold: 67, // For pickaxe to show immediately
   goldSpent: 0,
   lastTick: Date.now(),
   dateStarted: new Date(), // Used to be startTime
   playerName: undefined,
   timePlayed: undefined, // Need to implement this 
   // Tools
   toolLevel: 1,
   improveToolCost: 100,
   // Settings
   settings: {
      sound: {
         music: false,
         click: true
      },
       canBuyIn: {
           upgrades: true,
           buildings: true
       }
   },
   // Buildings
   pickaxe: {
       amount: 0,
       cost: 100,
       profit: .2,
       upgrades: [false, false, false, false, false]
   },
   dwarf: {
       amount: 0,
       cost: 300,
       profit: 1,
       upgrades: [false, false]
   },
   goose: {
       amount: 0,
       cost: 1000,
       profit: 4,
       upgrades: [false, false]
   },
   mine: {
       amount: 0,
       cost: 8000,
       profit: 12,
       upgrades: [false, false]
   },
   dragon: {
       amount: 0,
       cost: 30000,
       profit: 35,
       upgrades: [false, false]
   },
   stone: {
      amount: 0,
      cost: 100000,
      profit: 100,
      upgrades: [false, false]
   },
   station: {
      amount: 0,
      cost: 400000,
      profit: 400,
      upgrades: [false, false]
   },
   leprechaun: {
      amount: 0,
      cost: 1500000,
      profit: 1200,
      upgrades: [false, false]
   },
   sheep: {
      amount: 0,
      cost: 6000000,
      profit: 4000,
      upgrades: [false, false]
   },
   ray: {
      amount: 0,
      cost: 20000000,
      profit: 10000,
      upgrades: [false, false]
   },
   merger: {
      amount: 0,
      cost: 100000000,
      profit: 40000,
      upgrades: [false, false]
   },
}
let GameData;

let buildings = ["pickaxe", "dwarf", "goose", "mine", "dragon", "stone", "station", "leprechaun", "sheep", "ray", "merger"];


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Save
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Check if save exists
let saveCheck = JSON.parse(localStorage.getItem("goldrushsave"));
if (saveCheck == "restarted") {
   // Start setup
   setup();
}
else if (!Object.is(saveCheck, null)) {
   // Sets data object to save
   GameData = JSON.parse(localStorage.getItem("goldrushsave"));
}
// If save does not exist, start setup
else {
   // Start setup
   setup();
}

function setup() {
   GameData = InitGameData;
   save();

   // Show introduction
   document.querySelector(".introduction").style.display = "block";
   // Get username
   document.querySelector(".name-input").addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
         event.preventDefault();
         GameData.playerName = document.querySelector(".name-input").value;
         document.querySelector(".introduction").style.display = "none";
         document.querySelector(".playerName").textContent = GameData.playerName + "'s Mine";
      }
   });
   // And set date started
   GameData.dateStarted = new Date();
}

// Saves GameData object to localstorage
function save() { localStorage.setItem("goldrushsave", JSON.stringify(GameData)); }

// Clear save
function clearSave() {
   if (confirm("Are you sure you want to clear your save?")) {
       if (confirm("You can't undo this!")) {
           GameData = "restarted";
           save();
           location.reload();
       }
   }
}

// Exports JSON save object
function exportData() {
   // Selects textbox from DOM, sets it's text as the JSON save, and copies it
   let textboxElement = document.querySelector(".exportdata");
   textboxElement.value = JSON.stringify(GameData);
   textboxElement.select();
   textboxElement.setSelectionRange(0, 99999); // For mobile
   navigator.clipboard.writeText(textboxElement.value);
   alert("Copied save data to clipboard!");
}

// Imports JSON save
function importData() {
   // Two confirmation popups
   if (confirm("This will delete your current save! Do you want to continue?")) {
       if (confirm("You can't undo this!")) {
           // Takes save through prompt, saves, and reloads
           let inputedData = prompt("Enter your save...");
           GameData = JSON.parse(inputedData);
           save();
           location.reload();
       }
   }
}

// Adds new game data to old saves
for (const [key, value] of Object.entries(InitGameData)) {
   if (typeof GameData[key] == "undefined") GameData[key] = value;
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Gold
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Based on counter code from Mozilla Web Docs
// This is seperatly to keep the gold varible safe from the global scope
const Game = (() => {
   let gold = 0;
   // Updates gold in save varibles and locally
   function changeBy(num) {
       gold += num;
       gold = Math.round(gold * 10) / 10;
       GameData.gold = gold;
       refreshDisplay();
   }
   function substract(num) {
       gold -= num;
       gold = Math.round(gold * 10) / 10;
       GameData.gold = gold;
       GameData.goldSpent += num;
       refreshDisplay();
   }
   function set(num) {
       gold = num;
       GameData.gold = gold;
       refreshDisplay();
   }
   // Updates values across game
   function refreshDisplay() {
       // Updates Gold display on page
       document.querySelector(".goldOwned").textContent = formatNum(gold) + " Gold";
       // And the detailed number
       document.querySelector(".goldOwned").title = gold.toLocaleString() + " Gold";
       // Updates page title to display Gold
       document.title = `${formatNum(gold)} Gold | Gold Rush`;
       // Checks if current Gold is record high
       if (gold > GameData.topGold) GameData.topGold = gold;
       // Checks if upgrades are now affordable
       upgrades();
       // Updates GPS and other values on page
       updatePage();
   }
   // Passes varibles back from closure
   return {
       add(num) { changeBy(num); },
       substract(num) { substract(num); },
       set(num) { set(num) },
       updatePage() { updatePage; }
   };
})();

// Adds gold per click amount to gold
function mineGold(click) {
   Game.add(GameData.goldPerClick);
   if (click) GameData.clicks++;
   if (GameData.settings.sound.click) {
      let clicksound = new Audio("Audio/clinck.mp3");
      clicksound.play();
      setTimeout(() => { clicksound = null; }, 1000);
   }
}

// Mine gold on spacebar press
document.body.onkeyup = (e) => { if (e.key == " ") mineGold(false); }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Buildings
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Improving tools will increase how much gold is gained when mining
function improveTools() {
   // If player has enough gold
   if (GameData.gold >= GameData.improveToolCost) {
       // Remove cost, multiply GPC by 2, increase tool level and double cost
       Game.substract(GameData.improveToolCost);
       GameData.goldPerClick++;
       GameData.toolLevel++;
       GameData.improveToolCost *= 2;
       updatePage();
   }
}

// General function for the purchase of Gold-producing items
function obtain(item) {
   if (document.querySelector(`.${item}`).dataset.disabled == "false") {
       Game.substract(GameData[item]["cost"]);
       GameData[item]["cost"] = Math.round(GameData[item]["cost"] * 1.15);
       GameData[item]["amount"]++;
       updatePage();
   }
}

// Calculates time until building is affordable
function affordableIn(amount) {
   if (amount <= GameData.gold) return "now";
   let amountNeeded = amount - GameData.gold;
   let secondsNeeded = amountNeeded / calcGPS();
   if (calcGPS() == 0) return "never";
   return "in " + formatTime(secondsNeeded * 1000);
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// PROFIT!
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Run every second to provide Gold from buildings
const profitLoop = setInterval(() => {
   // Adds GPS to Gold variable
   Game.add(calcGPS());
   GameData.lastTick = Date.now();
   // Save
   save();
}, 1000);

// Loops through all buildings and finds total profits from all revenue sources
function calcGPS() {
   let gps = 0;
   buildings.forEach((building) => {
       gps += GameData[building]["profit"] * GameData[building]["amount"];
   });
   return gps;
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Update page
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Updates page to reflect GameData values
function updatePage() {

   // Updates all gold values on page

   document.querySelector(".otherGoldInfo").textContent = `${formatNum(GameData.goldPerClick)} Gold per Click and ${formatNum(calcGPS())} Gold per Second`;
   document.querySelector(".tools .name").textContent = `Improve Tools - Costs ${formatNum(GameData.improveToolCost)} Gold (lvl. ${formatNum(GameData.toolLevel)})`;
   // Loops through all buildings and updates information on page
   buildings.forEach((building) => {
      document.querySelector(`.${building} .name`).textContent = `${capitalize(building)} - Costs ${formatNum(GameData[building]["cost"])} Gold (you've got ${formatNum(GameData[building]["amount"])})`;
      document.querySelector(`.${building} .info`).textContent = `produces ${formatNum(GameData[building]["profit"])} GPS each, ${formatNum(GameData[building]["profit"] * GameData[building]["amount"])} GPS together and ${percent(GameData[building]["profit"] * GameData[building]["amount"], calcGPS())}% of your total GPS`;
   });
   // Display gold per minute, hour, day, and year
   document.querySelector(".moreGoldInfo").innerHTML = `${toWord(calcGPS() * 60)} Gold Per Minute
                                                      <br> ${toWord(calcGPS() * 60 * 60)} Gold Per Hour
                                                      <br> ${toWord(calcGPS() * 60 * 60 * 24)} Gold Per Day
                                                      <br> ${toWord(calcGPS() * 60 * 60 * 24 * 7 * 4 * 12)} Gold Per Year`;
   // Display total gold earned
   document.querySelector(".totalGold").innerHTML = toWord(GameData.goldSpent + GameData.gold) + " Lifetime Gold Profits";
   // Display time since started
   document.querySelector(".timeSinceStarted").textContent = `You've been playing since ${GameData.startTime}`;
   // Display total gold spent
   document.querySelector(".totalGoldSpent").textContent = `You have invested ${toWord(GameData.goldSpent)} gold`;



   // Building affordablity/visibility

   // Tools
   if (GameData.improveToolCost > GameData.gold) document.querySelector(".tools").dataset.disabled = true;
   else document.querySelector(".tools").dataset.disabled = false;
   if (GameData.settings.canBuyIn.buildings) document.querySelector(".tools").querySelector(".canbuyin").textContent = "can afford " + affordableIn(GameData["improveToolCost"]);
   // For changing color
   if (GameData.improveToolCost > GameData.gold) document.querySelector(".tools").classList.add("cantafford");
   else document.querySelector(".tools").classList.remove("cantafford");

   // Other buildings
   buildings.forEach((building) => {
      // Finds whether building can be afforded
      if (GameData[building]["cost"] > GameData.gold) document.querySelector(`.${building}`).dataset.disabled = true;
      else document.querySelector(`.${building}`).dataset.disabled = false;
      // Chooses whether to display or hide building
      if (GameData[building]["cost"] <= GameData.topGold * 2.25) document.querySelector(`.${building}`).style.display = "inline-block";
      else document.querySelector(`.${building}`).style.display = "none";
      // For changing color
      if (GameData[building]["cost"] > GameData.gold) document.querySelector(`.${building}`).classList.add("cantafford");
      else document.querySelector(`.${building}`).classList.remove("cantafford");
      // Finds when building is affordable
      if (GameData.settings.canBuyIn.buildings) document.querySelector(`.${building}`).querySelector(".canbuyin").textContent = "can afford " + affordableIn(GameData[building]["cost"]);
   });
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Upgrades
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Creates the DOM elements for each upgrade
function createUpgradeElements() {
   // Loops through buildings
   buildings.forEach((building) => {
       // Loops through all upgrades
       for (let i = 0; i < GameInfo[building]["upgrades"].length; i++) {
           // If not complete, create and insert element
           if (!GameData[building]["upgrades"][i]) {
               let el = document.createElement("DIV");
               document.querySelector(".upgrades").appendChild(el);
               el.outerHTML = `
               <div class="upgrade upgrade-${building}-${i}" onclick="buyUpgrade('${building}', ${i})">
                   <h4>${GameInfo[building]["upgrades"][i][0]}</h4>
                   <p>${GameInfo[building]["upgrades"][i][1]}</p>
                   <i>${capitalize(building)} profits x2</i>
                   <p>Costs ${formatNum(GameInfo[building]["upgrades"][i][3])} Gold</p>
                   <p class="canaffordin"></p>
               </div>
               `;
           }
       }
   });
   // Then calls the upgrades function to make visible if available
   upgrades();
}

// Checks if upgrades are affordable, complete, or hidden
function upgrades() {
   buildings.forEach((building) => {
      for (let i = 0; i < GameInfo[building]["upgrades"].length; i++) {
         // If upgrade is not completed
         if (!GameData[building]["upgrades"][i]) {
            let upgradeEl = document.querySelector(`.upgrade-${building}-${i}`);
            // If buildings of type meets requirement
            if (GameData[building]["amount"] >= GameInfo[building]["upgrades"][i][2]) {
               upgradeEl.classList.remove("canafford");
               upgradeEl.classList.remove("cantafford");
               if (GameData.gold >= GameInfo[building]["upgrades"][i][3]) upgradeEl.classList.add("canafford");
               else upgradeEl.classList.add("cantafford");
            }
            // And show when it will be affordable
            if (GameData.settings.canBuyIn.upgrades) {
               if (document.querySelector(`.upgrade-${building}-${i}`) != null) {
                  document.querySelector(`.upgrade-${building}-${i}`).querySelector(".canaffordin").textContent = "can afford " + affordableIn(GameInfo[building]["upgrades"][i][3]);
               }
            }
         }
      }
   });
}

// Purchase upgrades
function buyUpgrade(building, index) {
   if (GameData.gold >= GameInfo[building]["upgrades"][index][3]) {
       // Removes cost from Gold
       Game.substract(GameInfo[building]["upgrades"][index][3]);
       // Doubles profits of building
       GameData[building]["profit"] *= 2;
       // Sets upgrade as complete and removes DOM element
       GameData[building]["upgrades"][index] = true;
       document.querySelector(`.upgrade-${building}-${index}`).remove();
   }
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// News
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Adds news for viewer enjoyment
function getNews() {
   // buildings, news
   let options = news[0];
   buildings.forEach((building, i) => {
       if (GameData[building]["amount"] > 0) options = options.concat(news[i + 1]);
   });
   document.querySelector(".news").textContent = options[Math.floor(Math.random() * options.length)];
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Onpageload
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Creates upgrade DOM elements
createUpgradeElements();

// When page finishes loading, update amount of gold displayed on page
Game.add(GameData.gold);

// And update page with all other values
updatePage();

// And set building descriptions
buildings.forEach((building) => { document.querySelector(`.${building} .hover`).textContent = GameInfo[building]["descr"]; });

// Set player name
document.querySelector(".playerName").innerHTML = GameData.playerName + "'s Mine";

// Give and display amount earned in abscence
let diff = Date.now() - GameData.lastTick;
GameData.lastTick = Date.now();
let goldEarned = Math.floor(calcGPS() * (diff / 1000));
Game.add(goldEarned);
if (diff > 5000) { notify(`While you were gone you earned ${toWord(goldEarned)} Gold`); }

// Setup special context menu
contextMenu();

// And get some fresh news
getNews();

// And make sure the news stays fresh
let refreshNews = setInterval(() => { getNews(); }, 15000);


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Settings
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Set myAudio to audio file
let music = new Audio("Audio/banjo-country.mp3");
music.loop = true;
function toggleMusic() { return music.paused ? music.play() : music.pause(); };

// Show time until affordable
function timeUntil(type) {
   GameData.settings.canBuyIn[type] = !GameData.settings.canBuyIn[type];
   notify(`Time Until for ${type} is now ${GameData.settings.canBuyIn[type] ? "on" : "off"}!`);
}

// Turn clicking sounds on or off
function clickSounds() {
   GameData.settings.sound.click = !GameData.settings.sound.click;
   notify(`Clicking Sounds are now ${GameData.settings.sound.click ? "on" : "off"}!`);
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Context Menu
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let rightClickMenu = document.querySelector("#menu").style;
function contextMenu() {
   document.addEventListener('contextmenu', function(e) {
      let posX = e.clientX;
      let posY = e.clientY;
      menu(posX, posY);
      e.preventDefault();
   }, false);
   document.addEventListener('click', function(e) {
      rightClickMenu.display = "none";
   }, false);
}
function menu(x, y) {
   rightClickMenu.top = y + "px";
   rightClickMenu.left = x + "px";
   rightClickMenu.display = "block";
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Useful functions and other code
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Remove and uppercase first character, then return with rest
function capitalize(word) { return word.charAt(0).toUpperCase() + word.slice(1); }

// Calculates percentage
function percent(part, whole) { return Math.round(((part / whole) * 100) * 10) / 10; }

// Alerts
function notify(text) {
   let alert = document.querySelector(".alert").cloneNode(true);
   document.querySelector(".alert-box").insertBefore(alert, document.querySelector(".alert-box").firstChild);
   alert.style.display = "flex";
   alert.textContent = text;
   alert.addEventListener("click", () => {
      alert.classList.add('alertAnimation');
      setTimeout(() => { alert.remove(); }, 400);
      clearTimeout(clearAlert);
   });
   setTimeout(() => { alert.classList.add('alertAnimation'); }, 6000);
   let clearAlert = setTimeout(() => { alert.classList.remove('alertAnimation');  alert.remove(); }, 6400);
}

// Scroll to section
function scrollToSection(id) {
   document.querySelector(`#page-${id}`).scrollIntoView();
   document.querySelector(`.active-tab`).classList.remove("active-tab");
   document.querySelector(`.tab-${id}`).classList.add("active-tab");
}

// Format time
function formatTime(ms) {
   let days = Math.floor(ms / 86400000);
   let hours = Math.floor((ms % 86400000) / 3600000);
   let minutes = Math.floor(((ms % 86400000) % 3600000) / 60000);
   let seconds = Math.floor(ms / 1000) - minutes * 60;
   let months = Math.floor(days / 30.4); // Average days per month
   let years = Math.floor(months / 12);
   if (days == 0) {
      if (minutes == 0) return `${seconds} ${seconds == 1 ? "second" : "seconds"}`;
      else if (hours == 0) return `${minutes} ${minutes == 1 ? "minute" : "minutes"} and ${seconds} ${seconds == 1 ? "second" : "seconds"}`;
      else return `${hours} ${hours == 1 ? "hour" : "hours"} and ${minutes} ${minutes == 1 ? "minute" : "minutes"}`;
   }
   else if (days < 31) return `${days} ${days == 1 ? "day" : "days"}`;
   else if (months < 12) return `about ${months} ${months == 1 ? "month" : "months"}`;
   else return `about ${years} ${years == 1 ? "year" : "years"}`;
}

// Patch for varible name in digit.js
function formatNum(number, type) { return toWord(number, type); }

// Let those player know they're being watched
let messages = ["No cheating!", "The garage door is open.", "I can't believe you switched to T-Mobile! How could you!", "C'mon, Windows? Why not Linux?", "Look behind you.", "Wait a moment... did you leave the stove on?", "Cheating, are you?", "Sssskkkeeeeeeeeee!"];
console.log(messages[Math.floor(Math.random() * messages.length)]);

// Check if mobile
if (isMobile() && !window.location.href.includes("mobile")) { window.location.href = "mobile.html"; }
else if (!isMobile() && !window.location.href.includes("play")) { window.location.href = "play.html"; }
function isMobile() { return ("ontouchstart" in document.documentElement); }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Ideas and such
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/*

// Issues
- Goes into negatives if clicks buy to quickly
- Does not show player name and gold in news

// Feature ideas
- Add images to upgrades
- Handle clicking upgrades
- Multibuy buildings
- Sell buildings
- Buy max
- Buy max upgrades
- Make news for only the rich
- Make import/export ui
- No need to save price of buildings, calculate it each time
- Turn settings into on/off buttons
- Partical effect for clicking
- Fix look of building displays
- Fix upgrades look

*/






/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// Disasters & Enchancements
//
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*
let luckyRoll = window.setInterval(function() {
   let rand = Math.random();
   // Bad Luck(8% chance)
   if (rand > .92) {
      if (gameData.dwarfNumber > 0) {
         let rand2 = Math.random();
         if (rand2 > .5) {
            gameData.dwarfNumber--;
            notify("A Dwarf has succumbed to the bad luck of the gods!");
         }
         else if (gameData.dwarfNumber > 10) {
            let dwarvesLost = Math.floor(Math.random() * 10) + 1;
            notify(`A mine shaft collapsed! ${dwarvesLost} dwarfs perished.`);
            gameData.dwarfNumber -= dwarvesLost;
         }
      }
   }
   // Good Luck (15% chance)
   if (rand > .85) {
      let bonusAmount = [1.5, 2, 2.5][Math.floor(Math.random() * 3)];
      notify(`${["Large underground gold reserve found!", "Old Ican temple with vast stores of gold found!"][Math.floor(Math.random() * 2)]} Gold earnings x${bonusAmount} for 30 seconds!`);
      document.getElementsByClassName("click-info")[0].classList.add("basic-info-pumped");
      document.getElementsByClassName("click-info")[1].classList.add("basic-info-pumped");
      document.getElementsByClassName("click-info")[2].classList.add("basic-info-pumped");
      bonusNumber = bonusAmount;
      setTimeout(resetBonus, 30000);
      function resetBonus() {
         bonusNumber = 1;
         document.getElementsByClassName("click-info")[0].classList.remove("basic-info-pumped");
         document.getElementsByClassName("click-info")[1].classList.remove("basic-info-pumped");
         document.getElementsByClassName("click-info")[2].classList.remove("basic-info-pumped");
      }
   }
}, 300000) // 5 minutes (Change this to varible)
*/


/*

let alert = document.querySelector(".alert");
let bonusNumber = 1; // multiplier for bonus gold, should re-impelement

function getCost(asset) {
   return (GameData[asset]["cost"] * Math.pow(1.15, GameData[asset]["cost"])).toFixed(0);
}





//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Research

   createUpgradeElement("c", 1, "dwarf", "dwarf.png", "Dwarf Academy!", "Complete with posh students!", "Dwarf profit x2");
   createUpgradeElement("c", 2, "dwarf", "dwarf.png", "Dwarf Managers!", "Down with the worker unions!", "Dwarf profit x2");
   createUpgradeElement("c", 3, "dwarf", "dwarf.png", "Mysterious Cafeteria Food!", "Your workers will become mysteriously obedient!", "Dwarf profit x2");
   createUpgradeElement("c", 4, "dwarf", "dwarf.png", "Paid Holidays!", "There's nothing someone won't do when you give them paid holidays!", "Dwarf profit x2");
   createUpgradeElement("c0", 1, "goose", "goose.png", "Healthier Diets!", "Make sure they get all the nutrients they need!", "Geese profit x2");
   createUpgradeElement("c0", 2, "goose", "goose.png", "Larger Flocks!", "More geese, more eggs!", "Geese profit x2");
   createUpgradeElement("c0", 3, "goose", "goose.png", "Advanced Mental Abilities!", "Dark magic is your greatest friend!", "Geese profit x2");
   createUpgradeElement("c0", 4, "goose", "goose.png", "Bigger Nesting Boxes!", "I don't even know how this will help!", "Geese profit x2");
   createUpgradeElement("d", 1, "mine", "mine.png", "Deeper Mines!", "Far over, the misty mountains cold... (Read The Hobbit)", "Mine profit x2");
   createUpgradeElement("d", 2, "mine", "mine.png", "Smaller Mineshafts!", "Saftey? Comfort? Who cares? Most certiantly not me, sitting here in my mansion. Why, I don't even know if I have clastrophpobia 'cause the smallest space i've ever been is my private limosine.");
   createUpgradeElement("d", 3, "mine", "mine.png", "Journey to the Center of the Earth!", "(let's hope that isn't copyrighted)", "Mine profit x2");
   createUpgradeElement("d", 4, "mine", "mine.png", "Holy Earth!", "The Earth is now so riddled with holes, the ground is constantly being torn apart by earthquakes", "Mine profit x2");
   createUpgradeElement("e", 1, "dragon", "dragon.png", "Dragon Gold Insurance!", "Switch to dragon gold insurance!");
   createUpgradeElement("e", 2, "dragon", "dragon.png", "Selective Breeding!", "Breed the greediest together, and get GREEDIER DRAGONS!(this may not be a good idea)");
   createUpgradeElement("e", 3, "dragon", "dragon.png", "Bad Habits!", "Sharing may be caring, but I don't care!");
   createUpgradeElement("e", 4, "dragon", "dragon.png", "Dragon Disease!", "More gold! MORE GOLD! <strong>MORE GOLD!!!</strong>");
   createUpgradeElement("f", 1, "stone", "stone.png", "The Flammel Effect!", "Discovered by Nicolas Flammel himself!");
   createUpgradeElement("f", 2, "stone", "stone.png", "Dark Alchemy!", "Uncover secrets that should not be known!");
   createUpgradeElement("f", 3, "stone", "stone.png", "Primeval Chemistry!", "Tread paths that have not been tread in a thousand millennia!");
   createUpgradeElement("f", 4, "stone", "stone.png", "Necromancy!", "HAHAHAHAHA! (That was supposed to be an evil laugh)");
   createUpgradeElement("g", 1, "station", "station.png", "Solar Power!", "WHY did we not think of this before? All of those double-A Duracell batteries where quite difficult to transport!");
   createUpgradeElement("g", 2, "station", "station.png", "Self Repairing!", "Through the power of AI!");
   createUpgradeElement("g", 3, "station", "station.png", "Nanobot Minions!", "Evil at your fingertips! (let the power get to your head!)");
   createUpgradeElement("g", 4, "station", "station.png", "Space Dust Condenser!", "Create Asteroids!");
   createUpgradeElement("h", 1, "leprechaun", "leprechaun.png", "Leprechaun Hierarchy!", "Allows for working class!");
   createUpgradeElement("h", 2, "leprechaun", "leprechaun.png", " 9 Colour Rainbow!", "Infrared, red, orange, goldish, yellow, green, blue, purple, ultraviolet!");
   createUpgradeElement("h", 3, "leprechaun", "leprechaun.png", "Invisible Cauldrons!", "No more stealing from leprechauns!");
   createUpgradeElement("h", 4, "leprechaun", "leprechaun.png", "Leprechaun Subuniversal Secrets!", "They are coming, and with them they bring tomatoes.");
   createUpgradeElement("i", 1, "sheep", "sheep.png", "Bubble Baths!", "Give that fleece a nice good cleaning!");
   createUpgradeElement("i", 2, "sheep", "sheep.png", "Merino Sheep!", "Only the finest wool for your lordsheep!");
   createUpgradeElement("i", 3, "sheep", "sheep.png", "Fluffy Paddocks!", "The researchers said it makes more wool!");
   createUpgradeElement("i", 4, "sheep", "sheep.png", "Alternate Sheep Universe!", "The sheep that come through are not the same, but they have wool!");
   createUpgradeElement("j", 1, "ray", "ray.png", "Recouped Kinetic Energy!", "MORE POWER!");
   createUpgradeElement("j", 2, "ray", "ray.png", "Atomic Rearrangement!", "Rearrange those atoms!");
   createUpgradeElement("j", 3, "ray", "ray.png", "Electron Extraction!", "Collect the electrons! Who cares about radioactive ion waste!");
   createUpgradeElement("j", 4, "ray", "ray.png", "Proton-Neutron Re-thingy!", "Don't question it, it works!");
   createUpgradeElement("k", 1, "merger", "merger.png", "Particle Reconstructor!", "Building neutron stars from the ground up!");
   createUpgradeElement("k", 2, "merger", "merger.png", "Advanced Magnets!", "Increase the collision force!");
   createUpgradeElement("k", 3, "merger", "merger.png", "Hydrolic Densifier!", "Hydro-powered condensers!");
   createUpgradeElement("k", 4, "merger", "merger.png", "Strange Star Collisions", "This may cause unexpected results, such as <strong>Otherworldly</strong> occurrences.");

   if (gameData.gold >= upgradeCosts["a" + num] && num < 5) {
      gameData.gold -= upgradeCosts["a" + num];
      gameData.clickinGold *= 2;
      upgradeData["a" + num] = true;
      document.getElementById("a" + num).style.display = "none";
   }
   else {
      if (gameData.gold >= upgradeCosts[`a${num}`] && num >= 5) {
         gameData.gold -= upgradeCosts[`a${num}`];
         gameData.clickinGold *= gameData.pickaxeNumber;
         upgradeData[`a${num}`] = true;
         document.getElementById(`a${num}`).style.display = "none";
      }
   }
}


*/
