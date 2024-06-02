import { UuidAdapter } from "../../config/uuid.adapter";
import { Ticket } from "../../domain/interfaces/ticket";
import { WssService } from "./wss.service";

export class TicketService {
  constructor(private readonly wssService = WssService.instance) {}

  public tickets: Ticket[] = [
    { id: UuidAdapter.v4(), num: 1, createdAt: new Date(), done: false },
    { id: UuidAdapter.v4(), num: 2, createdAt: new Date(), done: false },
    { id: UuidAdapter.v4(), num: 3, createdAt: new Date(), done: false },
    { id: UuidAdapter.v4(), num: 4, createdAt: new Date(), done: false },
  ];

  private readonly workingOnTickets: Ticket[] = [];

  public get pendingTickets(): Ticket[] {
    return this.tickets.filter((ticket) => !ticket.handleAtDesk);
  }

  public get lastWorkingOnTicket(): Ticket[] {
    return this.workingOnTickets.slice(0, 4);
  }

  public get lastTicketNumber(): number {
    return this.tickets.length > 0 ? this.tickets.at(-1)!.num : 0;
  }

  public createTicket() {
    const ticket: Ticket = {
      id: UuidAdapter.v4(),
      num: this.lastTicketNumber + 1,
      createdAt: new Date(),
      done: false,
      handleAt: undefined,
      handleAtDesk: undefined,
    };
    this.tickets.push(ticket);

    this.onTicketNumberChanged();

    return ticket;
  }

  public drawTicket(desk: string) {
    const ticket = this.tickets.find((t) => !t.handleAtDesk);
    if (!ticket) return { status: 404, message: "ticket not found" };

    ticket.handleAtDesk = desk;
    ticket.handleAt = new Date();

    this.workingOnTickets.unshift({ ...ticket });
    this.onTicketNumberChanged();
    this.onWorkingOnChanged();

    return { status: 200, ticket };
  }

  public onTicketDone(id: string) {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) return { status: 404, message: "ticket not found" };

    this.tickets = this.tickets.map((t) => {
      if (t.id === id) {
        t.done = true;
      }

      return t;
    });

    return { status: 200 };
  }

  private onTicketNumberChanged() {
    this.wssService.sendMessage(
      "on-ticket-count-changed",
      this.pendingTickets.length
    );
  }

  private onWorkingOnChanged() {
    this.wssService.sendMessage(
      "on-working-changed",
      [...this.lastWorkingOnTicket]
    )
  }
}
