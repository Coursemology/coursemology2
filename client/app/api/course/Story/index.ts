import RoomsAPI from './Rooms';
import StoriesAPI from './Stories';

const StoryAPI = Object.freeze({
  stories: new StoriesAPI(),
  rooms: new RoomsAPI(),
});

export default StoryAPI;
