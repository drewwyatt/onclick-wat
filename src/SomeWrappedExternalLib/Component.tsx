import React from 'react';
import styled from '@emotion/styled';
import { doSomething } from './script';

const Container = styled.fieldset`
  border-color: white;
`;

export const SomeWrappedExternalLib: React.FC = ({ children, ...props }) => {
  React.useEffect(() => {
    doSomething();
  });
  return (
    <Container id="some-wrapped-external-lib" {...props}>
      <legend>Some Wrapped External Library Is Controlling this</legend>
      {children}
    </Container>
  );
};
