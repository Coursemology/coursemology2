# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecordsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, :approved, course: course) }
    let(:user) { create(:course_teaching_assistant, :approved, course: course).user }
    let(:experience_points_history_path) do
      course_course_user_experience_points_records_path(course, course_student)
    end
    let(:points_record_stub) do
      stub = build_stubbed(:course_experience_points_record, course_user: course_student)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject do
        delete :destroy, course_id: course, course_user_id: course_student, id: points_record_stub
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@experience_points_record, points_record_stub)
          subject
        end

        it { is_expected.to redirect_to(experience_points_history_path) }
      end
    end
  end
end
