import React from 'react';
import '../../css/Inventory.css';
import {Modal } from 'react-bootstrap';
import StoreTimingTabs from './storeTimingTabs';
import Crossbutton from '../../svg/cross_button.svg';

function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        {...props}
        // size="sm"
        
        dialogClassName='modal-90w dialogBoxClass'
        aria-labelledby="contained-modal-title-vcenter"
        style={{backgroundColor:"initial"}}
        centered
      >
        <Modal.Header className='ModalHeader'>
          <span></span>
          <span>
            <img src={Crossbutton} className="cursor-pointer" alt="" onClick={props.onHide} />
          </span>
        </Modal.Header>
        <Modal.Body className='dialogBoxClass' style={{paddingTop:"0px"}}>
              <StoreTimingTabs 
                calenderTimings={props.calendertimings}
                selectedRadioButtonFunction={props.radiobuttonfunction}
                editStoreTimings={props.editstoretimings}
                selectedCalenderTiming={props.selectedcalendertiming}
                tabsArray={[{
                    Menus:'Today',
                    timings:'11',
                    Data:["07:00 - 08:00", "08:00 - 09:00", "10:00 - 11:00", "08:00 - 09:00", "10:00 - 11:00", "08:00 - 09:00", "10:00 - 11:00"]
                  },
                  {
                      Menus:'Tue',
                      timings:'12',
                      Data:["hello2"]
                  },
                  {
                      Menus:'Wed',
                      timings:'13',
                      Data:["hello3"]
                  }]} 
              />
        </Modal.Body>
        {/* <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer> */}
      </Modal>
    );
}
  
function StoreTimings({show, setShow, calenderTimings, handleSelectedRadioButton, editStoreTimings, selectedCalenderTiming}) {
    // const [modalShow, setModalShow] = React.useState(false);
        return (
      <>
        <MyVerticallyCenteredModal
          show={show}
          editstoretimings={editStoreTimings}
          onHide={() => setShow(false)}
          calendertimings={calenderTimings}
          radiobuttonfunction={handleSelectedRadioButton}
          selectedcalendertiming={selectedCalenderTiming}
        />
      </>
    );
  }
export default StoreTimings;