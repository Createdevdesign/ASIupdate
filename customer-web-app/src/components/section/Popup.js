import React from 'react';

export class Popup extends React.Component {

  closePopup() {

  }

  render() {
    return (
      <div className='popup'>

        <div className='row mt-3'>
          <div className='col-sm-9'>
            <div className='popup_inner'>
              <h3>Please pay at store</h3>
            </div>

          </div>
          <div className='col-sm-3'>
            <button onClick={this.closePopup} className="btn cta-bgbtn mt-0 float-right"> Close </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Popup