import React, { Component, PropTypes } from 'react';

import { PostProp } from '../../propTypes';
import CommentCard from './CommentCard';

export default class Comments extends Component {
  static propTypes = {
    posts: PropTypes.arrayOf(PostProp),
  };

  render() {
    const { posts } = this.props;
    return (
      <div>
        <h3>Comments</h3>
        {posts.map(post =>
          <CommentCard
            key={post.id}
            id={post.id}
            name={post.creator}
            avatar=""
            date={post.createdAt}
            content={post.text}
          />
        )}
      </div>
    );
  }
}
