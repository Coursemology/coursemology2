# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Groups', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:group_category1) { create(:course_group_category, course: course) }
    let!(:group_category2) { create(:course_group_category, course: course) }
    let!(:groups) { create_list(:course_group, 3, group_category: group_category1) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the Group Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_text(I18n.t('course.groups.sidebar_title'))
      end

      scenario 'I can view all the group categories in course' do
        visit course_group_category_path(course, group_category1)

        expect(page).to have_selector('h5', text: 'Groups')

        expect(page).to have_selector('h3', text: group_category1.name)
        expect(page).to have_link(group_category2.name, href: course_group_category_path(course, group_category2))

        click_link group_category2.name

        expect(page).to have_selector('h3', text: group_category2.name)
        expect(page).to have_link(group_category1.name, href: course_group_category_path(course, group_category1))
      end

      scenario 'I can view all the groups under a group category' do
        visit course_group_category_path(course, group_category1)

        groups.each do |group|
          expect(page).to have_selector('h3', text: group.name)
        end
      end

      # scenario 'I can create a group category' do
      #   visit course_group_category_path(course, group_category1)
      #   expect(page).to have_text('NEW CATEGORY')

      #   click_on 'NEW CATEGORY'

      #   fill_in 'name', with: 'Group Category Name'
      #   fill_in 'description', with: 'Random description'

      #   click_button 'submit'

      #   wait_for_ajax

      #   expect(page).to have_selector('h3', text: 'Group Category Name')
      #   expect(page).to have_selector('div', text: 'Random description')
      #   expect(course.reload.group_categories.count).to eq(3)
      # end

      # let!(:course_users) { create_list(:course_student, 3, course: course) }
      # let(:sample_course_user) { course_users.sample }

      # scenario 'I can create a group' do
      #   visit new_course_group_path(course)

      #   click_button 'create'
      #   expect(page).to have_css('div.has-error')

      #   fill_in 'group_name', with: 'Group name'

      #   within '#group_course_user_ids' do
      #     find("option[value='#{sample_course_user.id}']").select_option
      #   end

      #   click_button 'create'
      #   expect(sample_course_user.groups.count).to eq(1)
      # end

      # let(:group) { create(:course_group, course: course) }
      # scenario 'I cannot set the group title to empty' do
      #   visit edit_course_group_path(course, group)

      #   fill_in 'group_name', with: ''
      #   click_button 'update'
      #   expect(page).to have_css('div.has-error')
      # end

      # let!(:group_to_delete) { create(:course_group, course: course) }
      # scenario 'I can delete a group' do
      #   group_delete_path = course_group_path(course, group_to_delete)

      #   visit course_groups_path(course)

      #   expect do
      #     find_link(nil, class: 'delete', href: group_delete_path).click
      #   end.to change { course.groups.count }.by(-1)

      #   expect(page).to have_selector('div',
      #                                 text: I18n.t('course.groups.destroy.success'))
      # end
    end

    context 'As a Group Manager' do
      let(:group) { create(:course_group, course: course) }
      let(:course_group_manager) do
        create(:course_group_manager, course: course, group: group)
      end
      let(:user) { course_group_manager.course_user.user }

      scenario 'I can view the Group Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_text(I18n.t('course.groups.sidebar_title'))
      end

      # scenario 'I can edit my group' do
      #   visit edit_course_group_path(course, group)
      #   new_name = 'New Group'

      #   fill_in 'group_name', with: ''
      #   click_button 'update'
      #   expect(page).to have_css('div.has-error')

      #   fill_in 'group_name', with: new_name
      #   click_button 'update'
      #   expect(page).to have_selector('div', text: I18n.t('course.groups.update.success'))
      #   expect(group.reload.name).to eq(new_name)
      # end

      # scenario 'I can delete my group' do
      #   delete_path = course_group_path(course, group)

      #   visit course_groups_path(course)

      #   expect do
      #     find_link(nil, class: 'delete', href: delete_path).click
      #   end.to change { course.groups.count }.by(-1)

      #   expect(page).to have_selector('div', text: I18n.t('course.groups.destroy.success'))
      # end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot view the Group Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).not_to have_text(I18n.t('course.groups.sidebar_title'))
      end
    end
  end
end
