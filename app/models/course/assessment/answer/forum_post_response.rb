# frozen_string_literal: true
class Course::Assessment::Answer::ForumPostResponse < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name

  has_many :postpacks, class_name: Course::Assessment::Answer::ForumPost.name,
           dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]

    if params[:selectedPostpacks]
      destroy_previous_selection

      params[:selectedPostpacks].each do |selected_postpack|
        postpack = self.postpacks.new

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
  end

  private

  def destroy_previous_selection
    self.postpacks.destroy_all
  end
end
