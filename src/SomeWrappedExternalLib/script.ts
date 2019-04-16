const listener = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  alert('hey');
};

export const doSomething = () => {
  const thing = document.querySelector('#some-wrapped-external-lib') as HTMLFieldSetElement;
  const arr = Array.from(thing.children);
  arr.forEach(el => {
    el.removeEventListener('click', listener);
    el.addEventListener('click', listener);
  });
};
