import React from 'react';
import "../public/css/alert.css"

class AlertMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      showAlert: false // Initially hide the alert box
    };
  }

  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const message = queryParams.get('message');
    if (message) {
      this.setState({ message, showAlert: true }); // Show the alert box
      setTimeout(() => {
        this.setState({ showAlert: false }); // Hide the alert box after 10 seconds
      }, 5000);
    }
  }

  render() {
    return (
      <>
        {this.state.showAlert && (
          <div id='alert-box' className='bg-success text-white text-center items-center shadow' style={{ padding: '8px', marginBottom: '20px', animation: 'slideInUp 0.5s ease-in-out' }}>
            {this.state.message && <p>{this.state.message}</p>}
          </div>
        )}
      </>
    );
  }
}

export default AlertMessage;
