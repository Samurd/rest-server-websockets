export interface Ticket {
  id: string;
  num: number;
  createdAt: Date;
  handleAtDesk?: string;
  handleAt?: Date;
  done: boolean;
}
