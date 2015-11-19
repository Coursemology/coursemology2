class Course::Assessment::Question::ProgrammingTemplateFile < ActiveRecord::Base
  belongs_to :question, class_name: Course::Assessment::Question::Programming.name,
                        inverse_of: :template_files
end
