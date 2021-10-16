# frozen_string_literal: true
class Course::Assessment::Submission::Answer::ForumPostResponse::PostsController < \
  Course::Assessment::Submission::Answer::Controller
  
  # TODO: add access control

  def selected
    answer = Course::Assessment::Answer.find_by(id: post_params[:answer_id])
    @selected_posts = Course::Assessment::Answer::ForumPost.where(answer_id: answer.specific.id)

    @selected_posts.each do |selected_post|
      topic = Course::Forum::Topic.find_by(id: selected_post.forum_topic_id)
      selected_post.is_topic_deleted = topic.nil?
      if topic
        selected_post.topic_title = topic.title
        forum = topic.forum
        selected_post.is_forum_deleted = forum.nil?

        if forum
          selected_post.forum_id = forum.id
          selected_post.forum_name = forum.name
        else
          selected_post.forum_id = nil
          selected_post.forum_name = nil
        end
      else
        selected_post.topic_title = nil
        selected_post.is_forum_deleted = nil
        selected_post.forum_id = nil
        selected_post.forum_name = nil
      end

      post = Course::Discussion::Post.find_by(id: selected_post.post_id)
      selected_post.is_post_deleted = post.nil?
      # a deleted post will have is_post_updated = nil
      selected_post.is_post_updated = post ? post.text != selected_post.post_text : nil
      selected_post.post_creator = User::find_by(id: selected_post.post_creator_id)

      if selected_post.parent_id
        parent = Course::Discussion::Post.find_by(id: selected_post.parent_id)
        selected_post.is_parent_deleted = parent.nil?
        # a deleted parent will have is_parent_updated = nil
        selected_post.is_parent_updated = parent ? parent.text != selected_post.parent_text : nil
        selected_post.parent_creator = User::find_by(id: selected_post.parent_creator_id)
      end
    end
  end

  private

  def post_params
    params.permit(:answer_id)
  end
end