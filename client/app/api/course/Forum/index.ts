import TopicsAPI from './Topics';
import ForumsAPI from './Forums';
import PostsAPI from './Posts';

const ForumAPI = {
  forums: new ForumsAPI(),
  topics: new TopicsAPI(),
  posts: new PostsAPI(),
};

Object.freeze(ForumAPI);

export default ForumAPI;
