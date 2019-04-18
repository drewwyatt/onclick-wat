import React, { Component, FC } from 'react';
import { SomeWrappedExternalLib } from './SomeWrappedExternalLib';
import { Button, NativeEventButton } from './components';
import './App.css';

let count: number = 0;
const setCount = (n: number) => {
  document.title = n.toString();
}

const listener  = (e: any) => {
  if (!!e && !!e.stopImmediatePropagation) {
    e.stopImmediatePropagation();
  }
  setCount(++count);
};

setCount(0);

class App extends Component {
  render() {
    return (
      <div>
        <Button onClick={listener}>Increment Title</Button>

        <SomeWrappedExternalLib>
          <Button onClick={listener}>Increment Title</Button>
          <NativeEventButton onClick={listener}>Increment Title With Native Event</NativeEventButton>
        </SomeWrappedExternalLib>
      </div>
    );
  }
}

export default App;
