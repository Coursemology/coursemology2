# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: EnrolRequests', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let!(:enrol_request) { create(:course_enrol_request, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can approve requests' do
      visit course_enrol_requests_path(course)

      within find("tr.pending_enrol_request_#{enrol_request.id}") do
        find("button.enrol-request-approve-#{enrol_request.id}").click
      end

      expect_toastify("Approved enrol request of #{enrol_request.user.name}!")
      enrol_request.reload
      expect(enrol_request.workflow_state).to eq('approved')

      course_user = course.course_users.find_by(user_id: enrol_request.user.id)
      expect(course_user).to be_present

      expect(current_path).to eq(course_enrol_requests_path(course))
      expect(page).to_not have_selector("tr.pending_enrol_request_#{enrol_request.id}")
      expect(page).to have_selector("tr.approved_enrol_request_#{enrol_request.id}")

      visit course_users_students_path(course)
      expect(page).to have_selector("tr.course_user_#{course_user.id}")
    end

    scenario 'Course staff can reject request' do
      visit course_enrol_requests_path(course)

      expect(page).to have_selector("tr.pending_enrol_request_#{enrol_request.id}")

      expect do
        within find("tr.pending_enrol_request_#{enrol_request.id}") do
          find("button.enrol-request-reject-#{enrol_request.id}").click
        end
        accept_prompt
      end.to change(course.enrol_requests, :count).by(0)

      expect_toastify("Enrol request for #{enrol_request.user.name} was rejected.")
      enrol_request.reload

      expect(enrol_request.workflow_state).to eq('rejected')
      expect(current_path).to eq(course_enrol_requests_path(course))
      expect(page).to_not have_selector("tr.pending_enrol_request_#{enrol_request.id}")
      expect(page).to have_selector("tr.rejected_enrol_request_#{enrol_request.id}")
    end
  end
end
