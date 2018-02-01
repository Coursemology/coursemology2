# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: EnrolRequests' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let!(:enrol_request) { create(:course_enrol_request, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can approve requests', js: true do
      visit course_enrol_requests_path(course)

      within find(content_tag_selector(enrol_request)) do
        find('.btn.approve').click
      end

      wait_for_ajax
      course_user = course.course_users.find_by(user_id: enrol_request.user.id)
      expect(course_user).to be_present
      expect(page).to have_no_content_tag_for(enrol_request)
      expect(page).to have_text('course.enrol_requests.approve.success')

      visit course_users_students_path(course)
      expect(page).to have_content_tag_for(course_user)
    end

    # Allow user to request to enrol again in case she neglects to enter her
    # invitation code the first time
    scenario 'Course staff can delete request' do
      visit course_enrol_requests_path(course)
      expect(page).to have_field('course_user_name', with: enrol_request.user.name)

      expect do
        within find(content_tag_selector(enrol_request)) do
          find_link(nil, href: course_enrol_request_path(course, enrol_request)).click
        end
      end.to change(course.enrol_requests, :count).by(-1)

      expect(current_path).to eq(course_enrol_requests_path(course))
      expect(page).to have_selector('div.alert',
                                    text: I18n.t('course.enrol_requests.destroy.success'))
    end
  end
end
