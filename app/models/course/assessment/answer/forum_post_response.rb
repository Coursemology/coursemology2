# frozen_string_literal: true
class Course::Assessment::Answer::ForumPostResponse < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name

  has_many :postpacks, class_name: Course::Assessment::Answer::ForumPost.name,
                       dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]

    return unless params[:selected_postpacks]

    destroy_previous_selection

    params[:selected_postpacks].each do |selected_postpack|
      postpack = postpacks.new

      postpack.forum_topic_id = selected_postpack[:topic][:id]

      postpack.post_id = selected_postpack[:corePost][:id]
      postpack.post_text = selected_postpack[:corePost][:text]
      postpack.post_creator_id = selected_postpack[:corePost][:creatorId]
      postpack.post_updated_at = selected_postpack[:corePost][:updatedAt]

      if selected_postpack[:parentPost]
        postpack.parent_id = selected_postpack[:parentPost][:id]
        postpack.parent_text = selected_postpack[:parentPost][:text]
        postpack.parent_creator_id = selected_postpack[:parentPost][:creatorId]
        postpack.parent_updated_at = selected_postpack[:parentPost][:updatedAt]
      end

      postpack.save!
    end
  end

  def get_postpacks
    postpacks.each do |selected_post|
      topic = Course::Forum::Topic.find_by(id: selected_post.forum_topic_id)
      selected_post.is_topic_deleted = topic.nil?
      if topic
        selected_post.topic_title = topic.title

        forum = topic.forum
        selected_post.forum_id = forum.id
        selected_post.forum_name = forum.name
      else
        selected_post.topic_title = nil
        selected_post.forum_id = nil
        selected_post.forum_name = nil
      end

      post = Course::Discussion::Post.find_by(id: selected_post.post_id)
      selected_post.is_post_deleted = post.nil?
      # a deleted post will have is_post_updated = nil
      selected_post.is_post_updated = post ? post.text != selected_post.post_text : nil
      selected_post.post_creator = User.find_by(id: selected_post.post_creator_id)

      next unless selected_post.parent_id

      parent = Course::Discussion::Post.find_by(id: selected_post.parent_id)
      selected_post.is_parent_deleted = parent.nil?
      # a deleted parent will have is_parent_updated = nil
      selected_post.is_parent_updated = parent ? parent.text != selected_post.parent_text : nil
      selected_post.parent_creator = User.find_by(id: selected_post.parent_creator_id)
    end
  end

  private

  def destroy_previous_selection
    postpacks.destroy_all
  end
end
