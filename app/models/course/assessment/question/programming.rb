class Course::Assessment::Question::Programming < ActiveRecord::Base
  # The table name for this model is singular.
  self.table_name = table_name.singularize

  acts_as :question, class_name: Course::Assessment::Question.name, inverse_of: :actable
  schema_validations except: :language

  validates :memory_limit, :time_limit, numericality: { greater_then: 0 }
  validate :validate_language

  belongs_to :import_job, class_name: TrackableJob::Job.name, inverse_of: nil
  has_many :template_files, class_name: Course::Assessment::Question::ProgrammingTemplateFile.name,
                            inverse_of: :question
  has_many :test_cases, class_name: Course::Assessment::Question::ProgrammingTestCase.name,
                        inverse_of: :question

  private

  def validate_language
  end
end
