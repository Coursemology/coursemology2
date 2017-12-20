import TopicsAPI from './Topics';
import SessionsAPI from './Sessions';

const VideoAPI = {
  topics: new TopicsAPI(),
  sessions: new SessionsAPI(),
};

Object.freeze(VideoAPI);

export default VideoAPI;
