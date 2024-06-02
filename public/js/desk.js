const lblPending = document.querySelector("#lbl-pending");
const deskHeader = document.querySelector("h1");
const noMoreAlert = document.querySelector(".alert");

const lblCurrentTicket = document.querySelector("small");

const btnDraw = document.querySelector("#btn-draw");
const btnDone = document.querySelector("#btn-done");

const searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has("escritorio")) {
  window.location = "index.html";
  throw new Error("Desk is required");
}

const deskNumber = searchParams.get("escritorio");
let workingTicket = null;
deskHeader.innerText = deskNumber;

function checkTicketCount(currentCount = 0) {
  if (currentCount === 0) {
    noMoreAlert.classList.remove("d-none");
  } else {
    noMoreAlert.classList.add("d-none");
  }
  lblPending.innerText = currentCount;
}

async function loadInitialCount() {
  const pending = await fetch("/api/tickets/pending").then((res) => res.json());
  checkTicketCount(pending.length);
}

async function getTicket() {
  await finishTicket();

  const data = await fetch(`/api/tickets/draw/${deskNumber}`).then((res) => res.json());

  if (data.status !== 200) {
    lblCurrentTicket.innerText = "No hay tickets por el momento";
    return;
  }

  workingTicket = data.ticket;
  lblCurrentTicket.innerText = data.ticket.num
}


async function finishTicket() {
  if(!workingTicket) return;

  const {status, ticket} = await fetch(`/api/tickets/done/${workingTicket.id}`, {
    method: "PUT",
  }).then((res) => res.json());

  if(status === 200) {
    workingTicket = null;
    lblCurrentTicket.innerText = "Nadie";
    return;
  }


}

function connectToWebSockets() {
  const socket = new WebSocket("ws://localhost:3000/ws");

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);
    if (type !== "on-ticket-count-changed") return;

    lblPending.innerText = payload; // on-ticket-count-changed
    checkTicketCount(payload);
  };

  socket.onclose = (event) => {
    console.log("Connection closed");
    setTimeout(() => {
      console.log("retrying to connect");
      connectToWebSockets();
    }, 1500);
  };

  socket.onopen = (event) => {
    console.log("Connected");
  };
}


btnDraw.addEventListener("click",  getTicket);
btnDone.addEventListener("click", finishTicket);

loadInitialCount();
connectToWebSockets();
