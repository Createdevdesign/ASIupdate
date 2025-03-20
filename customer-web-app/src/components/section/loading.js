import React from 'react';
import '../css/Header.css';

export default function Loading({loading}) {
    return (
      <>
      {loading?<div className="loading">Loading&#8230;</div>  :null}</>
    );
}
