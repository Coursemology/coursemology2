import TopicsAPI from './Topics';
import SessionsAPI from './Sessions';
import SubmissionsAPI from './Submissions';
import VideosAPI from './Videos';

const VideoAPI = {
  topics: new TopicsAPI(),
  videos: new VideosAPI(),
  sessions: new SessionsAPI(),
  submissions: new SubmissionsAPI(),
};

Object.freeze(VideoAPI);

export default VideoAPI;
