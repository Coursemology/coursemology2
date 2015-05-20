require 'rails_helper'

RSpec.describe 'Courses: Users', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:user, role: :administrator) }
    before { login_as(user, scope: :user) }

    describe 'Visiting users page' do
      subject { visit course_users_path(course) }
      it 'does not change user count' do
        expect { subject }.not_to change { course.course_users.reload.count }
      end
    end

    describe "Changing users' names" do
      let(:new_name) { 'NewNamePerson' }
      let!(:course_users) { create_list(:course_user, 3, course: course) }
      before { visit course_users_path(course) }

      it 'changes the name of the user when saved' do
        within('form.edit_course_user:first') do
          fill_in 'course_user_name', with: new_name
          click_button 'submit'

          expect(subject).to have_field('course_user_name', with: new_name)
        end
      end
    end

    describe "Changing users' phantom status" do
      let!(:course_users) { create_list(:course_user, 3, course: course, phantom: false) }
      let(:user_to_change) { course_users[Random.rand(course_users.length)] }
      before do
        user_to_change.name << '$'
        user_to_change.save!
      end
      before { visit course_users_path(course) }

      it 'changes the phantom status of the user when saved' do
        within find_field('course_user_name', with: user_to_change.name).find(:xpath, '../../..') do
          check 'phantom'
          click_button 'submit'

          expect(subject).to have_checked_field('phantom')
        end
      end
    end

    describe 'Deleting users' do
      let!(:course_user) { create(:course_user, course: course) }
      before { visit course_users_path(course) }

      it 'deletes the selected user' do
        expect do
          find_link(nil, href: course_user_path(course, course_user)).click
        end.to change { page.all('form.edit_course_user').count }.by(-1)
        expect(subject).to_not have_field('course_user_name', with: course_user.name)
      end
    end
  end
end
