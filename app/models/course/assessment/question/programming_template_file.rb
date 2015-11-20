class Course::Assessment::Question::ProgrammingTemplateFile < ActiveRecord::Base
  schema_validations except: :content

  validates :content, exclusion: [nil]

  belongs_to :question, class_name: Course::Assessment::Question::Programming.name,
                        inverse_of: :template_files

  # Copies the current template into the provided answer.
  #
  # This preserves the filename and contents.
  #
  # @param [Course::Assessment::Answer::Programming] answer The answer to copy the template into.
  # @return [Course::Assessment::Answer::ProgrammingFile] The copied file.
  def copy_template_to(answer)
    answer.files.build(filename: filename, content: content)
  end
end
