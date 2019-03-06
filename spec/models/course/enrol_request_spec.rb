# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::EnrolRequest, type: :model do
  it 'belongs to a course' do
    expect(subject).to belong_to(:course).
      inverse_of(:enrol_requests).
      without_validating_presence
  end
  it 'belongs to a user' do
    expect(subject).to belong_to(:user).
      inverse_of(:course_enrol_requests).
      without_validating_presence
  end

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course) }

    describe 'validations' do
      context 'when enrolled user is an existing course_user' do
        let!(:student) { create(:course_student, course: course) }
        subject { build(:course_enrol_request, course: course, user: student.user) }

        it 'is not valid' do
          expect(subject.valid?).to be_falsey
          expect(subject.errors[:base]).to include(
            I18n.t('activerecord.errors.models.course/enrol_request.user_in_course')
          )
        end
      end
    end
  end
end
