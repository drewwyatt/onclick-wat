import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { Button } from './Button';
import { useNativeEvent } from './useNativeEvent';

const View = styled(Button)`
  background: #62cee2;
`;

type ButtonProps = DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
type Props =
  & ButtonProps
  & { onClick: EventListener };

export const NativeEventButton: FC<Props> = ({ onClick, ...rest }) => {
  const ref = useNativeEvent('click', onClick)
  return <View {...rest} ref={ref} />
};
