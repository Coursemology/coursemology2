import React, { Component } from 'react';

import { TopicProp } from '../../propTypes';
import CommentCard from './CommentCard';

export default class Comments extends Component {
  static propTypes = {
    topic: TopicProp,
  };

  render() {
    const { topic } = this.props;
    return (
      <div>
        <h3>Comments</h3>
        {topic.posts.map(post =>
          <CommentCard
            key={post.id}
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
