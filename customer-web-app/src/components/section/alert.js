import React from 'react';
import '../css/Header.css';

export default function FormExample({show, style = "alert-danger", message}) {
    return (
      <>{show?<div className={"myAlert-bottom alert " + style}>
          {message}
      </div>:null}
      </>
    );
}
