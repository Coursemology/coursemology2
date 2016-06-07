# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentNotifier, type: :notifier do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    describe '#assessment_attempted' do
      let(:course) { create(:course) }
      let(:assessment) { create(:course_assessment_assessment, course: course) }
      let(:user) { create(:course_user, course: course).user }

      subject { Course::AssessmentNotifier.assessment_attempted(user, assessment) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end
    end
  end
end
