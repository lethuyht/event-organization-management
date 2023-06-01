import { Event } from '@/db/entities/Event';

export class GetEventQuery {
  static async getOneById(
    id: string,
    throwIfNotExist = true,
    relations?: string[],
  ) {
    const event = await Event.findOne({ where: { id }, relations });

    if (!event && throwIfNotExist) {
      throw new Error('Event not found');
    }
    return event;
  }
}
