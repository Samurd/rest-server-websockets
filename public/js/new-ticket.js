const ticketSpan = document.querySelector("#lbl-new-ticket");
const buttonNewTicket = document.querySelector("#btn-new-ticket");

async function getLastTicket() {
    const lastTicket = await fetch("/api/tickets/last").then((res) => res.json());
    ticketSpan.innerText = `Ticket ${lastTicket}`
}

async function createTicket() {
    buttonNewTicket.disabled = true;
    const newTicket = await fetch("/api/tickets", {
        method: "POST",
    }).then((res) => res.json());

    ticketSpan.innerText = `Ticket ${newTicket.num}`

    buttonNewTicket.disabled = false;
}

buttonNewTicket.addEventListener("click", createTicket);

getLastTicket();