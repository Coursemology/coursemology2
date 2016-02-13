# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecordsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course_user) { create(:course_user, user: user) }
    let!(:experience_points_record_stub) do
      stub = create(:course_experience_points_record, course_user: course_user)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#create' do
      subject do
        post :create, course_id: course_user.course,
                      course_user_id: course_user,
                      experience_points_record: experience_points_record_stub
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@experience_points_record,
                                           experience_points_record_stub)
          subject
        end

        it { is_expected.to render_template('new') }
      end
    end
  end
end
