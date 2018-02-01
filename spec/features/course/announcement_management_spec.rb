# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Announcements' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:not_started_announcement) { create(:course_announcement, :not_started, course: course) }
    let!(:valid_announcement) { create(:course_announcement, course: course) }
    let!(:ended_announcement) { create(:course_announcement, :ended, course: course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As an Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create new announcements' do
        visit new_course_announcement_path(course)
        click_button I18n.t('helpers.submit.announcement.create')
        expect(page).to have_button(I18n.t('helpers.submit.announcement.create'))
        expect(page).to have_css('div.has-error')

        announcement = build_stubbed(:course_announcement, course: course)
        fill_in 'announcement_title',    with: announcement.title
        fill_in 'announcement_content',  with: announcement.content
        expect do
          click_button I18n.t('helpers.submit.announcement.create')
        end.to change(course.announcements, :count).by(1)

        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.announcements.create.success'))
        expect(current_path).to eq(course_announcements_path(course))
      end

      scenario 'I can edit announcements' do
        announcement = create(:course_announcement, course: course)
        time_zone = user.time_zone || Application.config.x.default_user_time_zone
        visit edit_course_announcement_path(course, announcement)

        expect(page).to have_field('announcement_title', with: announcement.title)
        expect(page).to have_field('announcement_content', with: announcement.content)
        expect(page).to have_field('announcement[start_at]',
                                   with: announcement.start_at.in_time_zone(time_zone))
        expect(page).to have_field('announcement[end_at]',
                                   with: announcement.end_at.in_time_zone(time_zone))

        fill_in 'announcement_title', with: ''
        click_button I18n.t('helpers.submit.announcement.update')
        expect(page).to have_button('helpers.submit.announcement.update')
        expect(page).to have_css('div.has-error')

        new_title = 'New Title'
        new_content = 'New content'
        fill_in 'announcement_title',        with: new_title
        fill_in 'announcement_content',      with: new_content
        click_button I18n.t('helpers.submit.announcement.update')

        expect(current_path).to eq course_announcements_path(course)
        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.announcements.update.success'))
        expect(announcement.reload.title).to eq(new_title)
        expect(announcement.reload.content).to eq(new_content)
      end

      scenario 'I can see all existing announcements' do
        visit course_announcements_path(course)
        expect(page).to have_link(nil, href: new_course_announcement_path(course))

        [not_started_announcement, valid_announcement, ended_announcement].each do |announcement|
          expect(page).to have_content_tag_for(announcement)
          expect(page).to have_link(nil, href: edit_course_announcement_path(course, announcement))
          expect(page).to have_link(nil, href: course_announcement_path(course, announcement))
        end
      end

      scenario 'I can delete an existing announcement' do
        announcement = create(:course_announcement, course: course)
        visit course_announcements_path(course)

        expect do
          find_link(nil, href: course_announcement_path(course, announcement)).click
        end.to change(course.announcements, :count).by(-1)
        expect(current_path).to eq(course_announcements_path(course))
        expect(page).to have_selector('div.alert.alert-success',
                                      text: I18n.t('course.announcements.destroy.success'))
      end
    end

    context 'As an Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Announcement Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.announcements.sidebar_title')
      end

      scenario 'I can see the started announcements' do
        visit course_announcements_path(course)
        expect(page).not_to have_link(nil, href: new_course_announcement_path(course))

        [valid_announcement, ended_announcement].each do |announcement|
          expect(page).to have_content_tag_for(announcement)
          expect(page).
            not_to have_link(nil, href: edit_course_announcement_path(course, announcement))
          expect(page).not_to have_link(nil, href: course_announcement_path(course, announcement))
        end

        expect(page).to have_no_content_tag_for(not_started_announcement)
      end
    end
  end
end
