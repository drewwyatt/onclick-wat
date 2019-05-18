# onClick={wat}

## Let's talk about events in React

```jsx
const handler = () => alert("🙌");
const MyComponent = () => <button onClick={handler}>🔥</button>;
```

What is React actually doing with that `onClick` prop? Until _very_ recently, I think I assumed it was doing something like this:

```jsx
const el = findDomNode(this);
el.addEventListener("click", handler);
```

(or something)

If you start digging around the section on [events](https://reactjs.org/docs/events.html) in the React documentation, you will find that React uses something called `SyntheticEvent`.

> Your event handlers will be passed instances of SyntheticEvent, a cross-browser wrapper around the browser’s native event. It has the same interface as the browser’s native event, including stopPropagation() and preventDefault(), except the events work identically across all browsers.

Okay, that makes sense. What else?

> The SyntheticEvent is pooled. This means that the SyntheticEvent object will be reused and all properties will be nullified after the event callback has been invoked. This is for performance reasons. As such, you cannot access the event in an asynchronous way.

Alright. So they do that for compatability *and* performance. What's the big deal though?

Well, it's not **just** `SyntheticEvent` that's important here.

> The SyntheticEvent is pooled

By what?

Let's take a look at [react-dom](https://github.com/facebook/react/blob/66f280c87b05885ee55320a5e107a534a50f9375/packages/react-dom/src/events/ReactBrowserEventEmitter.js). Specifically:

```
/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactDOMEventListener, which is injected and can therefore support
 *    pluggable event sources. This is the only work that occurs in the main
 *    thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */
 ```

Alright, so this is pretty complex. Really the only thing we care about here is the first sentence though:

> Top-level delegation is used to trap most native browser events.

You can see an example of this if you look at the Event Listeners panel in Chrome's devtools and inspect an item you have assigned an `onClick` handler to.

![Event Listeners](listeners.png)

Notice that in the example above (and probably also in your own dev tools) that while there *is* an event listener attached to the button, the `handler` prop is `noop()`. Additionally, you can remove this listener (using the dev tools) and whatever you attached to `onClick` still executes when you click the button.

That's because the event listener that is executing your handler is attached to the `document` (you can validate this by removing *that* listener and noticing that your handler does **not** execute anymore).

What you are seeing here (attached to document) is the global event delegate that picks up virtually every event that can be attached via `onClick`/`onDrag`/`onFocus`/`onYouGetTheIdea`, you can see a full list [here](https://reactjs.org/docs/events.html#reference).

## Why are you telling me all of this?

Fair question. Candidly, most of the time, none of this matters. *How* React chooses to fire a given handler when a button is clicked is something that the developers using React never need to think about.

Unless you are using a third-party library that 8s **not** attaching its event listeners with React.

## E.G.

I am member of the Digital team at Peloton. One of the projects I work on is the video player for [members.onepeloton.com](https://members.onepeloton.com). It looks like this:

![Video Player Screenshot](peloton-player.png)

We render custom controls (built in React) that we place in an overlay on top of [JWPlayer](https://github.com/jwplayer/jwplayer), which handles the streaming (and does not use React).

Out of the box, JWPlayer attaches a number of event Listeners to elements to handle common use cases (e.g. using spacebar to pause or play the video). Most of these are helpful.

One instance, where this was not helpful, was when our team was working on keyboard accessibilty for our custom volume control.

If a user is using their mouse, hovering over the speaker icon (🔊) will show a volume slider that can be adjusted using the mouse. When using a keyboard, however, this requires some extra steps:

1) `tab` to speaker icon
2) press `enter` or `spacebar` to open the slider
3) `tab` to the slider
4) use the arrow keys to adjust the volume

After implementing that behavior, we ran into a frustrating issue: hitting `enter` or `spacebar` **did** open the volume slider, but it **also** toggle the pause/play state of the video.

No problem, right? All we needed to do was add `event.stopPropagation()` to to our event handler.

That didn't work.

hmmm... Okay. `event.preventDefault()` it is.

Nope.

`event.stopImmediatePropagation()`?

```
Uncaught TypeError: event.stopImmediatePropagation is not a function
```

Okay, well I haven't done this in a while, `return false;`?

still no.

## What's going on here?

The problem (this is where the first half of this article becomes relevant) is that JWPlayer is attaching its *native* event listener directly to some element on the page that our 🔊 button is a child of. Our button's handler is attached to `document` (the global, top-level delegate we learned about above). This event is going to bubble to `JWPlayer`'s handler long before it hits ours. So, by the time we call `stopPropagation()` (or anything else), it's too late.
