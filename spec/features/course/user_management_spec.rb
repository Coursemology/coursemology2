require 'rails_helper'

RSpec.feature 'Courses: Users' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:user, role: :administrator) }
    let!(:course_users) { create_list(:course_student, 3, :approved, course: course) }
    let!(:unregistered_user) { create(:course_user, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can view the list of users registered' do
      visit course_users_path(course)
      expect(page).not_to have_field('course_user_name', with: unregistered_user.name)

      course_users.each do |course_user|
        expect(page).to have_field('course_user_name', with: course_user.name)
      end
    end

    scenario "Course staff can change users' names" do
      NEW_NAME = 'NewNamePerson'.freeze

      visit course_users_path(course)
      within('form.edit_course_user:first') do
        fill_in 'course_user_name', with: NEW_NAME
        click_button 'submit'

        expect(page).to have_field('course_user_name', with: NEW_NAME)
      end
    end

    scenario "Course staff can change users' phantom status" do
      user_to_change = course_users[Random.rand(course_users.length)]

      visit course_users_path(course)
      within find_field('course_user_name', with: user_to_change.name).find(:xpath, '../../..') do
        check 'phantom'
        click_button 'submit'

        expect(page).to have_checked_field('phantom')
      end
    end

    scenario 'Course staff can delete users' do
      user_to_delete = course_users.first

      visit course_users_path(course)
      expect do
        find_link(nil, href: course_user_path(course, user_to_delete)).click
      end.to change { page.all('form.edit_course_user').count }.by(-1)
      expect(page).to_not have_field('course_user_name', with: user_to_delete.name)
    end
  end
end
