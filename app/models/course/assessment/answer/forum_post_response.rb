# frozen_string_literal: true
class Course::Assessment::Answer::ForumPostResponse < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name

  # A post pack is a group of 4 objects:
  #  - The core forum post
  #  - The parent post that the core post is replying to, if it exists
  #  - The forum that the post is under
  #  - The topic that the post is under
  #
  # This is mainly to facilitate the passing of related information around, especially
  # for rendering on the client side.
  has_many :post_packs, class_name: Course::Assessment::Answer::ForumPost.name,
                        dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]

    return unless params[:selected_post_packs]

    destroy_previous_selection

    params[:selected_post_packs].each do |selected_post_pack|
      create_post_pack selected_post_pack
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

  def create_post_pack(selected_post_pack)
    post_pack = post_packs.new

    post_pack.forum_topic_id = selected_post_pack[:topic][:id]

    post_pack.post_id = selected_post_pack[:corePost][:id]
    post_pack.post_text = selected_post_pack[:corePost][:text]
    post_pack.post_creator_id = selected_post_pack[:corePost][:creatorId]
    post_pack.post_updated_at = selected_post_pack[:corePost][:updatedAt]

    if selected_post_pack[:parentPost]
      post_pack.parent_id = selected_post_pack[:parentPost][:id]
      post_pack.parent_text = selected_post_pack[:parentPost][:text]
      post_pack.parent_creator_id = selected_post_pack[:parentPost][:creatorId]
      post_pack.parent_updated_at = selected_post_pack[:parentPost][:updatedAt]
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
    selected_post.is_post_updated = post ? is_later(post.updated_at, selected_post.post_updated_at) : nil
  end

  def compute_creator(selected_post)
    selected_post.post_creator = User.find_by(id: selected_post.post_creator_id)
  end

  def compute_parent(selected_post)
    return unless selected_post.parent_id

    parent = Course::Discussion::Post.find_by(id: selected_post.parent_id)
    selected_post.is_parent_deleted = parent.nil?
    # a post with a deleted parent will have is_parent_updated = nil
    selected_post.is_parent_updated = parent ? is_later(parent.updated_at, selected_post.parent_updated_at) : nil
    selected_post.parent_creator = User.find_by(id: selected_post.parent_creator_id)
  end

  # returns true if target_time is later than ref_time by > 0.01s
  # allowing a delta of 0.01s to account for possible truncations in datetime data
  def is_later(target_time, ref_time)
    target_time.to_f - ref_time.to_f > 0.01
  end
end
