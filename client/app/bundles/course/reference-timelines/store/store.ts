import { configureStore } from '@reduxjs/toolkit';

import timelinesReducer from './timelinesReducer';

const store = configureStore({
  reducer: { timelines: timelinesReducer },
});

export default store;
