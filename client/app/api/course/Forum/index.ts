import ForumsAPI from './Forums';
import PostsAPI from './Posts';
import TopicsAPI from './Topics';

const ForumAPI = {
  forums: new ForumsAPI(),
  topics: new TopicsAPI(),
  posts: new PostsAPI(),
};

Object.freeze(ForumAPI);

export default ForumAPI;
