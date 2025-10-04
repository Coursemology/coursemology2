# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponse::RubricAdapter <
  Course::Rubric::LlmService::RubricAdapter
  def initialize(question)
    super()
    @question = question
  end

  def formatted_rubric_categories
    @question.categories.without_bonus_category.includes(:criterions).map do |category|
      max_grade = category.criterions.maximum(:grade) || 0
      criterions = category.criterions.map do |criterion|
        "<BAND id=\"#{criterion.id}\" grade=\"#{criterion.grade}\">#{criterion.explanation}</BAND>"
      end
      <<~CATEGORY
        <CATEGORY id=\"#{category.id}\" name=\"#{category.name}\" max_grade=\"#{max_grade}\">
        #{criterions.join("\n")}
        </CATEGORY>
      CATEGORY
    end.join("\n\n")
  end

  def grading_prompt
    @question.ai_grading_custom_prompt
  end

  # Generates dynamic JSON schema with separate fields for each category
  # @return [Hash] Dynamic JSON schema with category-specific fields
  def generate_dynamic_schema
    dynamic_schema = JSON.parse(
      File.read('app/services/course/assessment/answer/prompts/rubric_auto_grading_output_format.json')
    )
    @question.categories.without_bonus_category.includes(:criterions).each do |category|
      field_name = "category_#{category.id}"
      dynamic_schema['properties']['category_grades']['properties'][field_name] =
        build_category_schema(category, field_name)
      dynamic_schema['properties']['category_grades']['required'] << field_name
    end
    dynamic_schema
  end

  def build_category_schema(category, field_name)
    criterion_ids_with_grades = category.criterions.map { |c| "criterion_#{c.id}_grade_#{c.grade}" }
    {
      'type' => 'object',
      'properties' => {
        'criterion_id_with_grade' => {
          'type' => 'string',
          'enum' => criterion_ids_with_grades,
          'description' => "Selected criterion for #{field_name}"
        },
        'explanation' => {
          'type' => 'string',
          'description' => "Explanation for selected criterion in #{field_name}"
        }
      },
      'required' => ['criterion_id_with_grade', 'explanation'],
      'additionalProperties' => false,
      'description' => "Selected criterion and explanation for #{field_name} #{category.name}"
    }
  end
end
