require 'rails_helper'

RSpec.feature 'Course: Requests' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let!(:unregistered_user) { create(:course_student, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can approve request' do
      visit course_users_requests_path(course)
      expect(page).to have_field('course_user_name', with: unregistered_user.name)

      within find_form(nil, action: course_user_path(course, unregistered_user)) do
        choose('course_user_workflow_state_approved')
        find_button('update').click
      end

      expect(current_path).to eq(course_users_requests_path(course))
      expect(page).to_not have_field('course_user_name', with: unregistered_user.name)

      visit course_users_students_path(course)
      expect(page).to have_field('course_user_name', with: unregistered_user.name)
    end

    scenario 'Course staff can reject request' do
      visit course_users_requests_path(course)
      expect(page).to have_field('course_user_name', with: unregistered_user.name)

      within find_form(nil, action: course_user_path(course, unregistered_user)) do
        choose('course_user_workflow_state_rejected')
        find_button('update').click
      end

      expect(current_path).to eq(course_users_requests_path(course))
      expect(page).not_to have_field('course_user_name', with: unregistered_user.name)

      visit course_users_requests_path(course)
      expect(page).not_to have_field('course_user_name', with: unregistered_user.name)
    end
  end
end
