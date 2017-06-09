# frozen_string_literal: true
class Course::Assessment::Answer::TextResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name
  has_many_attachments

  after_initialize :set_default
  before_validation :strip_whitespace

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.answer_text = ''
    save
    acting_as
  end

  def sanitized_answer_text
    Sanitize.fragment(answer_text).strip
  end

  def download(dir)
    download_answer(dir) unless question.actable.file_upload_question?
    attachments.each { |a| download_attachment(a, dir) }
  end

  def download_answer(dir)
    answer_path = File.join(dir, 'answer.txt')
    File.open(answer_path, 'w') do |file|
      file.write(sanitized_answer_text)
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

  private

  def set_default
    self.answer_text ||= ''
  end

  def strip_whitespace
    answer_text.strip!
  end
end
