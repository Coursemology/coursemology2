# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController do
  let!(:instance) { create(:instance) }

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

        it { is_expected.to render_template('edit') }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: immutable_assessment }

      context 'when destroy fails' do
        before { controller.instance_variable_set(:@assessment, immutable_assessment) }

        it 'redirects with a flash message' do
          expect(subject).to redirect_to(course_assessments_path(course))
          expect(flash[:danger]).to eq(I18n.t('course.assessment.assessments.destroy.failure'))
        end
      end
    end
  end
end
