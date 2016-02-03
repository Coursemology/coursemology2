# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Groups' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:groups) { create_list(:course_group, 3, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can view the Group Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.groups.sidebar_title')
      end

      scenario 'I can view all the groups in course' do
        visit course_groups_path(course)

        expect(page).to have_link(nil, href: new_course_group_path(course))

        groups.each do |group|
          expect(page).to have_selector('th', text: group.name)
          expect(page).to have_link(nil, href: edit_course_group_path(course, group))
          expect(page).to have_link(nil, href: course_group_path(course, group))
        end
      end

      let!(:course_users) { create_list(:course_user, 3, :approved, course: course) }
      let(:sample_user) { course_users.sample.user }
      scenario 'I can create a group' do
        visit new_course_group_path(course)

        click_button 'create'
        expect(page).to have_css('div.has-error')

        fill_in 'group_name', with: 'Group name'

        within '#group_user_ids' do
          find("option[value='#{sample_user.id}']").select_option
        end

        click_button 'create'
        expect(sample_user.course_groups.count).to eq(1)
      end

      let(:group) { create(:course_group, course: course) }
      scenario 'I cannot set the group title to empty' do
        visit edit_course_group_path(course, group)

        fill_in 'group_name', with: ''
        click_button 'update'
        expect(page).to have_css('div.has-error')
      end

      let!(:group_to_delete) { create(:course_group, course: course) }
      scenario 'I can delete a group' do
        group_delete_path = course_group_path(course, group_to_delete)

        visit course_groups_path(course)

        expect do
          find_link(nil, href: group_delete_path).click
        end.to change { course.groups.count }.by(-1)

        expect(page).to have_selector('div',
                                      text: I18n.t('course.groups.destroy.success'))
      end
    end

    context 'As a Group Manager' do
      let(:group) { create(:course_group, course: course) }
      let(:user) { create(:course_group_manager, course: course, course_group: group).user }

      scenario 'I can view the Group Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.groups.sidebar_title')
      end

      scenario 'I can edit my group' do
        visit edit_course_group_path(course, group)
        new_name = 'New Group'

        fill_in 'group_name', with: ''
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'group_name', with: new_name
        click_button 'update'
        expect(page).to have_selector('div', text: I18n.t('course.groups.update.success'))
        expect(group.reload.name).to eq(new_name)
      end

      scenario 'I can delete my group' do
        delete_path = course_group_path(course, group)

        visit course_groups_path(course)

        expect do
          find_link(nil, href: delete_path).click
        end.to change { course.groups.count }.by(-1)

        expect(page).to have_selector('div', text: I18n.t('course.groups.destroy.success'))
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      scenario 'I cannot view the Group Sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'course.groups.sidebar_title')
      end
    end
  end
end
