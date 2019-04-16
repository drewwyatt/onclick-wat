import React, { Component, FC } from 'react';
import { SomeWrappedExternalLib } from './SomeWrappedExternalLib';
import { Button } from './components';
import { NativeEventListener, Event } from './NativeEventListener';
import './App.css';

const listener: EventListener = e => {
  e.stopImmediatePropagation();
  console.log('HELLO!');
};

const OtherButton: FC = () => {
  return (
    <NativeEventListener events={[[Event.onClick, listener]]}>
      <Button>Other Button</Button>
    </NativeEventListener>
  );
};

class App extends Component {
  render() {
    return (
      <div>
        <SomeWrappedExternalLib>
          <p>this is some button that we have added</p>
          <Button onClick={() => console.log('hello.')}>hey</Button>
          <OtherButton />
        </SomeWrappedExternalLib>
        whoop
      </div>
    );
  }
}

export default App;
