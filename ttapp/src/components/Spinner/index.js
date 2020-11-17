import React from 'react';
import HashLoader from 'react-spinners/RingLoader';
import { css } from '@emotion/core';

const override = css`
    position: absolute,
    top: 70%,
    display: block;
    margin: 0 auto;
    max-height: 0;
    z-index: 1000
`;

export default function Spinner({ active }) {
    return (
        <HashLoader
            css={override}
            sizeUnit={'px'}
            size={100}
            color={'#004d00'}
            loading={active}
        />
    );
}

