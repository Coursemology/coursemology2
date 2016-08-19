# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Requests' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:registrants) { create_list(:course_user, 2, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can approve and reject requests', js: true do
      user_to_approve, user_to_reject = registrants
      visit course_users_requests_path(course)

      within find(content_tag_selector(user_to_approve)) do
        choose('course_user_workflow_state_approved')
        click_button 'update'
      end

      wait_for_ajax
      expect(user_to_approve.reload).to be_approved
      expect(page).not_to have_content_tag_for(user_to_approve)
      expect(page).to have_text('course.users.update.request_success')

      find('.alert .close').click
      expect(page).not_to have_text('course.users.update.request_success')

      within find(content_tag_selector(user_to_reject)) do
        choose('course_user_workflow_state_rejected')
        click_button 'update'
      end

      wait_for_ajax
      expect(user_to_reject.reload).to be_rejected
      expect(page).not_to have_content_tag_for(user_to_reject)
      expect(page).to have_text('course.users.update.request_success')

      visit course_users_students_path(course)
      expect(page).to have_content_tag_for(user_to_approve)
      expect(page).not_to have_content_tag_for(user_to_reject)
    end

    # Allow user to request to enrol again in case she neglects to enter her
    # invitation code the first time
    scenario 'Course staff can delete request' do
      registrant = registrants.first
      visit course_users_requests_path(course)
      expect(page).to have_field('course_user_name', with: registrant.name)

      within find(content_tag_selector(registrant)) do
        find_link(nil, href: course_user_path(course, registrant)).click
      end

      expect(CourseUser.where(course: course, user: registrant.user)).
        to be_empty
    end
  end
end
