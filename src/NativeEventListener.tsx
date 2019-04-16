import React, { Component, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';

/**
 * Add additional events here as they are needed
 * This should be treated as:
 * Record<'react prop name', 'addEventListener key'>
 */
export enum Event {
  onClick = 'click',
  onKeyDown = 'keydown',
  onKeyUp = 'keyup',
}

type Props = {
  events: [Event, EventListenerOrEventListenerObject][];
};

export class NativeEventListener extends Component<Props> {
  static Event = Event;

  componentDidMount() {
    const element = findDOMNode(this);
    if (element) {
      const { events } = this.props;
      events.forEach(([key, fn]) => {
        (element.addEventListener as any)(key, fn, true);
      });
    }
  }

  render() {
    const { children, ...props } = this.props;
    return cloneElement(children as any, props);
  }
}
