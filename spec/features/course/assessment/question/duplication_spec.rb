# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Questions: Duplication Spec', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:skill) { build(:course_assessment_skill, course: course) }
    let(:mcq_source_assessment) do
      create(:assessment, :with_mcq_question, course: course).tap do |assessment|
        mcq_question = assessment.questions.first
        mcq_question.question_assessments.first.skills << skill
      end
    end
    let(:second_source_assessment) do
      create(:assessment, :with_programming_question, course: course).tap do |assessment|
        programming_question =
          assessment.questions.where(actable_type: 'Course::Assessment::Question::Programming').first
        programming_question.question_assessments.first.skills << skill
      end
    end
    let(:rubric_source_assessment) do
      create(:assessment, :with_rubric_question, course: course).tap do |assessment|
        rubric_question =
          assessment.questions.where(actable_type: 'Course::Assessment::Question::RubricBasedResponse').first
        rubric_question.question_assessments.first.skills << skill
      end
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let!(:question) { mcq_source_assessment.questions.first }
      let!(:programming_question) do
        questions = second_source_assessment.questions

        questions.where(actable_type: 'Course::Assessment::Question::Programming').first
      end
      let!(:rubric_question) do
        questions = rubric_source_assessment.questions

        questions.where(actable_type: 'Course::Assessment::Question::RubricBasedResponse').first
      end

      context 'upon duplicating a question' do
        let!(:first_destination_assessment) { create(:assessment, course: course) }

        scenario 'I can duplicate that question from one assessment to another' do
          visit course_assessment_path(course, mcq_source_assessment)

          expect(first_destination_assessment.questions.count).to be(0)

          within all('section', text: question.title).first do
            click_button 'Duplicate'
          end

          find('li', text: first_destination_assessment.title).click
          expect_toastify('Your question has been duplicated.')

          expect(first_destination_assessment.questions.reload.count).to eq(1)

          duplicated_question = first_destination_assessment.questions.last
          expect(duplicated_question.title).to eq(question.title)
          expect(duplicated_question.question_assessments.first.skills.first.id).
            to eq(question.question_assessments.first.skills.first.id)
        end
      end

      context 'upon duplicating a rubric-based response question' do
        let!(:rubric_destination_assessment) { create(:assessment, course: course) }

        scenario 'I can duplicate that question from one assessment to another' do
          visit course_assessment_path(course, rubric_source_assessment)

          expect(rubric_destination_assessment.questions.count).to be(0)

          within all('section', text: rubric_question.title).first do
            click_button 'Duplicate'
          end

          find('li', text: rubric_destination_assessment.title).click
          expect_toastify('Your question has been duplicated.')

          expect(rubric_destination_assessment.questions.reload.count).to eq(1)
          duplicated_question = rubric_destination_assessment.questions.last
          expect(duplicated_question.title).to eq(rubric_question.title)
          expect(duplicated_question.question_assessments.first.skills.first.id).
            to eq(rubric_question.question_assessments.first.skills.first.id)

          visit course_assessment_path(course, rubric_destination_assessment)

          expect(page).to have_text(rubric_destination_assessment.title)
        end
      end

      context 'upon duplicating deprecated programming language question' do
        let!(:second_destination_assessment) { create(:assessment, course: course) }
        let!(:language) { programming_question.specific.language }

        # Disable the language before the test, and enable it after the test
        # Direct SQL is used to avoid the readonly limitations
        before do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = false WHERE id = #{language.id}"
          )
          programming_question.reload
        end

        after do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = true WHERE id = #{language.id}"
          )
        end

        scenario 'I can also duplicate that question from one assessment to another' do
          visit course_assessment_path(course, second_source_assessment)

          expect(second_destination_assessment.questions.count).to be(0)

          within all('section', text: programming_question.title).first do
            click_button 'Duplicate'
          end

          find('li', text: second_destination_assessment.title).click
          expect_toastify('Your question has been duplicated.')

          expect(second_destination_assessment.questions.reload.count).to eq(1)
          duplicated_question = second_destination_assessment.questions.last
          expect(duplicated_question.title).to eq(programming_question.title)
          expect(duplicated_question.question_assessments.first.skills.first.id).
            to eq(programming_question.question_assessments.first.skills.first.id)

          visit course_assessment_path(course, second_destination_assessment)

          expect(page).to have_text(second_destination_assessment.title)
        end
      end
    end
  end
end
