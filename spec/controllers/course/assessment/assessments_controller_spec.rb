# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:category) { course.assessment_categories.first }
    let(:tab) { category.tabs.first }
    let!(:immutable_assessment) do
      create(:assessment, course: course).tap do |stub|
        allow(stub).to receive(:destroy).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#index' do
      context 'when a category is given' do
        before do
          post :index,
               course_id: course,
               id: immutable_assessment,
               assessment: { title: '' },
               category: category
        end
        it { expect(controller.instance_variable_get(:@category)).to eq(category) }
      end

      context 'when a tab is given' do
        before do
          post :index,
               course_id: course,
               id: immutable_assessment,
               assessment: { title: '' },
               category: category,
               tab: tab
        end
        it { expect(controller.instance_variable_get(:@tab)).to eq(tab) }
      end
    end

    describe '#update' do
      subject do
        post :update, course_id: course, id: immutable_assessment, assessment: { title: '' }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@assessment, immutable_assessment)
          subject
        end

        it 'renders JSON errors' do
          body = JSON.parse(response.body)
          expect(body['errors']).to be_present
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: immutable_assessment }

      context 'when destroy fails' do
        before { controller.instance_variable_set(:@assessment, immutable_assessment) }

        it 'redirects with a flash message' do
          expect(subject).to redirect_to(course_assessment_path(course, immutable_assessment))
          expect(flash[:danger]).to eq(I18n.t('course.assessment.assessments.destroy.failure'))
        end
      end
    end

    describe '#add_assessment_breadcrumbs' do
      let(:breadcrumbs) { controller.send(:breadcrumb_names) }
      let(:tabs) { 1 }
      before do
        create_list(:course_assessment_tab, tabs - 1,
                    category: course.assessment_categories.first)
        get :index, course_id: course.id
      end

      context 'when the category has one tab' do
        it 'only displays the category' do
          expect(breadcrumbs).to include(course.assessment_categories.first.title)
          expect(breadcrumbs).not_to include(course.assessment_categories.first.tabs.first.title)
        end
      end

      context 'when the category has more than one tab' do
        let(:tabs) { 2 }
        it 'also displays the tab' do
          expect(breadcrumbs).to include(course.assessment_categories.first.title)
          expect(breadcrumbs).to include(course.assessment_categories.first.tabs.first.title)
        end
      end
    end

    describe '#reorder' do
      let!(:questions) do
        create_list(:course_assessment_question, 2, assessment: immutable_assessment)
      end

      context 'when a valid ordering is given' do
        let(:reversed_order) { immutable_assessment.questions.map(&:id).reverse }

        before do
          post :reorder, format: :js, course_id: course, id: immutable_assessment,
                         question_order: reversed_order.map(&:to_s)
        end

        it 'reorders questions' do
          expect(immutable_assessment.questions.pluck(:id)).to eq(reversed_order)
        end
      end

      context 'when an invalid ordering is given' do
        subject do
          post :reorder, format: :js, course_id: course, id: immutable_assessment,
                         question_order: [questions.first.id]
        end

        it 'raises ArgumentError' do
          expect { subject }.
            to raise_error(ArgumentError, 'Invalid ordering for assessment questions')
        end
      end
    end
  end
end
