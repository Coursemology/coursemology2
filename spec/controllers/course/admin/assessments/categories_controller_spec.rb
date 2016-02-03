# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::Assessments::CategoriesController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course, creator: user) }
    let!(:category_stub) do
      stub = create(:course_assessment_category, course: course)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#create' do
      subject { post :create, course_id: course }
      context 'upon create failure' do
        before do
          controller.instance_variable_set(:@category, category_stub)
          subject
        end
        it { is_expected.to render_template(:new) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: category_stub }
      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@category, category_stub)
          subject
        end
        it 'redirects with a flash message' do
          it { is_expected.to redirect_to(course_admin_assessments_path(current_course)) }
          expect(flash[:danger]).to(eq(I18n.t('course.admin.assessments.categories.destroy.failure',
                                              error: '')))
        end
      end
    end
  end
end
