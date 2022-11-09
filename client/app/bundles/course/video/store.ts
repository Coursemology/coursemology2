/* eslint-disable import/prefer-default-export */
import { configureStore } from '@reduxjs/toolkit';

import videoReducer from './reducers';

export const store = configureStore({ reducer: { videos: videoReducer } });
