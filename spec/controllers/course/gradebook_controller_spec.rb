# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GradebookController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_user, :student, course: course) }
    let(:staff) { create(:course_user, :teaching_assistant, course: course) }

    describe '#index' do
      subject { get :index, params: { course_id: course.id }, format: :json }

      context 'when user is a staff member' do
        before { sign_in staff.user }

        it 'returns HTTP 200' do
          subject
          expect(response).to have_http_status(:ok)
        end

        it 'returns JSON with required keys' do
          subject
          data = JSON.parse(response.body)
          expect(data).to have_key('categories')
          expect(data).to have_key('tabs')
          expect(data).to have_key('assessments')
          expect(data).to have_key('students')
          expect(data).to have_key('submissions')
        end

        it 'includes the student with email, externalId, and level in the students array' do
          student
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.id }
          expect(student_data).not_to be_nil
          expect(student_data).to have_key('email')
          expect(student_data).to have_key('externalId')
          expect(student_data).to have_key('level')
          expect(student_data['level']).to be_a(Integer)
        end
      end

      context 'when user is a student' do
        before { sign_in student.user }

        it 'returns HTTP 403' do
          subject
          expect(response).to have_http_status(:forbidden)
        end
      end
    end
  end
end
