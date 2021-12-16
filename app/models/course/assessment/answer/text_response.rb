# frozen_string_literal: true
class Course::Assessment::Answer::TextResponse < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name
  has_many_attachments

  after_initialize :set_default
  before_validation :strip_whitespace
  validate :validate_filenames_are_unique, if: :attachments_changed?

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.answer_text = ''
    save
    acting_as
  end

  # Normalize the newlines to \n.
  def normalized_answer_text
    answer_text.strip.encode(universal_newline: true)
  end

  def download(dir)
    download_answer(dir) unless question.actable.file_upload_question?
    attachments.each { |a| download_attachment(a, dir) }
  end

  def csv_download
    ActionController::Base.helpers.strip_tags(answer_text)
  end

  def download_answer(dir)
    answer_path = File.join(dir, 'answer.txt')
    File.open(answer_path, 'w') do |file|
      file.write(normalized_answer_text)
    end
  end

  def download_attachment(attachment, dir)
    name_generator = FileName.new(File.join(dir, attachment.name), position: :middle,
                                                                   format: '(%d)',
                                                                   delimiter: ' ')
    attachment_path = name_generator.create
    File.open(attachment_path, 'wb') do |file|
      attachment.open(binmode: true) do |attachment_stream|
        FileUtils.copy_stream(attachment_stream, file)
      end
    end
  end

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]
    self.files = params[:files] if params[:files]
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::TextResponse)

    same_text = answer_text == other_answer.answer_text
    same_attachment_length = attachments.length == other_answer.attachments.length
    answer_filename_attachment = attachments.pluck(:name, :attachment_id).map { |elem| elem.join('#') }
    other_answer_filename_content = other_answer.attachments.pluck(:name, :attachment_id).map { |elem| elem.join('#') }

    same_attachment = Set.new(answer_filename_attachment) == Set.new(other_answer_filename_content)
    same_text && same_attachment_length && same_attachment
  end

  private

  def set_default
    self.answer_text ||= ''
  end

  def strip_whitespace
    answer_text.strip!
  end

  def validate_filenames_are_unique
    return if attachments.map(&:name).uniq.count == attachments.size

    errors.add(:attachments, :unique)
  end
end
