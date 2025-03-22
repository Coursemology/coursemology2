# frozen_string_literal: true
class Course::Forum::Import < ApplicationRecord
  include Workflow
  include DuplicationStateTrackingConcern

  workflow do
    state :not_imported do
      event :start_importing, transitions_to: :importing
    end
    state :importing do
      event :finish_importing, transitions_to: :imported
      event :cancel_importing, transitions_to: :not_imported
    end
    state :imported do
      event :delete_import, transitions_to: :not_imported
    end
  end

  belongs_to :course, class_name: 'Course', foreign_key: :course_id, inverse_of: :forum_imports
  belongs_to :imported_forum, class_name: 'Course::Forum', foreign_key: :imported_forum_id
  belongs_to :job, class_name: 'TrackableJob::Job', inverse_of: nil, optional: true
  has_many :discussion_references, class_name: 'Course::Forum::DiscussionReference',
                                   inverse_of: :forum_import, autosave: true, dependent: :destroy
  has_many :discussions, through: :discussion_references, autosave: true

  validates :course, presence: true
  validates :imported_forum, presence: true
  validates :workflow_state, length: { maximum: 255 }, presence: true

  class << self
    def forum_importing!(forum_imports, current_user)
      return if forum_imports.empty?

      Course::Forum::ImportingJob.perform_later(forum_imports.pluck(:id), current_user).tap do |job|
        forum_imports.update_all(job_id: job.job_id)
      end
    end

    def destroy_imported_discussions(forum_import_ids)
      ActiveRecord::Base.transaction do
        forum_imports = Course::Forum::Import.where(id: forum_import_ids, workflow_state: 'imported')
        forum_imports.each do |forum_import|
          forum_import.discussion_references.destroy_all
          forum_import.delete_import!
          forum_import.save!
        end
      end
      true
    end
  end

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    self.discussion_references = other.discussion_references.
                                 map { |discussion_reference| duplicator.duplicate(discussion_reference) }
    set_duplication_flag
  end

  def build_discussions(current_user)
    imported_forum.topics.each do |topic|
      discussion_data = RagWise::DiscussionExtractionService.new(topic.course, topic,
                                                                 topic.posts.only_published_posts).call
      next if discussion_data[:discussion].empty?

      existing_discussion = Course::Forum::Discussion.existing_discussion(discussion_data[:discussion])
      if existing_discussion.exists?
        create_references_for_existing_discussion(existing_discussion.first, current_user)
      else
        create_new_discussion_and_reference(discussion_data, current_user)
      end
    end
    save!
  end

  private

  def create_new_discussion_and_reference(discussion_data, current_user)
    topic_title_and_post = [
      discussion_data[:topic_title],
      discussion_data[:discussion].first[:text]
    ].compact.join(' ')
    embedding = LANGCHAIN_OPENAI.embed(text: topic_title_and_post, model: 'text-embedding-ada-002').embedding

    discussion_references.build(
      creator: current_user,
      updater: current_user,
      discussion: Course::Forum::Discussion.new(
        discussion: discussion_data,
        name: Digest::SHA256.hexdigest(discussion_data[:discussion].to_json),
        embedding: embedding
      )
    )
  end

  def create_references_for_existing_discussion(existing_discussion, current_user)
    discussion_references.build(
      discussion: existing_discussion,
      creator: current_user,
      updater: current_user
    )
  end

  def post_creator_role(course, post)
    course_user = course.course_users.find_by(user: post.creator)
    return 'System AI Response' unless course_user || !post[:is_ai_generated]
    return 'Teaching Staff' if course_user&.teaching_staff?
    return 'Student' if course_user&.real_student?

    'Not Found'
  end
end
