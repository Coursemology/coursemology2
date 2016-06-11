# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsDisbursementController, type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, :approved, course: course) }
    let(:user) { create(:course_teaching_assistant, :approved, course: course).user }
    let(:disbursement_stub) do
      stub = Course::ExperiencePointsDisbursement.new(course: course)
      record_stub = Course::ExperiencePointsRecord.new(course_user: course_student, reason: nil)
      stub.instance_variable_set(:@experience_points_records, [record_stub])
      stub
    end

    before { sign_in(user) }
    describe '#create' do
      subject { post :create, course_id: course }

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@experience_points_disbursement, disbursement_stub)
          subject
        end

        it { is_expected.to render_template('new') }
      end
    end
  end
end
