# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SubmissionsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:categories) { create_list(:course_assessment_category, 2, course: course) }

    before { sign_in(user) }

    describe '#index' do
      context 'when no category is specified' do
        before { get :index, params: { course_id: course } }

        it 'sets the category to the first category' do
          first_category = course.assessment_categories.first
          expect(controller.instance_variable_get(:@category)).to eq(first_category)
        end
      end

      context 'when a category is specified' do
        let(:category) { categories.first }
        let(:tab) { create(:course_assessment_tab, course: course, category: category) }
        let(:student) { create(:course_student, course: course).user }
        let(:assessment) { create(:assessment, :with_all_question_types, course: course, tab: tab) }
        let!(:submission) do
          create(:submission, :published, creator: student, assessment: assessment)
        end
        before { get :index, params: { course_id: course, category: category } }

        it 'sets the category to be the specified category' do
          expect(controller.instance_variable_get(:@category)).to eq(category)
        end

        it 'loads the submissions from assessments in the specified category' do
          submissions = controller.instance_variable_get(:@submissions)
          expect(submissions).to contain_exactly(submission)
        end

        context 'when the category is specified in the filter' do
          before { get :index, params: { course_id: course, filter: { category_id: category.id } } }

          it 'sets the category to be the specified category' do
            expect(controller.instance_variable_get(:@category)).to eq(category)
          end
        end
      end
    end
  end
end
