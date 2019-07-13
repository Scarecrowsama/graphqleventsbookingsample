import React, { Component } from 'react';
import './Events.css';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';

class EventsPage extends Component {

  state = {
    creating: false,
    events: []
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.priceElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descriptionElRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  startCreateEventHandler = () => {
    this.setState({ creating:true });
  };
  
  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const price = +this.priceElRef.current.value;
    const date = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;

    if(title.trim().length === 0 || price <= 0 || date.trim().length === 0 || description.trim().length === 0) {
      return;
    }

    const event = { title, price, date, description };
    console.log(event);

    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: { title: "${title}", description: "${description}", price: ${price}, date: "${date}" }) {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };

    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
    .then(response => {

      if(response.status !== 200 && response.status !== 201) {
        throw new Error('Failed');
      }

      return response.json();
    })
    .then(resData => {
      this.fetchEvents();
    })
    .catch(err => {
      console.log(err);
    });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false });
  };

  fetchEvents = () => {
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {

      if(response.status !== 200 && response.status !== 201) {
        throw new Error('Failed');
      }

      return response.json();
    })
    .then(resData => {
      const events = resData.data.events;
      this.setState({ events: events });
    })
    .catch(err => {
      console.log(err);
    });
  };
  
  render() { 

    const eventsList = this.state.events.map(event => {
      return <li key={event._id} className="events__list-item">{event.title}</li>;
    });

    return (
      <React.Fragment>
        {this.state.creating && <Backdrop />}
        {this.state.creating && 
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}>
              <form>
                <div className="form-control">
                  <label htmlFor="title">Title</label>
                  <input type="text" id="title" ref={this.titleElRef}></input>
                </div>
                <div className="form-control">
                  <label htmlFor="price">Price</label>
                  <input type="number" id="price" ref={this.priceElRef}></input>
                </div>
                <div className="form-control">
                  <label htmlFor="date">Date</label>
                  <input type="datetime-local" id="date" ref={this.dateElRef}></input>
                </div>
                <div className="form-control">
                  <label htmlFor="description">Description</label>
                  <textarea rows="4" id="description" ref={this.descriptionElRef}></textarea>
                </div>
              </form>
          </Modal>}
        {this.context.token && <div className="events-control">
          <p>Share your own Events</p>
          <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
        </div>}
        <ul className="events__list">
          {eventsList}
        </ul>
      </React.Fragment>
    );
  }
}
 
export default EventsPage;