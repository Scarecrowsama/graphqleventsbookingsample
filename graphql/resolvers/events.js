const Event = require('../../models/events');
const User = require('../../models/users');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch(err) {
        throw err
    };
  },

  createEvent: async (args, req) => {

    if(!req.isAuth) {
      throw new Error('Unathenticated');
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });

    let createdEvent = undefined;

    try {

      const result = await event.save();
      createdEvent = transformEvent(result);

      const creator = await User.findById(req.userId);
      
      if(!creator) {
        throw new Error('User not found');
      }

      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch(err) {
        console.log(err);
        throw err;
    };
  },
};