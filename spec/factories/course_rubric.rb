# frozen_string_literal: true
FactoryBot.define do
  factory :course_rubric, class: 'Course::Rubric' do
    course
    sequence(:grading_prompt) { |n| "Grading prompt #{n}" }
    model_answer { 'Model answer' }

    transient do
      category_count { 2 }
      criterion_count { 2 }
    end

    after(:build) do |rubric, evaluator|
      evaluator.category_count.times do |i|
        category = Course::Rubric::Category.new(name: "Category #{i + 1}", is_bonus_category: false)
        # A grade-0 criterion is required; remaining grades are spaced out and unique within the category.
        category.criterions << Course::Rubric::Category::Criterion.new(grade: 0, explanation: 'Grade 0 criterion')
        (1...evaluator.criterion_count).each do |j|
          category.criterions << Course::Rubric::Category::Criterion.new(
            grade: j * 2, explanation: "Grade #{j * 2} criterion"
          )
        end
        rubric.categories << category
      end
    end
  end
end
