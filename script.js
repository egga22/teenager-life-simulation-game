/*
  Game logic for Teen Life Simulation.
  This script manages the player state, random events, activities,
  store items, overlays and UI interactions. Stats update dynamically
  based on player choices and actions.
*/

// Global game state object
const gameState = {
  day: 1,
  age: 15,
  mood: 50,
  popularity: 50,
  money: 20,
  grades: 75,
  health: 80,
  grounded: false,
  friends: [
    { name: "Jamie", closeness: 60 },
    { name: "Alex", closeness: 40 }
  ],
  inventory: [],
  achievements: [],
  flags: {}
};

// Clamp a statistic between 0 and 100
function clampStat(val) {
  return Math.min(100, Math.max(0, val));
}

// Event definitions. Each event returns a title, description and choices
const events = [
  function testEvent() {
    return {
      title: "Pop Quiz!",
      description:
        "Your math teacher surprises the class with a pop quiz. You feel unprepared. What do you do?",
      choices: [
        {
          text: "Do your best and focus",
          effect() {
            gameState.grades = clampStat(gameState.grades + 5);
            gameState.mood = clampStat(gameState.mood - 5);
            addMessage(
              "You concentrate and manage to answer most questions. Your grades improve slightly but you feel drained."
            );
          }
        },
        {
          text: "Sneak a peek at someone else's paper",
          effect() {
            gameState.grades = clampStat(gameState.grades + 2);
            gameState.popularity = clampStat(gameState.popularity - 10);
            addMessage(
              "You cheat and get a few answers. Your teacher notices your suspicious behavior and your reputation suffers."
            );
          }
        },
        {
          text: "Leave it blank and doodle instead",
          effect() {
            gameState.grades = clampStat(gameState.grades - 10);
            gameState.mood = clampStat(gameState.mood + 5);
            addMessage(
              "You ignore the quiz and relax. Your grades take a hit, but you feel surprisingly calm."
            );
          }
        }
      ]
    };
  },
  function cafeteriaDrama() {
    return {
      title: "Cafeteria Drama",
      description:
        "At lunch, someone accidentally bumps into you and spills their food. Everyone is watching. How do you react?",
      choices: [
        {
          text: "Laugh it off and help clean up",
          effect() {
            gameState.popularity = clampStat(gameState.popularity + 5);
            gameState.mood = clampStat(gameState.mood + 2);
            addMessage(
              "You stay positive and help them clean up. People appreciate your kindness and you become more popular."
            );
          }
        },
        {
          text: "Make fun of them",
          effect() {
            gameState.popularity = clampStat(gameState.popularity - 5);
            gameState.mood = clampStat(gameState.mood - 5);
            addMessage(
              "You mock them and others laugh. Later, you feel guilty and people think less of you."
            );
          }
        },
        {
          text: "Ignore it and walk away",
          effect() {
            gameState.mood = clampStat(gameState.mood - 1);
            addMessage(
              "You decide to avoid the situation altogether. Nothing changes but you miss a chance to be helpful."
            );
          }
        }
      ]
    };
  },
  function familyChore() {
    return {
      title: "Chore Time",
      description:
        "Your parents ask you to mow the lawn. It's a beautiful day and your friends are texting to hang out. What do you do?",
      choices: [
        {
          text: "Do the chore now",
          effect() {
            gameState.money += 10;
            gameState.mood = clampStat(gameState.mood - 5);
            addMessage(
              "You take care of the lawn. Your parents are pleased and give you $10, but you miss out on some fun."
            );
          }
        },
        {
          text: "Ask to do it later",
          effect() {
            gameState.mood = clampStat(gameState.mood + 5);
            addMessage(
              "You promise to mow later and go have fun. Your parents agree, but you’ll need to remember to do it later!"
            );
          }
        },
        {
          text: "Refuse and go hang out",
          effect() {
            gameState.popularity = clampStat(gameState.popularity + 5);
            gameState.mood = clampStat(gameState.mood + 10);
            gameState.grounded = true;
            addMessage(
              "You ditch the chore for fun. Your parents find out and ground you. Hanging out was fun but now you’re grounded."
            );
          }
        }
      ]
    };
  },
  function partyInvitation() {
    return {
      title: "Party Invitation",
      description:
        "You’re invited to a party this weekend. Your best friend really wants you to go, but you have a big exam Monday. What do you do?",
      choices: [
        {
          text: "Go to the party",
          effect() {
            gameState.popularity = clampStat(gameState.popularity + 10);
            gameState.grades = clampStat(gameState.grades - 10);
            gameState.mood = clampStat(gameState.mood + 8);
            addMessage(
              "You attend the party, have a blast and everyone thinks you’re cool. Unfortunately, your study time suffers."
            );
          }
        },
        {
          text: "Stay home and study",
          effect() {
            gameState.grades = clampStat(gameState.grades + 10);
            gameState.mood = clampStat(gameState.mood - 3);
            addMessage(
              "You skip the party and study hard. Your grades thank you, but you feel a bit left out."
            );
          }
        },
        {
          text: "Study for a bit then show up fashionably late",
          effect() {
            gameState.grades = clampStat(gameState.grades + 3);
            gameState.popularity = clampStat(gameState.popularity + 3);
            gameState.mood = clampStat(gameState.mood + 2);
            addMessage(
              "You compromise by studying early and arriving late. You maintain your grades and still enjoy some social time."
            );
          }
        }
      ]
    };
  },
  function healthScare() {
    return {
      title: "Not Feeling Great",
      description:
        "You wake up with a sore throat and headache. There's a big basketball game today that you’ve been training for. How will you handle it?",
      choices: [
        {
          text: "Play anyway",
          effect() {
            gameState.health = clampStat(gameState.health - 20);
            gameState.popularity = clampStat(gameState.popularity + 5);
            gameState.mood = clampStat(gameState.mood + 1);
            addMessage(
              "You push through the pain and play. Your teammates appreciate your dedication, but your health takes a toll."
            );
          }
        },
        {
          text: "Skip the game and rest",
          effect() {
            gameState.health = clampStat(gameState.health + 15);
            gameState.popularity = clampStat(gameState.popularity - 5);
            gameState.mood = clampStat(gameState.mood - 2);
            addMessage(
              "You decide to rest and recover. You feel better soon, though you lose a bit of popularity with your team."
            );
          }
        },
        {
          text: "Cheer from the sidelines",
          effect() {
            gameState.health = clampStat(gameState.health + 5);
            gameState.popularity = clampStat(gameState.popularity + 2);
            addMessage(
              "You support your friends from the sidelines. You maintain your health and still show team spirit."
            );
          }
        }
      ]
    };
  },
  function groupProject() {
    return {
      title: "Group Project",
      description:
        "Your English group project partner isn’t responding. The project is due tomorrow. What do you do?",
      choices: [
        {
          text: "Do all the work yourself",
          effect() {
            gameState.grades = clampStat(gameState.grades + 7);
            gameState.mood = clampStat(gameState.mood - 6);
            addMessage(
              "You take on the project solo and pull an all‑nighter. The project is good but you’re exhausted."
            );
          }
        },
        {
          text: "Confront your partner",
          effect() {
            gameState.popularity = clampStat(gameState.popularity - 5);
            gameState.mood = clampStat(gameState.mood + 2);
            addMessage(
              "You tell your partner off. You feel better speaking up, but some people think you’re being harsh."
            );
          }
        },
        {
          text: "Talk to the teacher",
          effect() {
            gameState.grades = clampStat(gameState.grades + 3);
            gameState.popularity = clampStat(gameState.popularity - 2);
            addMessage(
              "You explain the situation to your teacher, who gives you more time. Your partner is annoyed, but your grades are safe."
            );
          }
        }
      ]
    };
  }
];

// Activities definitions
const activities = [
  {
    name: "Study",
    description: "Improve your grades at the cost of mood.",
    available() {
      return true;
    },
    run() {
      gameState.grades = clampStat(gameState.grades + 5);
      gameState.mood = clampStat(gameState.mood - 3);
      addMessage(
        "You hit the books and learn a lot. Your grades improve but you feel a bit drained."
      );
    }
  },
  {
    name: "Hang Out",
    description: "Spend time with friends to boost mood and popularity.",
    available() {
      return !gameState.grounded;
    },
    run() {
      gameState.mood = clampStat(gameState.mood + 6);
      gameState.popularity = clampStat(gameState.popularity + 4);
      addMessage(
        "You hang out with friends, share laughs and stories. You feel happier and more popular."
      );
    }
  },
  {
    name: "Get a Part‑Time Job",
    description: "Work an odd job for extra cash, at the cost of mood and health.",
    available() {
      return !gameState.grounded;
    },
    run() {
      gameState.money += 20;
      gameState.mood = clampStat(gameState.mood - 4);
      gameState.health = clampStat(gameState.health - 2);
      addMessage(
        "You work a part‑time job after school and earn $20. You're tired afterwards but your wallet is happy."
      );
    }
  },
  {
    name: "Do Chores",
    description: "Help out around the house. Might earn some money and avoid being grounded.",
    available() {
      return true;
    },
    run() {
      const pay = Math.random() < 0.5 ? 5 : 10;
      gameState.money += pay;
      gameState.mood = clampStat(gameState.mood - 2);
      if (gameState.grounded) {
        gameState.grounded = false;
        addMessage(
          `You catch up on chores and your parents forgive you. You're no longer grounded and you earn $${pay}.`
        );
      } else {
        addMessage(
          `You help around the house and get $${pay}. It's not super exciting, but it keeps you on your parents' good side.`
        );
      }
    }
  },
  {
    name: "Exercise",
    description: "Go for a run or hit the gym to improve your health and mood.",
    available() {
      return !gameState.grounded;
    },
    run() {
      gameState.health = clampStat(gameState.health + 8);
      gameState.mood = clampStat(gameState.mood + 3);
      gameState.popularity = clampStat(gameState.popularity + 1);
      addMessage(
        "You work out and feel the endorphins kicking in. Your health, mood, and even popularity get a boost!"
      );
    }
  }
];

// Store items definitions
const storeItems = [
  {
    name: "Video Game",
    price: 30,
    description: "A new video game to play during downtime. Improves mood.",
    purchase() {
      gameState.inventory.push({ name: "Video Game" });
      gameState.mood = clampStat(gameState.mood + 6);
      addMessage(
        "You buy a new video game and can't wait to play it. You're super excited!"
      );
    }
  },
  {
    name: "Concert Ticket",
    price: 50,
    description: "A ticket to see your favorite band live. Boosts popularity.",
    purchase() {
      gameState.inventory.push({ name: "Concert Ticket" });
      gameState.popularity = clampStat(gameState.popularity + 10);
      addMessage(
        "You score a concert ticket. Everyone wants to hear about the show!"
      );
    }
  },
  {
    name: "New Outfit",
    price: 40,
    description: "Stylish clothes that make you feel confident.",
    purchase() {
      gameState.popularity = clampStat(gameState.popularity + 8);
      gameState.mood = clampStat(gameState.mood + 4);
      addMessage(
        "You grab a fresh outfit and feel more confident walking into school."
      );
    }
  },
  {
    name: "Movie Night",
    price: 15,
    description: "Enjoy a movie with friends. Improves mood and closeness.",
    purchase() {
      if (gameState.friends.length > 0) {
        gameState.mood = clampStat(gameState.mood + 5);
        gameState.friends.forEach((f) => {
          f.closeness = clampStat(f.closeness + 5);
        });
        addMessage(
          "You host a movie night. You and your friends have a great time and feel closer."
        );
      } else {
        gameState.mood = clampStat(gameState.mood + 2);
        addMessage(
          "You watch a movie on your own. It's still enjoyable, but you wish you had company."
        );
      }
    }
  }
];

// Append a message to the event area
function addMessage(text) {
  const eventArea = document.getElementById("event-area");
  const p = document.createElement("p");
  p.textContent = text;
  eventArea.appendChild(p);
  eventArea.scrollTop = eventArea.scrollHeight;
}

// Render an event to the UI
function displayEvent(eventData) {
  const eventArea = document.getElementById("event-area");
  eventArea.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.textContent = eventData.title;
  eventArea.appendChild(h2);
  const p = document.createElement("p");
  p.textContent = eventData.description;
  eventArea.appendChild(p);
  const choicesDiv = document.createElement("div");
  choicesDiv.id = "choices-container";
  eventData.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-button";
    btn.textContent = choice.text;
    btn.onclick = () => {
      choice.effect();
      gameState.day++;
      if (gameState.day % 100 === 0) {
        gameState.age++;
        addMessage(`Happy birthday! You're now ${gameState.age} years old.`);
      }
      document.getElementById("choices-container").remove();
      document.getElementById("nextBtn").disabled = false;
    };
    choicesDiv.appendChild(btn);
  });
  eventArea.appendChild(choicesDiv);
}

// Generate and show a random event
function triggerRandomEvent() {
  if (gameState.grounded) {
    const groundedEvent = {
      title: "Grounded",
      description:
        "You're grounded. You can't go out with friends until you do some chores.",
      choices: [
        {
          text: "Apologize and promise to do better",
          effect() {
            gameState.grounded = false;
            gameState.popularity = clampStat(gameState.popularity - 1);
            addMessage(
              "You apologize sincerely. Your parents lift your grounding, but you feel a little embarrassed."
            );
          }
        },
        {
          text: "Sneak out anyway",
          effect() {
            gameState.popularity = clampStat(gameState.popularity + 5);
            gameState.mood = clampStat(gameState.mood + 5);
            gameState.grounded = true;
            addMessage(
              "You sneak out and have fun with friends, but your parents find out and extend your grounding."
            );
          }
        },
        {
          text: "Tackle chores diligently",
          effect() {
            gameState.money += 15;
            gameState.mood = clampStat(gameState.mood - 3);
            gameState.grounded = false;
            addMessage(
              "You work hard on chores. Your parents appreciate your effort, you earn $15, and your grounding is lifted."
            );
          }
        }
      ]
    };
    displayEvent(groundedEvent);
    return;
  }
  const eventFunc = events[Math.floor(Math.random() * events.length)];
  const eventData = eventFunc();
  displayEvent(eventData);
}

// Render a stat bar as HTML
function renderStatBar(label, value, color, max = 100) {
  const percent = Math.min(100, (value / max) * 100);
  return `
    <div class="stat-bar">
      <span>${label}:</span>
      <div class="stat-progress"><div style="width: ${percent}%; background: ${color};"></div></div>
      <span style="margin-left:4px;">${Math.round(value)}</span>
    </div>
  `;
}

// Overlays
function showStats() {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <button class="close-btn">×</button>
    <h3>Your Stats (Day ${gameState.day})</h3>
    <div class="stat-bar"><span>Age:</span> ${gameState.age}</div>
    ${renderStatBar("Mood", gameState.mood, "#ffc107")}
    ${renderStatBar("Popularity", gameState.popularity, "#17a2b8")}
    ${renderStatBar("Money", gameState.money, "#28a745", 100)}
    ${renderStatBar("Grades", gameState.grades, "#6610f2")}
    ${renderStatBar("Health", gameState.health, "#dc3545")}
    ${renderStatBar("Grounded", gameState.grounded ? 100 : 0, "#6c757d")}
    <p><strong>Inventory:</strong> ${
      gameState.inventory.length > 0
        ? gameState.inventory.map((i) => i.name).join(", ")
        : "None"
    }</p>
  `;
  overlay
    .querySelector(".close-btn")
    .addEventListener("click", hideOverlay);
  showOverlay(overlay);
}

function showActivities() {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <button class="close-btn">×</button>
    <h3>Activities</h3>
  `;
  activities.forEach((act) => {
    const btn = document.createElement("button");
    btn.className = "choice-button";
    btn.textContent = `${act.name} – ${act.description}`;
    btn.disabled = !act.available();
    btn.onclick = () => {
      act.run();
      hideOverlay();
    };
    overlay.appendChild(btn);
  });
  overlay
    .querySelector(".close-btn")
    .addEventListener("click", hideOverlay);
  showOverlay(overlay);
}

function showFriends() {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `<button class="close-btn">×</button><h3>Friends</h3>`;
  if (gameState.friends.length === 0) {
    const p = document.createElement("p");
    p.textContent = "You don't have any friends yet. Try going out and meeting people!";
    overlay.appendChild(p);
  } else {
    gameState.friends.forEach((friend) => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${friend.name}</strong> – Closeness: ${friend.closeness}`;
      overlay.appendChild(p);
    });
  }
  overlay
    .querySelector(".close-btn")
    .addEventListener("click", hideOverlay);
  showOverlay(overlay);
}

function showStore() {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `<button class="close-btn">×</button><h3>Store (Money: $${gameState.money})</h3>`;
  storeItems.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "choice-button";
    btn.textContent = `${item.name} – $${item.price}: ${item.description}`;
    btn.disabled = gameState.money < item.price;
    btn.onclick = () => {
      gameState.money -= item.price;
      item.purchase();
      hideOverlay();
    };
    overlay.appendChild(btn);
  });
  overlay
    .querySelector(".close-btn")
    .addEventListener("click", hideOverlay);
  showOverlay(overlay);
}

// Overlay management
function showOverlay(content) {
  const container = document.getElementById("overlay-container");
  container.innerHTML = "";
  container.appendChild(content);
  container.style.display = "flex";
}

function hideOverlay() {
  const container = document.getElementById("overlay-container");
  container.style.display = "none";
  container.innerHTML = "";
}

// Hook up menu buttons after DOM loads
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("statsBtn").onclick = showStats;
  document.getElementById("activityBtn").onclick = showActivities;
  document.getElementById("friendsBtn").onclick = showFriends;
  document.getElementById("storeBtn").onclick = showStore;
  document.getElementById("nextBtn").onclick = () => {
    document.getElementById("nextBtn").disabled = true;
    triggerRandomEvent();
  };
});