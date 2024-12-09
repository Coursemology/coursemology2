# frozen_string_literal: true
class Course::Material < ApplicationRecord
  has_one_attachment
  include DuplicationStateTrackingConcern
  include Workflow

  workflow do
    state :not_chunked do
      event :start_chunking, transitions_to: :chunking
    end
    # State where there is a job running to chunk course materials
    state :chunking do
      event :finish_chunking, transitions_to: :chunked
      event :cancel_chunking, transitions_to: :not_chunked
    end
    # The state where chunking job is completed and course_materials is chunked
    state :chunked do
      event :delete_chunks, transitions_to: :not_chunked
    end
  end

  belongs_to :folder, inverse_of: :materials, class_name: 'Course::Material::Folder'
  has_many :text_chunks, inverse_of: :material, class_name: 'Course::Material::TextChunk',
                         dependent: :destroy, foreign_key: :course_material_id, autosave: true
  has_one :text_chunking, class_name: 'Course::Material::TextChunking',
                          dependent: :destroy, inverse_of: :material, autosave: true

  before_save :touch_folder

  validate :validate_name_is_unique_among_folders
  validates_with FilenameValidator
  validates :name, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :folder, presence: true
  validates :name, uniqueness: { scope: [:folder_id], case_sensitive: false,
                                 if: -> { folder_id? && name_changed? } }
  validates :folder_id, uniqueness: { scope: [:name], case_sensitive: false,
                                      if: -> { name? && folder_id_changed? } }
  validates :workflow_state, presence: true

  scope :in_concrete_folder, -> { joins(:folder).merge(Folder.concrete) }

  def touch_folder
    folder.touch if !duplicating? && changed?
  end

  # Returns the path of the material
  #
  # @return [Pathname] The path of the material
  def path
    folder.path + name
  end

  # Return false to prevent the userstamp gem from changing the updater during duplication
  def record_userstamp
    !duplicating?
  end

  # Finds a unique name for the current material among its siblings.
  #
  # @return [String] A unique name.
  def next_valid_name
    folder.next_uniq_child_name(self)
  end

  def initialize_duplicate(duplicator, other)
    self.attachment = duplicator.duplicate(other.attachment)
    self.folder = if duplicator.duplicated?(other.folder)
                    duplicator.duplicate(other.folder)
                  else
                    # If parent has not been duplicated yet, put the current duplicate under the root folder
                    # temorarily. The material will be re-parented only afterwards when the parent folder is being
                    # duplicated. This will be done when `#initialize_duplicate_children` is called on the
                    # duplicated parent folder.
                    #
                    # If the material's folder is not selected for duplication, the current duplicated material will
                    # remain a child of the root folder.
                    duplicator.options[:destination_course].root_folder
                  end
    self.updated_at = other.updated_at
    self.created_at = other.created_at
    set_duplication_flag
  end

  def before_duplicate_save(_duplicator)
    self.name = next_valid_name
  end

  def text_chunking!(current_user)
    ensure_text_chunking!
    Course::Material::TextChunkJob.perform_later(self, current_user).tap do |job|
      text_chunking.update_column(:job_id, job.job_id)
    end
  end

  def build_text_chunks(current_user)
    start_chunking!
    save!
    course_id = folder.course_id
    File.open(attachment.path, 'r:ASCII-8BIT') do |file|
      llm_service = Rag::LlmService.new
      chunking_service = Rag::ChunkingService.new(file: file)
      chunks = chunking_service.file_chunking
      embeddings = llm_service.generate_embeddings_from_chunks(chunks)
      chunks.each_with_index do |chunk, index|
        text_chunks.build(embedding: embeddings[index], content: chunk, creator: current_user,
                          course_id: course_id)
      end
    end
    save!
  end

  private

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that material won't have the same name with other child folders in the folder
  # Schema validations already ensure that it won't have the same name as other materials
  def validate_name_is_unique_among_folders
    return if folder.nil?

    conflicts = folder.children.where('name ILIKE ?', name)
    errors.add(:name, :taken) unless conflicts.empty?
  end

  def ensure_text_chunking!
    ActiveRecord::Base.transaction(requires_new: true) do
      text_chunking || create_text_chunking!
    end
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    raise e if e.is_a?(ActiveRecord::RecordInvalid) && e.record.errors[:material_id].empty?

    association(:text_chunking).reload
    text_chunking
  end
end
