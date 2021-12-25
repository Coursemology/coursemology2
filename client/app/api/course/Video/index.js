import SessionsAPI from './Sessions';
import TopicsAPI from './Topics';

const VideoAPI = {
  topics: new TopicsAPI(),
  sessions: new SessionsAPI(),
};

Object.freeze(VideoAPI);

export default VideoAPI;
