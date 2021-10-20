# frozen_string_literal: true
class Course::Assessment::Answer::ForumPostResponse < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name

  has_many :post_packs, class_name: Course::Assessment::Answer::ForumPost.name,
                        dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]

    return unless params[:post_packs]

    destroy_previous_selection

    params[:post_packs].each do |post_pack|
      create_post_pack post_pack
    end
  end

  def compute_post_packs
    post_packs.each do |selected_post|
      compute_post(selected_post)
      compute_topic(selected_post)
      compute_creator(selected_post)
      compute_parent(selected_post)
    end
  end

  private

  def destroy_previous_selection
    post_packs.destroy_all
  end

  def create_post_pack(post_pack_info)
    post_pack = post_packs.new

    post_pack.forum_topic_id = post_pack_info[:topic][:id]

    post_pack.post_id = post_pack_info[:corePost][:id]
    post_pack.post_text = post_pack_info[:corePost][:text]
    post_pack.post_creator_id = post_pack_info[:corePost][:creatorId]
    post_pack.post_updated_at = post_pack_info[:corePost][:updatedAt]

    if post_pack_info[:parentPost]
      post_pack.parent_id = post_pack_info[:parentPost][:id]
      post_pack.parent_text = post_pack_info[:parentPost][:text]
      post_pack.parent_creator_id = post_pack_info[:parentPost][:creatorId]
      post_pack.parent_updated_at = post_pack_info[:parentPost][:updatedAt]
    end

    post_pack.save!
  end

  def compute_topic(selected_post)
    topic = Course::Forum::Topic.find_by(id: selected_post.forum_topic_id)
    selected_post.is_topic_deleted = topic.nil?
    if topic
      selected_post.topic_title = topic.title
      selected_post.forum_id = topic.forum.id
      selected_post.forum_name = topic.forum.name
    else
      selected_post.topic_title = nil
      selected_post.forum_id = nil
      selected_post.forum_name = nil
    end
  end

  def compute_post(selected_post)
    post = Course::Discussion::Post.find_by(id: selected_post.post_id)
    selected_post.is_post_deleted = post.nil?
    # a deleted post will have is_post_updated = nil
    selected_post.is_post_updated = post ? post.text != selected_post.post_text : nil
  end

  def compute_creator(selected_post)
    selected_post.post_creator = User.find_by(id: selected_post.post_creator_id)
  end

  def compute_parent(selected_post)
    return unless selected_post.parent_id

    parent = Course::Discussion::Post.find_by(id: selected_post.parent_id)
    selected_post.is_parent_deleted = parent.nil?
    # a post with a deleted parent will have is_parent_updated = nil
    selected_post.is_parent_updated = parent ? parent.text != selected_post.parent_text : nil
    selected_post.parent_creator = User.find_by(id: selected_post.parent_creator_id)
  end
end
