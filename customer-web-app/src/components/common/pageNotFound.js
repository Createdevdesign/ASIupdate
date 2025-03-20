import React from 'react';
// import Logo from '../images/page-not-found.png';
import PageNotFound from '../../images/page-not-found.png'

class NotFound extends React.Component {
render() {
  return (
    <div className="InvalidUrlDiv">
      <img src={PageNotFound} alt="" className="loginpage-img" style={{ width:"180px", height:'150px'}} />
      {/* <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ban" className="svg-inline--fa fa-ban fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{fontSize: "32px", height:"1em"}}><path fill="currentColor" d="M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z"></path></svg> */}
      &nbsp;&nbsp;&nbsp;&nbsp;
      <h5 className='InvalidUrlH5'>404 Not Found</h5>
      <p></p>
      <p className='InvalidUrlPar' >The requested URL was not found on this server</p>
    </div>
  )}}

export default NotFound;